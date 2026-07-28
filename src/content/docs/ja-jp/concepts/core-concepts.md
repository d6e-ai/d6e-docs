---
title: コアコンセプト
description: ワークスペース・SQL・ポリシー・ワークフロー・認証・埋め込みなど、d6e を外部から扱うときの基本概念。
---

d6e を API / MCP / カスタムフロントエンドから使うときに押さえる単位です。インスタンス上の**ワークスペース**が境界になり、その中でテーブル・ポリシー・ワークフローが閉じます。

## 全体像

```
Workspace（分離の最上位）
├─ Tables（SQL / ポリシー適用）
├─ Policies & Policy Groups
├─ Workflows
│   ├─ STF steps（計算）
│   └─ Effect steps（外部 HTTP）
├─ Files & Embeddings
└─ Members（admin / member）
```

公開 API の入口はインスタンスの `/api/v1/*` です。詳細なエンドポイント一覧は [REST API](/ja-jp/reference/rest-api/) を参照してください。

---

## Workspace

**ワークスペース**はデータの分離単位です。テーブル・ワークフロー・ポリシー・ファイルはすべてワークスペースにスコープされます。別ワークスペースの行や定義は見えません。

| 項目 | 内容 |
|---|---|
| ロール | `admin` / `member` |
| API キー | ユーザーに紐づく。キー所有者のメンバーシップを継承する |
| DDL 権限 | ワークスペース admin、または `ddl_policy_group` に属する主体 |

メンバー追加・招待はパス付きの `/api/v1/workspaces/{id}/members` 系で行います。API キーは「キーそのものにワークスペースが埋め込まれている」のではなく、**キー所有者のユーザーがどのワークスペースに属しているか**でアクセス範囲が決まります。

---

## SQL

ワークスペース内のテーブルに対して、直接 SQL を実行できます。

```
POST /api/v1/workspaces/{id}/sql
Authorization: Bearer <token>
Content-Type: application/json

{ "sql": "SELECT * FROM invoices WHERE status = 'open'" }
```

### 論理名と物理プレフィックス

クエリでは**論理テーブル名**（例: `invoices`）を書きます。実行時に自動でワークスペース用プレフィックスが付きます。

| ルール | 詳細 |
|---|---|
| 論理名の最大長 | **23 文字** |
| 物理名の形 | `ws_{workspace_id}_` + 論理名 |
| 1 リクエスト | **1 ステートメントのみ** |

```sql
-- あなたが書く SQL（論理名）
SELECT id, amount FROM invoices;

-- 実行時に書き換えられるイメージ
SELECT id, amount FROM …ws_<id>_invoices…;
```

### システム列

`CREATE TABLE` 時、次のシステム列が付与されます。

| 列 | 役割 |
|---|---|
| `id` | 主キー（UUIDv7 推奨） |
| `created_at` | 作成日時 |
| `updated_at` | 更新日時 |
| `deleted_at` | 論理削除用。`DELETE` はソフトデリートになる |

プレビュー用の `POST …/sql/preview` もあります。プレビューは変換後 SQL の確認向けで、**実行時ポリシーは評価しません**。認可の最終判定は execute 側です。

DDL（`CREATE` / `ALTER` / `DROP` など）は **admin**、またはワークスペースに設定された **DDL ポリシーグループ**のメンバーだけが実行できます。権限がない場合は `DDL_FORBIDDEN` になります。

---

## Policy

行・操作単位のアクセス制御です。**デフォルトは拒否**です。明示的に許可された操作だけが通ります。

評価の優先順位はおおまかに次のとおりです。

1. **deny** にマッチしたら拒否
2. それ以外で **allow** にマッチしたら許可
3. どちらにも当てはまらなければ拒否（デフォルト）

```
リクエスト（誰 × どの表 × どの操作 × どの行）
        │
        ▼
   deny に当たる？ ──yes──► 拒否（POLICY_DENIED）
        │ no
        ▼
   allow に当たる？ ──yes──► 許可
        │ no
        ▼
      拒否（デフォルト）
```

### Policy Group

ポリシーは単体のユーザーではなく **Policy Group** に紐づきます。グループは次を持てます。

| フィールド | 意味 |
|---|---|
| `user_ids` | グループに属するユーザー |
| `stf_ids` | グループに属する STF（自動化実行主体） |

人間の操作はユーザーとして、ワークフロー内の STF 実行は STF として評価されます。同じテーブルでも「画面の利用者」と「バッチ用 STF」で別グループを割り当てられます。

### condition

ポリシーには任意の **condition**（JSON フィルタ）を付けられます。条件に合う行だけ allow / deny の対象になります。condition は実行時に SQL 側へ注入され、呼び出し側が WHERE を省略してもサーバが絞り込みます。

代表的な `operation` 例:

| operation | 対象 |
|---|---|
| `select` / `insert` / `update` / `delete` | SQL DML |
| `ddl` | スキーマ変更 |
| `storage_read` / `storage_write` | ファイル |

ポリシー違反の execute は `403` + `POLICY_DENIED` です（未ログインの 401 とは区別してください）。

---

## Workflow / STF / Effect

**Workflow** は名前付きの自動化グラフです。主に次のステップを組み合わせます。

| ステップ種別 | 役割 |
|---|---|
| **STF** | 計算・変換・業務ロジック |
| **Effect** | 外部 HTTP 呼び出し（プリセット定義） |

```
[Input]
   │
   ▼
[STF] ── 集計・検証・整形 ──┐
   │                        │
   ▼                        ▼
[Effect] ── Webhook / SaaS API へ POST
   │
   ▼
[Output]
```

### STF（State Transition Function）

| ランタイム | 用途の目安 |
|---|---|
| JavaScript（QuickJS） | 軽い変換・バリデーション |
| Docker | 任意言語・重い処理・明示的な依存 |

ワークフローに載せず、単体で試すときは **instant-run** を使います。

```
POST /api/v1/stfs/instant-run
Authorization: Bearer <token>
X-Workspace-ID: <workspace-uuid>

{
  "stf_version_id": "<uuid>",
  "input": { "amount": 1200 }
}
```

Docker STF の作り方は [Docker STF 開発](/ja-jp/guides/docker-stf/) を参照してください。

### Effect

Effect はメソッド・URL・ヘッダ・ボディ対応を持つ **HTTP 呼び出しの定義**です。ワークフローの Effect ステップから参照し、外部 API や Webhook へ副作用を送ります。

---

## Auth

公開 API への呼び出しは `Authorization: Bearer …` が基本です。

| 資格情報 | 形の目安 | 典型的な用途 |
|---|---|---|
| セッショントークン | `ses_*` | ログインセッション |
| API キー | `d6e_*` | ローカル AI / 自動化 / サーバ間 |
| JWT | OAuth 交換後のアクセストークン | カスタムフロントエンド |

一部のエンドポイントはパスだけではワークスペースが決まらず、次のヘッダが必須です。

```
X-Workspace-ID: <workspace-uuid>
```

例: ワークフロー実行、STF / Effect、ポリシー CRUD、一部のファイル操作。  
一方、SQL やメンバー API のようにパスの `{id}` でワークスペースが決まる系統もあります。足りないヘッダは多くの場合 `400 Missing X-Workspace-ID` になります。

認証の流れの全体像は [アーキテクチャ](/ja-jp/getting-started/architecture/) を参照してください。

---

## Embeddings

セマンティック検索用のベクトル埋め込みです。モデル経路はインスタンス側（Gemini 系モデル + pgvector）で、カスタムアプリにプロバイダ API キーを置く必要はありません。

| 面 | 対象 | 完了の仕方 |
|---|---|---|
| **Column** | SQL テーブルのテキスト列 | 同期（generate が完了まで待つ） |
| **File** | アップロード済みファイル | **非同期**（status をポーリング） |
| **Table row** | テーブル行の JSON 表現 | **非同期**（status をポーリング） |

```
アップロード / 行更新
        │
        ▼
  embed リクエスト
        │
   ┌────┴────┐
   │ sync    │ async（file / table）
   │ column  │  → pending → processing → completed
   └────┬────┘
        ▼
   ベクトル検索（類似度）
```

ファイル / テーブルは `completed` になるまで検索しないでください。列埋め込みは generate レスポンスの件数で完了を確認します。

---

## 関連リンク

- [REST API](/ja-jp/reference/rest-api/)
- [MCP ツール](/ja-jp/reference/mcp-tools/)
- [アーキテクチャ](/ja-jp/getting-started/architecture/)
- [設計思想](/ja-jp/getting-started/design-philosophy/)
- [Docker STF 開発](/ja-jp/guides/docker-stf/)
- [カスタムフロントエンド](/ja-jp/guides/custom-frontend/)
- [ローカル AI 開発](/ja-jp/guides/local-ai-development/)
