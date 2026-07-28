---
title: REST API
description: 公開開発者向け `/api/v1` REST エンドポイントのカテゴリ別リファレンス。
---

## 概要

d6e インスタンスの公開 HTTP API は `/api/v1/*` です。JWT または API キー（`d6e_*`）を `Authorization: Bearer` で送ります。ワークスペースの解決方法はルート形状によって異なります（下表）。

このページは公開開発者向けの REST のみを扱います。内部向け admin API（`X-Admin-Token`）は含めません。

## 認証

| ルート形状 | ワークスペースの解決 | `X-Workspace-ID` |
| --- | --- | --- |
| `/workspaces/{id}/sql`, `/members`, `/invitations`, `/embeddings`, `/setup/*`, `/redirect-uris` | Path `{id}` + メンバーシップ | 任意（送る場合は path と一致必須） |
| `/workspaces/{id}/files/*`, `/documents/*` | **ヘッダのみ**（path `{id}` は無視） | **必須** |
| `/workflows`, `/stfs`, `/effects`, `/policies`, `/policy-groups`, `/pinned-charts`, `/audit-logs` | ヘッダのみ | **必須** |
| `/saas-proxy`, `/saas-proxy-download`, `/drive-sync/*` | body / query の `workspace_id` | 未使用 |
| `/api-keys` | N/A | 不要（セッション JWT のみ） |

| ヘッダ | 説明 |
| --- | --- |
| `Authorization: Bearer <token>` | セッション JWT または API キー `d6e_*` |
| `X-Workspace-ID: <uuid>` | ヘッダ解決ルートで必須。path 解決ルートでは任意 |

## Auth

| Method | Path | Auth | 説明 |
| --- | --- | --- |
| GET | `/api/v1/auth/me` | Bearer | 現在のユーザー情報 |
| POST | `/api/v1/auth/token` | なし | OAuth トークン交換（インスタンスが d6e-auth へプロキシ） |

### GET `/api/v1/auth/me`

```json
{ "id": "<uuid>", "email": "user@example.com", "name": "Alice" }
```

### POST `/api/v1/auth/token`

許可する `grant_type` は `authorization_code` と `refresh_token` のみです（`client_credentials` は拒否）。`client_id` / `client_secret` はサーバー側で付与されます。

```json
{
  "grant_type": "authorization_code",
  "code": "...",
  "redirect_uri": "https://app.example.com/callback"
}
```

成功時（d6e-auth 透過）:

```json
{
  "access_token": "<jwt>",
  "refresh_token": "<jwt>",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

## Workspaces / Members / Invitations / Redirect URIs

### Workspaces

| Method | Path | Auth | 説明 |
| --- | --- | --- |
| GET | `/api/v1/workspaces` | Bearer | 呼び出し元が参加するワークスペース一覧 |
| POST | `/api/v1/workspaces` | Bearer（**セッションのみ**） | 作成。scoped JWT / API キーは不可 |
| GET | `/api/v1/workspaces/{id}` | Bearer（member） | 詳細取得 |
| PATCH | `/api/v1/workspaces/{id}` | Bearer（admin） | 名前・ポリシーグループ・設定の更新 |
| DELETE | `/api/v1/workspaces/{id}` | Bearer（admin） | ソフト削除（204） |

**POST body:** `{ "name": "New workspace" }`（1–255 文字）

**PATCH body（任意）:** `name`, `ddl_policy_group_id`, `workflow_editor_policy_group_id`, `policy_editor_policy_group_id`, `mcp_timeout_ms`（30000–3600000）, `custom_prompt`, `auto_embed_files`, `auto_embed_tables`

### Members

| Method | Path | Auth | 説明 |
| --- | --- | --- |
| GET | `/api/v1/workspaces/{id}/members` | member | メンバー一覧 |
| POST | `/api/v1/workspaces/{id}/members` | admin | 追加または招待キュー |
| PATCH | `/api/v1/workspaces/{id}/members/{memberId}` | admin | ロール変更 |
| DELETE | `/api/v1/workspaces/{id}/members/{memberId}` | admin | 削除（204） |

**POST:** `{ "email": "…", "role": "member" | "admin" }`

最後の admin の降格・削除は `400` / `LAST_ADMIN` になります。

### Invitations

| Method | Path | Auth | 説明 |
| --- | --- | --- |
| GET | `/api/v1/workspaces/{id}/invitations` | admin | 保留中の招待一覧 |
| DELETE | `/api/v1/workspaces/{id}/invitations/{invitationId}` | admin | 招待キャンセル |

### Redirect URIs

すべて admin。HTTPS 必須・fragment 禁止・最大 2000 文字。

| Method | Path | 説明 |
| --- | --- | --- |
| GET | `/api/v1/workspaces/{id}/redirect-uris` | 一覧（`{ "items": [...] }`） |
| POST | `/api/v1/workspaces/{id}/redirect-uris` | `{ "redirect_uri": "https://…" }` |
| DELETE | `/api/v1/workspaces/{id}/redirect-uris` | body に `redirect_uri`（204） |

## SQL

| Method | Path | Auth | 説明 |
| --- | --- | --- |
| POST | `/api/v1/workspaces/{id}/sql` | Bearer（path ws） | SQL 実行（ポリシー・DDL 検査あり） |
| POST | `/api/v1/workspaces/{id}/sql/preview` | Bearer（path ws） | 変換プレビュー（ポリシー未評価） |

**Request:** `{ "sql": "<single statement>" }`（複数文は不可）

論理テーブル名は最大 23 文字。主キーは `uuidv7()` を推奨します。`GET …/tables` は存在しません。テーブル一覧は `information_schema` への SQL で取得してください。

### 操作権限

| 操作 | 権限 |
| --- | --- |
| DDL | ワークスペース admin、または `ddl_policy_group_id` 所属 |
| DML（SELECT / INSERT / UPDATE / DELETE） | 行レベルポリシー（allow / deny + condition） |
| Soft delete | `deleted_at` 列があるテーブルの DELETE は soft delete 化 |

### レスポンス例

**SELECT:**

```json
{
  "rows": [{ "id": "018e…", "amount": 1200 }],
  "executed_sql": "SELECT … FROM user_data.ws_…_invoices …"
}
```

**DML / DDL:**

```json
{ "affected_rows": 3, "executed_sql": "…" }
```

**Preview（ポリシー未評価）:**

```json
{
  "proposal_id": "…",
  "original_sql": "UPDATE invoices SET …",
  "transformed_sql": "UPDATE user_data.ws_…_invoices SET …",
  "operation": "update",
  "affected_tables": ["invoices"],
  "requires_approval": true
}
```

`requires_approval` は SELECT 以外で `true` です。

### エラーコード

| Code | HTTP | 意味 |
| --- | --- | --- |
| `PARSE_ERROR` | 400 | SQL 構文エラー |
| `INVALID_TABLE` | 400 | テーブル名不正（長さなど） |
| `UNSUPPORTED` | 400 | 未対応の文 |
| `SCHEMA_ACCESS_DENIED` | 400 | スキーマアクセス拒否 |
| `TRANSACTION_NOT_ALLOWED` | 400 | トランザクション禁止 |
| `MULTIPLE_STATEMENTS` | 400 | 複数文禁止 |
| `EXECUTION_ERROR` | 400 | DB 実行エラー |
| `POLICY_DENIED` | 403 | ポリシー拒否（認証失敗ではない） |
| `DDL_FORBIDDEN` / `DDL_NOT_ALLOWED` | 403 | DDL 権限なし |
| `FORBIDDEN` | 403 | 非メンバー |
| `NOT_FOUND` | 404 | ワークスペースなし |

## Storage Files

すべて `Authorization: Bearer` + **`X-Workspace-ID` 必須**（path `{id}` は無視）。上限 1 GB（超過時 413）。

| Method | Path | 説明 |
| --- | --- | --- |
| GET | `/api/v1/workspaces/{id}/files` | メタデータ一覧（BYTEA なし） |
| GET | `/api/v1/workspaces/{id}/files/{fileId}` | メタデータ取得 |
| GET | `/api/v1/workspaces/{id}/files/{fileId}/download` | バイナリダウンロード |
| POST | `/api/v1/workspaces/{id}/files` | JSON base64 アップロード |
| POST | `/api/v1/workspaces/{id}/files/multipart` | multipart（`file` + 任意 `metadata`） |
| DELETE | `/api/v1/workspaces/{id}/files/{fileId}` | ソフト削除 |

**JSON upload:**

```json
{
  "filename": "report.pdf",
  "content_type": "application/pdf",
  "content": "<base64>",
  "metadata": {}
}
```

**UploadResponse:** `{ "id", "filename", "content_type", "size", "created_at" }`

アップロード・削除は StorageFile editor（`workflow_editor_policy_group_id` と共有）が必要です。`auto_embed_files` が有効な場合は非同期で埋め込みが開始されます。

## Documents

Bearer + **`X-Workspace-ID` 必須**（path `{id}` は無視）。コンテンツは Markdown のみ。

| Method | Path | 説明 |
| --- | --- | --- |
| GET | `/api/v1/workspaces/{id}/documents` | 一覧（`?doc_type=&status=`、content なし） |
| POST | `/api/v1/workspaces/{id}/documents` | 作成 |
| GET | `/api/v1/workspaces/{id}/documents/{docId}` | 取得（content 付き） |
| PATCH | `/api/v1/workspaces/{id}/documents/{docId}` | 更新（content 変更時に version スナップショット） |
| DELETE | `/api/v1/workspaces/{id}/documents/{docId}` | ソフト削除 |
| GET | `/api/v1/workspaces/{id}/documents/{docId}/versions` | バージョン履歴 |

**Create:** `{ "title", "doc_type", "status", "content", "metadata?" }`

## Embeddings

Path 解決（`X-Workspace-ID` 任意）。クライアント側に Gemini / OpenAI キーは不要です（インスタンス側で設定）。

### Column（同期）

| Method | Path | 説明 |
| --- | --- | --- |
| POST | `/api/v1/workspaces/{id}/embeddings/generate` | `{ "table_name", "column_name" }` → `{ "generated_count", "column_added" }` |
| GET | `/api/v1/workspaces/{id}/embeddings/status?table_name=` | 列埋め込み状態 |
| POST | `/api/v1/workspaces/{id}/embeddings/similarity-search` | `{ "table_name", "column_name", "query", "limit?" }` |

### Files（非同期）

| Method | Path | 説明 |
| --- | --- | --- |
| POST | `/api/v1/workspaces/{id}/embeddings/files/embed` | `{ "file_ids": [...] }`（必須・最大 50） |
| GET | `/api/v1/workspaces/{id}/embeddings/files/status` | pending / processing / completed / failed / skipped |
| POST | `/api/v1/workspaces/{id}/embeddings/files/search` | `{ "query", "limit?" }` |
| POST | `/api/v1/workspaces/{id}/embeddings/files/regenerate` | `{ "file_ids" }` |

### Tables（非同期）

| Method | Path | 説明 |
| --- | --- | --- |
| POST | `/api/v1/workspaces/{id}/embeddings/tables/embed` | `{ "table_names": [...] }` |
| GET | `/api/v1/workspaces/{id}/embeddings/tables/status` | 状態確認 |
| POST | `/api/v1/workspaces/{id}/embeddings/tables/search` | `{ "query", "limit?" }` |
| POST | `/api/v1/workspaces/{id}/embeddings/tables/regenerate` | 強制再生成 |

| 操作 | 権限 |
| --- | --- |
| generate / tables embed | DDL |
| files embed | storage editor |
| status / search | member |

オペレータ設定不足時: `503 EMBEDDING_NOT_CONFIGURED`, `503 MODEL_NOT_MULTIMODAL`, `502 EMBEDDING_API_ERROR`

## Workspace Setup

Base: `/api/v1/workspaces/{id}/setup/*`（path 解決）

| Resource | Methods | Auth | 説明 |
| --- | --- | --- | --- |
| `/prompt-rules` | GET / POST | GET: member、POST: admin | プロンプトルール |
| `/prompt-rules/{ruleId}` | PATCH / DELETE | admin | 更新・削除 |
| `/skills` | GET / POST | admin | ワークスペーススキル |
| `/skills/{skillId}` | GET / PATCH / DELETE | admin | スキル CRUD |
| `/title-rule` | GET / PUT / DELETE | GET: member、PUT/DELETE: admin | チャットタイトル規則 |
| `/chat-templates` | GET / POST | admin | チャットテンプレート |
| `/chat-templates/{id}` | GET / PATCH / DELETE | admin | テンプレート CRUD |
| `/chat-templates/{id}/activate` | POST | admin | 1 件を有効化 |
| `/chat-templates/deactivate` | POST | admin | 全件無効化 |
| `/dashboard-enabled` | GET / PUT | GET: member、PUT: admin | `{ "enabled": bool }` |
| `/saas-credentials` | GET | member | 接続済みプロバイダ（非シークレット） |

**Prompt rule create:** `{ "content": "…" }`（最大 50k）  
**Title rule PUT:** `{ "content": "…" }`（空なら削除、最大 2000）

## Workflows

CRUD は Bearer + **`X-Workspace-ID` 必須**。  
**Execute** は `X-Workspace-ID` **必須**、`Authorization` は**任意**。

| Method | Path | 説明 |
| --- | --- | --- |
| GET | `/api/v1/workflows` | 一覧 |
| POST | `/api/v1/workflows` | 作成 |
| GET | `/api/v1/workflows/{id}` | 取得 |
| PATCH | `/api/v1/workflows/{id}` | 更新 |
| DELETE | `/api/v1/workflows/{id}` | ソフト削除 |
| POST | `/api/v1/workflows/{id}/execute` | 実行。body = workflow `$input` JSON |

レスポンスは最後の STF ステップ出力です。名前検索 API はないため、一覧して `name` でマッチしてください。Docker STF を含む場合はタイムアウト 120 秒以上を推奨します。

## STFs

Bearer + `X-Workspace-ID`（`stf-libraries` 以外は必須）

| Method | Path | 説明 |
| --- | --- | --- |
| GET / POST | `/api/v1/stfs` | 一覧 / 作成 |
| GET / PATCH / DELETE | `/api/v1/stfs/{id}` | 取得 / 更新 / ソフト削除 |
| GET / POST | `/api/v1/stfs/{id}/versions` | バージョン一覧 / 追加 |
| POST | `/api/v1/stfs/{id}/describe` | スキーマ推定 `{ "version"?: "1.0.0" }` |
| POST | `/api/v1/stfs/instant-run` | ワークフローなしで実行 `{ "stf_version_id", "input" }` |
| GET / POST | `/api/v1/stfs/{stfId}/secrets` | シークレットキー名一覧 / upsert `{ "env_key", "value" }` |
| DELETE | `/api/v1/stfs/{stfId}/secrets/{envKey}` | シークレット削除 |
| GET | `/api/v1/stf-libraries` | 共有ライブラリ一覧（Bearer のみ） |
| GET | `/api/v1/stf-libraries/{name}/types` | TypeScript 型定義（Bearer のみ） |

**Create:**

```json
{
  "name": "hello",
  "description": "optional",
  "is_public": false,
  "version": "1.0.0",
  "runtime": "javascript",
  "code": "<base64>",
  "input_schema": {},
  "output_schema": {}
}
```

`runtime` は `"javascript"` | `"docker"` | `"wasm"`。Secrets の list はキー名のみ（値は write-only）。

## Effects

Bearer + `X-Workspace-ID`

| Method | Path | 説明 |
| --- | --- | --- |
| GET / POST | `/api/v1/effects` | 一覧 / 作成 |
| GET / PATCH / DELETE | `/api/v1/effects/{id}` | 取得 / 更新 / ソフト削除 |
| GET / POST | `/api/v1/effects/{id}/versions` | バージョン一覧 / 追加 |

**Create の主なフィールド:** `name`, `version`, `url`, `method`, `header_mappings[]`, `body_mappings[]`, `query_mappings?`, `input_schema?`

FieldMapping: `{ "source": { "type": "Variable" | "Const", "value": "…" }, "target": "…" }`

## Policies / Policy Groups

Bearer + `X-Workspace-ID`。POST / PATCH / DELETE は `policy_editor_policy_group_id` 所属が必要（null なら制限なし）。

### Policies

| Method | Path |
| --- | --- |
| GET / POST | `/api/v1/policies` |
| GET / PATCH / DELETE | `/api/v1/policies/{id}` |

| フィールド | 値 | 説明 |
| --- | --- | --- |
| `mode` | `allow` \| `deny` | 許可または拒否 |
| `operation` | `select` \| `insert` \| `update` \| `delete` | 行レベル操作のみ。DDL・storage 編集はこの enum ではない |
| `condition` | modql JSON | `$eq` `$ne` `$gt` `$gte` `$lt` `$lte` `$in` `$null`。プレースホルダ `"$user_id"`。単純形 `{ "field": "value" }` 可。AND 結合 |

ポリシーが無い場合は deny all です。DDL は `ddl_policy_group_id`、storage / workflow 編集は `workflow_editor_policy_group_id` で制御します。

**作成例:**

```json
{
  "name": "sales-read-own",
  "policy_group_id": "<uuid>",
  "mode": "allow",
  "table_name": "leads",
  "operation": "select",
  "condition": { "owner_id": { "$eq": "$user_id" } }
}
```

### Policy Groups

| Method | Path |
| --- | --- |
| GET / POST | `/api/v1/policy-groups` |
| GET / PATCH / DELETE | `/api/v1/policy-groups/{id}` |

**Create:** `{ "name": "Finance editors", "user_ids": ["…"], "stf_ids": ["…"] }`  
PATCH の `user_ids` / `stf_ids` は**全置換**です。

## API Keys

セッション JWT のみ（API キーや scoped JWT では管理不可）。

| Method | Path | 説明 |
| --- | --- | --- |
| GET | `/api/v1/api-keys` | 呼び出し元のキー一覧（メタデータのみ） |
| POST | `/api/v1/api-keys` | 作成。raw キーは一度だけ返却 |
| DELETE | `/api/v1/api-keys/{id}` | 失効 |

**POST:** `{ "name": "local dev", "expires_at"?: "…" }`

**201:**

```json
{ "id": "…", "key": "d6e_…" }
```

## Audit Logs / Pinned Charts

### Audit Logs

| Method | Path | Auth | 説明 |
| --- | --- | --- |
| GET | `/api/v1/audit-logs` | Bearer + X-Workspace-ID | 監査ログ一覧 |

**Query:** `user_id`, `action`（`execute_sql*` のような末尾 `*` プレフィックス一致）, `resource_type`, `resource_id`, `limit`（default 100, max 1000）, `offset`

### Pinned Charts

| Method | Path | Auth | 説明 |
| --- | --- | --- |
| GET | `/api/v1/pinned-charts` | Bearer + X-Workspace-ID | 表示中チャート一覧（`is_visible=true`） |
| POST | `/api/v1/pinned-charts` | Bearer + X-Workspace-ID | 作成 |
| GET / PATCH / DELETE | `/api/v1/pinned-charts/{id}` | Bearer + X-Workspace-ID | 取得 / 更新 / ソフト削除 |

**Create:** `{ "title", "sql_query", "chart_type", "x_axis_column?", "y_axis_columns?", "display_order?", "description?" }`

データ取得は別途 `POST …/sql` で `sql_query` を実行してください。

## Drive Sync

`workspace_id` は query（GET）または body（書き込み）。`X-Workspace-ID` は未使用。要 `google_workspace` credential。

| Method | Path | 説明 |
| --- | --- | --- |
| GET | `/api/v1/drive-sync/status?workspace_id=` | 同期状態 + roots + node_count |
| GET / PUT | `/api/v1/drive-sync/config` | 設定取得 / 更新（PUT は body に `workspace_id`） |
| GET / POST | `/api/v1/drive-sync/roots` | ルート一覧 / 追加 |
| DELETE | `/api/v1/drive-sync/roots/{rootId}?workspace_id=` | ルート削除 |
| POST | `/api/v1/drive-sync/sync` | バックグラウンド同期を開始（即 return → status をポーリング） |
| POST | `/api/v1/drive-sync/materialize` | `{ workspace_id, drive_file_id }` → storage へコピー |
| POST | `/api/v1/drive-sync/read` | Drive ファイル内容の読み取り |
| GET | `/api/v1/drive-sync/picker?workspace_id=&parent=&shared_drives=` | フォルダピッカー |

**Add root:** `{ workspace_id, drive_id, drive_type: "folder" | "shared_drive" | "my_drive", name, shared_drive_id? }`

## SaaS Proxy

どちらも Bearer。`workspace_id` は JSON body。Authorization 等の上書きは不可。

### POST `/api/v1/saas-proxy`

```json
{
  "workspace_id": "<UUID>",
  "provider": "google_workspace",
  "method": "GET",
  "path": "/drive/v3/files?…",
  "headers": {},
  "body": null,
  "file_id": null
}
```

**Response:** `{ "status", "headers", "body" }`。上限 10 MB。リダイレクトは追従しません。

### POST `/api/v1/saas-proxy-download`

同様の body + 任意の `suggested_filename?`, `metadata?`。上限 100 MB。storage editor 必須。HTTPS リダイレクトは追従します。

- 2xx → `{ status, headers, id, filename, content_type, size, created_at }`（storage に保存）
- 非 2xx → `{ status, headers, error_body }`（storage 行なし）

## エラーレスポンス

標準形:

```json
{ "error": "Human-readable message", "code": "ERROR_CODE", "details": "optional" }
```

| HTTP | 典型 code | 用途 |
| --- | --- | --- |
| 400 | `BAD_REQUEST`, `VALIDATION_ERROR`, `LAST_ADMIN`, `PARSE_ERROR` など | 入力不正・バリデーション |
| 401 | `UNAUTHORIZED` | 未認証・無効トークン |
| 403 | `FORBIDDEN`, `POLICY_DENIED`, `DDL_FORBIDDEN` | 権限・ポリシー |
| 404 | `NOT_FOUND` | リソースなし |
| 422 | `RUNTIME_ERROR`（+ `details`） | STF / エンジン実行失敗 |
| 500 | `INTERNAL_ERROR` | サーバー障害 |

その他: `409 CONFLICT`、`413`（サイズ上限）、`502`（上流障害）、`503 EMBEDDING_NOT_CONFIGURED` など。Auth token エンドポイントは OAuth 風 `{ "error": "…" }` を返すことがあります。

## 関連

同等の操作を MCP から行う場合は [MCP ツール](/reference/mcp-tools/) を参照してください。
