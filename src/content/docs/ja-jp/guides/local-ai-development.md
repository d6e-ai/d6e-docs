---
title: ローカル AI 開発
description: Cursor / Claude Code / Codex をインスタンスの MCP サーバーに接続して実ワークスペースで開発する。
---

ローカルの AI コーディングエージェントから**稼働中の d6e インスタンス**に接続し、Plugin やワークスペース資産を開発・テストできます。最後の仕上げまで、専用デプロイは不要です。

核心: **d6e の AI エージェントができることはすべて公開 HTTP API / MCP として提供されている**。内蔵チャットと同じ約 96 個の `d6e_*` ツールを、手元のエージェントから使えます。

```
┌────────────────────┐        ┌────────────────────────────────────┐
│ ローカル AI         │  MCP   │ d6e インスタンス                   │
│ (Cursor / Claude    │───────▶│  MCP :8081/mcp  →  Rust /api/v1/* │
│  Code / Codex)     │  REST  │                 →  PostgreSQL     │
└────────────────────┘───────▶└────────────────────────────────────┘
```

このページは要約です。手順の全文・差分・トラブルシュートは原典を参照してください。

> 原典（正）: [local-ai-development.ja.md](https://github.com/d6e-ai/d6e-plugin-skills/blob/main/docs/local-ai-development.ja.md)

## 1. API キーを発行する（約 1 分）

1. コンソール（`${D6E_BASE_URL}`）にログイン
2. アバター → **APIキー**（`/{locale}/user/api-keys`）
3. キーを作成し、表示された `d6e_…` をコピー（一度きり）

動作確認:

```bash
curl -s ${D6E_BASE_URL}/api/v1/workspaces \
  -H "Authorization: Bearer ${D6E_API_KEY}"
```

API キーはユーザーアカウントに紐づき、ワークスペースメンバーシップを引き継ぎます。ワークスペーススコープのエンドポイントには `X-Workspace-ID` を付けます。

## 2. MCP に接続する（推奨）

インスタンスは MCP を HTTP モードで公開しています（デフォルト **ポート 8081**、パス `/mcp`）。

**Cursor** — `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "d6e": {
      "url": "http://<instance-host>:8081/mcp",
      "headers": { "Authorization": "Bearer d6e_YOUR_API_KEY" }
    }
  }
}
```

接続後、エージェントに次のように指示できます。

- 「現在のワークスペースのテーブル一覧を出して」
- 「この SQL を実行して結果を要約して」
- 「この STF を instant-run して」

ツール一覧は [MCP ツール](/ja-jp/reference/mcp-tools/) を参照してください。

## 3. 何をどこでテストするか

| テストしたいもの | 実行場所 | 方法 |
|---|---|---|
| ワークスペース SQL | リモート（実 DB） | `POST .../sql` または `d6e_sql` |
| JS STF | リモート（QuickJS） | `POST .../stfs/instant-run` または `d6e_instant_run_stf` |
| Docker STF のロジック | **ローカル** `docker run` | stdin/stdout JSON。統合時は `api_url` を実インスタンスへ |
| SaaS 呼び出し | リモート | `POST .../saas-proxy` または `d6e_call_external_api` |
| ワークフロー | リモート | `POST .../workflows/{id}/execute` または `d6e_execute_workflow` |

## 4. Plugin / フロントエンドとの切り分け

- **本ガイドの範囲:** ワークスペースの中身（Plugin）の開発・テスト
- **カスタムフロントエンド:** 独立 Web アプリ。関係の説明は [カスタムフロントエンド](/ja-jp/guides/custom-frontend/) と [frontend-and-instance.ja.md](https://github.com/d6e-ai/d6e-custom-frontend-skills/blob/main/docs/frontend-and-instance.ja.md)

## 次のステップ

- [Plugin 開発](/ja-jp/guides/plugins/)
- [Docker STF 開発](/ja-jp/guides/docker-stf/)
- [REST API](/ja-jp/reference/rest-api/)
