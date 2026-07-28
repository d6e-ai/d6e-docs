---
title: MCP ツール
description: インスタンス MCP サーバーが公開する約 96 個の d6e_* ツールのカテゴリ別リファレンス。
---

## 概要

d6e インスタンスの MCP サーバー（デフォルト `:8081/mcp`）は、**内蔵チャットと同じ面**のツール群を公開します。API キーで接続すれば、ローカルの AI エージェント（Cursor / Claude Code / Codex など）からワークスペース SQL・STF・ワークフロー・埋め込み検索などを操作できます。

接続手順・環境変数・トラブルシュートは [ローカル AI 開発](/guides/local-ai-development/) を参照してください。

## 接続例

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

接続後はまず `d6e_list_workspaces` → `d6e_set_workspace` でワークスペースを選択してから、他のツールを使います。

## カテゴリ別ツール一覧

### Health / Workspace Context

| ツール | 説明 |
| --- | --- |
| `d6e_health` | API サーバーの疎通確認 |
| `d6e_set_workspace` | 以降の操作で使うワークスペース ID を設定する |
| `d6e_get_current_workspace` | 現在選択中のワークスペース ID を返す |

### Workspaces / Members

| ツール | 説明 |
| --- | --- |
| `d6e_list_workspaces` | API キーからアクセス可能なワークスペース一覧 |
| `d6e_get_workspace` | ワークスペース詳細（名前・ポリシーグループ等）を取得 |
| `d6e_create_workspace` | 新しいワークスペースを作成する |
| `d6e_update_workspace` | ワークスペース設定（名前・ポリシー・カスタムプロンプト等）を更新 |
| `d6e_delete_workspace` | ワークスペースをソフト削除する |
| `d6e_list_workspace_members` | ワークスペースメンバー一覧を取得 |
| `d6e_add_workspace_member` | メンバーを追加する（admin / member） |
| `d6e_update_workspace_member` | メンバーのロールを変更する |
| `d6e_remove_workspace_member` | メンバーを削除する |

### SQL

| ツール | 説明 |
| --- | --- |
| `d6e_sql` | ワークスペース内で SQL（DDL / SELECT / INSERT 等）を実行する |

### Embeddings

ファイル・テーブル行の埋め込みは非同期です。`EMBED` → `STATUS` で完了を確認 → `SEARCH` の順で使います。

| ツール | 説明 |
| --- | --- |
| `d6e_generate_embeddings` | TEXT 列のベクトル埋め込みを生成する（同期） |
| `d6e_similarity_search` | 列埋め込みによる意味的類似検索（同期） |
| `d6e_embed_files` | ファイル埋め込みを開始する（非同期） |
| `d6e_file_embedding_status` | ファイル埋め込みの進捗・状態を確認する |
| `d6e_search_files` | 埋め込み済みファイルを内容類似で検索する |
| `d6e_regenerate_file_embeddings` | ファイル埋め込みを強制再生成する |
| `d6e_embed_table_rows` | テーブル行埋め込みを開始する（非同期） |
| `d6e_table_row_embedding_status` | テーブル行埋め込みの進捗・状態を確認する |
| `d6e_search_table_rows` | 埋め込み済み行を横断で意味検索する |
| `d6e_regenerate_table_rows` | テーブル行埋め込みを強制再生成する |

### Workflows

| ツール | 説明 |
| --- | --- |
| `d6e_list_workflows` | ワークフロー一覧を取得する |
| `d6e_get_workflow` | ワークフロー定義（STF / Effect ステップ等）を取得する |
| `d6e_create_workflow` | STF・Effect ステップ付きワークフローを作成する |
| `d6e_update_workflow` | 既存ワークフローを更新する |
| `d6e_delete_workflow` | ワークフローをソフト削除する |
| `d6e_execute_workflow` | 入力データ付きでワークフローを実行する |

### STFs / Libraries

| ツール | 説明 |
| --- | --- |
| `d6e_list_stfs` | State Transition Function（STF）一覧を取得する |
| `d6e_get_stf` | STF メタデータを取得する |
| `d6e_create_stf` | JavaScript / WASM 等のコードで STF を作成する |
| `d6e_update_stf` | STF メタデータ（名前・説明・公開フラグ）を更新する |
| `d6e_delete_stf` | STF をソフト削除する |
| `d6e_list_stf_versions` | STF のバージョン一覧を取得する |
| `d6e_create_stf_version` | 既存 STF に新しいコードバージョンを追加する |
| `d6e_instant_run_stf` | ワークフローなしで STF を即時実行する |
| `d6e_describe_stf` | Docker STF の input_schema / 操作を発見する |
| `d6e_list_stf_libraries` | STF から import 可能なライブラリ一覧を取得する |
| `d6e_get_library_types` | STF ライブラリの TypeScript 型定義（.d.ts）を取得する |

### Effects

| ツール | 説明 |
| --- | --- |
| `d6e_list_effects` | Effect（外部 HTTP 呼び出し）一覧を取得する |
| `d6e_get_effect` | Effect メタデータを取得する |
| `d6e_create_effect` | 新しい Effect を作成する |
| `d6e_update_effect` | Effect メタデータを更新する |
| `d6e_delete_effect` | Effect をソフト削除する |
| `d6e_list_effect_versions` | Effect のバージョン一覧を取得する |
| `d6e_create_effect_version` | 既存 Effect に新しい HTTP 設定バージョンを追加する |

### Policies / Policy Groups

| ツール | 説明 |
| --- | --- |
| `d6e_list_policies` | 行レベルアクセス制御ポリシー一覧を取得する |
| `d6e_get_policy` | ポリシー定義を取得する |
| `d6e_create_policy` | テーブル操作向けポリシーを作成する |
| `d6e_update_policy` | 既存ポリシーを更新する |
| `d6e_delete_policy` | ポリシーをソフト削除する |
| `d6e_list_policy_groups` | ポリシーグループ一覧を取得する |
| `d6e_get_policy_group` | ポリシーグループ（ユーザー / STF メンバー）を取得する |
| `d6e_create_policy_group` | ポリシーグループを作成する |
| `d6e_update_policy_group` | ポリシーグループを更新する |
| `d6e_delete_policy_group` | ポリシーグループをソフト削除する |

### Storage Files

| ツール | 説明 |
| --- | --- |
| `d6e_list_files` | ワークスペース内ファイル一覧を取得する |
| `d6e_get_file` | ファイルメタデータを取得する（内容は含まない） |
| `d6e_upload_file` | ファイルをアップロードする（base64、最大 1GB） |
| `d6e_download_file` | ファイル内容を base64 で取得する |
| `d6e_delete_file` | ファイルをソフト削除する |
| `d6e_view_image` | 画像 / PDF を視覚コンテンツとして LLM に返す |
| `d6e_extract_file_text` | Office 文書のテキスト抽出や画像 OCR を行う |

### Documents

| ツール | 説明 |
| --- | --- |
| `d6e_create_document` | Markdown ドキュメントを作成する |
| `d6e_get_document` | ドキュメント本文・メタデータを取得する |
| `d6e_list_documents` | ドキュメント一覧を取得する（本文なし） |
| `d6e_update_document` | ドキュメントを更新する（変更時は自動で新バージョン） |
| `d6e_replace_document_section` | ドキュメント内の特定テキスト区間を置換する |
| `d6e_delete_document` | ドキュメントをソフト削除する |
| `d6e_get_document_versions` | ドキュメントのバージョン履歴を取得する |

### Workspace Setup

| ツール | 説明 |
| --- | --- |
| `d6e_list_workspace_prompt_rules` | ワークスペースのプロンプトルール一覧を取得する |
| `d6e_create_workspace_prompt_rule` | システムプロンプト用のルールを追加する |
| `d6e_update_workspace_prompt_rule` | プロンプトルールを更新する |
| `d6e_delete_workspace_prompt_rule` | プロンプトルールを削除する |
| `d6e_list_workspace_skills` | カスタム Agent Skill 一覧を取得する |
| `d6e_create_workspace_skill` | カスタム Agent Skill を作成する |
| `d6e_update_workspace_skill` | カスタム Agent Skill を更新する |
| `d6e_delete_workspace_skill` | カスタム Agent Skill を削除する |
| `d6e_get_workspace_title_rule` | チャットセッションのタイトル命名ルールを取得する |
| `d6e_set_workspace_title_rule` | タイトル命名ルールを設定 / 更新する |
| `d6e_clear_workspace_title_rule` | タイトル命名ルールをクリアする |
| `d6e_list_workspace_chat_templates` | チャットフロントエンドテンプレート一覧を取得する |
| `d6e_get_workspace_chat_template` | チャットテンプレート詳細を取得する |
| `d6e_create_workspace_chat_template` | チャットテンプレートを作成する |
| `d6e_update_workspace_chat_template` | チャットテンプレートを更新する |
| `d6e_delete_workspace_chat_template` | チャットテンプレートを削除する |
| `d6e_set_active_workspace_chat_template` | 1 つのチャットテンプレートをアクティブにする |
| `d6e_deactivate_workspace_chat_templates` | 全チャットテンプレートを非アクティブにする |
| `d6e_get_workspace_dashboard_enabled` | ダッシュボード表示設定を取得する |
| `d6e_set_workspace_dashboard_enabled` | ダッシュボード表示の有効 / 無効を設定する |
| `d6e_list_saas_credentials` | 連携済み SaaS クレデンシャル一覧を取得する（トークン値は含まない） |

### SaaS / Drive

| ツール | 説明 |
| --- | --- |
| `d6e_call_external_api` | 保存済み認証で外部 SaaS API を呼び出す |
| `d6e_download_external_file` | SaaS からバイナリを取得しストレージファイルとして保存する |
| `d6e_read_drive_file` | 同期済み Google Drive ミラーからファイルを読み取る（キャッシュ利用） |

### Audit

| ツール | 説明 |
| --- | --- |
| `d6e_list_audit_logs` | ワークスペースの監査ログ（誰が何をいつ）を一覧取得する |

## カテゴリ別件数まとめ

| カテゴリ | 件数 |
| --- | ---: |
| Health / Workspace Context | 3 |
| Workspaces / Members | 9 |
| SQL | 1 |
| Embeddings | 10 |
| Workflows | 6 |
| STFs / Libraries | 11 |
| Effects | 7 |
| Policies / Policy Groups | 10 |
| Storage Files | 7 |
| Documents | 7 |
| Workspace Setup | 21 |
| SaaS / Drive | 3 |
| Audit | 1 |
| **合計** | **96** |

## 関連

- [ローカル AI 開発](/guides/local-ai-development/) — MCP 接続手順
- [REST API](/reference/rest-api/) — 同等の HTTP エンドポイント
