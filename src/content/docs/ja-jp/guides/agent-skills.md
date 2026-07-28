---
title: Agent Skills の入れ方
description: Cursor / Claude Code / Codex に d6e 開発スキルを入れる。設計・質問・カスタム FE では全スキル推奨。
---

[Agent Skills](https://skills.sh) は、AI コーディングエージェント（Cursor、Claude Code、Codex など）が読む実装ガイドです。この docs サイトは全体像とリファレンスに特化しており、**コード生成・設計の詳細はスキルが正**です。

## 推奨: すべて入れる

次のどれかに当てはまる場合は、**3 リポジトリのスキルをすべて入れてください**。

- カスタムフロントエンドを作る（多くの場合 Plugin と Docker STF も必要になる）
- LLM ハーネスにアーキテクチャ設計や仕様の質問をする
- どのパスで進むかまだ決まっていない

片方だけ入れると、エージェントがワークスペース側（Plugin / STF）と UI 側を切り離して誤解しやすくなります。全部入れておくと境界の説明が一貫します。

```bash
# 全スキル（推奨）
npx skills add d6e-ai/d6e-plugin-skills --skill '*' -y
npx skills add d6e-ai/d6e-docker-stf-skills --skill '*' -y
npx skills add d6e-ai/d6e-custom-frontend-skills --skill '*' -y
```

プロジェクト配下にインストールされます。グローバルに入れたい場合は各コマンドに `-g` を付けてください。Cursor / Claude Code / Codex すべてに入れたい場合は `--agent '*'` を追加するか、`--all`（`--skill '*' --agent '*' -y` の短縮）を使います。

```bash
# 例: 全エージェントへ一括
npx skills add d6e-ai/d6e-plugin-skills --all
npx skills add d6e-ai/d6e-docker-stf-skills --all
npx skills add d6e-ai/d6e-custom-frontend-skills --all
```

あわせて [ローカル AI 開発](/ja-jp/guides/local-ai-development/) でインスタンス MCP を接続すると、設計だけでなく実ワークスペースへの検証も同じエージェントで行えます。

## 入るスキル一覧

| リポジトリ | スキル | 担当 |
|---|---|---|
| [d6e-plugin-skills](https://github.com/d6e-ai/d6e-plugin-skills) | `d6e-plugin-development` | `template.yaml`・JS/Docker STF の梱包・配布 |
| [d6e-docker-stf-skills](https://github.com/d6e-ai/d6e-docker-stf-skills) | `d6e-docker-stf-development` | コンテナ STF（stdin/stdout JSON） |
| [d6e-custom-frontend-skills](https://github.com/d6e-ai/d6e-custom-frontend-skills) | `d6e-auth-integration` | OAuth2・セッション・redirect URI |
| 同上 | `d6e-workspace-api-client` | サーバ側 API プロキシ |
| 同上 | `d6e-prompt-driven-ui` | プロンプト駆動 UI の JSON 契約 |

合計 **5 スキル**です。`--skill '*'` でリポジトリ内のすべてを入れます。

## パス別の最小セット（任意）

スコープを絞りたいときだけ、次を使ってください。迷ったら上の「すべて入れる」に戻ってください。

### Plugin のみ

```bash
npx skills add d6e-ai/d6e-plugin-skills --skill d6e-plugin-development -y
# Docker STF を書くなら合わせて
npx skills add d6e-ai/d6e-docker-stf-skills --skill '*' -y
```

### Docker STF のみ

```bash
npx skills add d6e-ai/d6e-docker-stf-skills --skill d6e-docker-stf-development -y
# Plugin に梱包するなら合わせて
npx skills add d6e-ai/d6e-plugin-skills --skill '*' -y
```

### カスタムフロントエンド

**FE スキルだけでは不十分なことが多い**です。ワークスペース側のテーブル・プロンプト・WF・STF は Plugin / Docker STF 側の話になるため、原則は全スキルです。

```bash
# 推奨（FE + Plugin + Docker STF）
npx skills add d6e-ai/d6e-plugin-skills --skill '*' -y
npx skills add d6e-ai/d6e-docker-stf-skills --skill '*' -y
npx skills add d6e-ai/d6e-custom-frontend-skills --skill '*' -y
```

## 入れたあと

エージェントに例えば次のように指示できます。

- 「d6e の設計思想に沿って、経費精算の Plugin と薄いカスタム FE の構成を提案して」
- 「この業務をコンソールのみ / Plugin / カスタム FE のどこまでやるべきか比較して」
- 「Echo Docker STF を作ってローカルでテストして」

開発パスの整理は [開発パスの選び方](/ja-jp/getting-started/choosing-a-path/) を参照してください。
