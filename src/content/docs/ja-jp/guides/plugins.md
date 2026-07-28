---
title: Plugin 開発
description: template.yaml でプロンプト・STF・ワークフローをパッケージ化し、URL / Marketplace から配布する。
---

Plugin は**ワークスペースの中身** — プロンプト、テーブル/ポリシー、STF、ワークフロー、Effect、ファイル — を `template.yaml` に束ねた配布物です。インスタンスの**中に**インストールされ、インスタンス**によって**実行されます。ユーザーは組み込みコンソールとチャット経由で利用します。

## スキルを入れる

設計や質問、あるいはカスタム FE と併用する予定がある場合は [全スキル一括](/ja-jp/guides/agent-skills/) を推奨します。Plugin だけに絞る場合:

```bash
npx skills add d6e-ai/d6e-plugin-skills --skill '*' -y
# Docker STF を書くなら合わせて
npx skills add d6e-ai/d6e-docker-stf-skills --skill '*' -y
```

リポジトリ: [d6e-ai/d6e-plugin-skills](https://github.com/d6e-ai/d6e-plugin-skills)

## 何が入るか

| 要素 | 概要 |
|---|---|
| `template.yaml` | マニフェスト。プロンプト、STF、WF、ポリシー、ファイル参照などを宣言 |
| プロンプト | Markdown。チャットエージェントの振る舞いを規定 |
| JS STF | QuickJS 上の純粋関数 |
| Docker STF | コンテナ（詳細は [Docker STF](/ja-jp/guides/docker-stf/)） |
| Effect | 宣言的 HTTP 呼び出し |
| ワークフロー | STF / Effect ステップのオーケストレーション |
| ポリシー | テーブル ACL（デフォルト拒否） |

スキーマ: [schema/template.schema.json](https://github.com/d6e-ai/d6e-plugin-skills/blob/main/schema/template.schema.json)

## 典型ワークフロー

1. [ローカル AI 開発](/ja-jp/guides/local-ai-development/) で実インスタンスに MCP 接続
2. SQL・STF・プロンプトを反復し、動くものを `template.yaml` に落とす
3. Install from URL、または Marketplace / registry で配布

詳細:

- [template-yaml-spec.md](https://github.com/d6e-ai/d6e-plugin-skills/blob/main/docs/template-yaml-spec.md)
- [publishing.md](https://github.com/d6e-ai/d6e-plugin-skills/blob/main/docs/publishing.md)
- [security-guidelines.md](https://github.com/d6e-ai/d6e-plugin-skills/blob/main/docs/security-guidelines.md)

## カスタムフロントエンドとの関係

Plugin はワークスペース側の振る舞いを用意し、カスタム FE はそれを消費します。同じリポジトリで `template.yaml` とフロントエンドを同居させる構成も一般的です。FE を触るならスキルもまとめて入れてください（[Agent Skills の入れ方](/ja-jp/guides/agent-skills/)）。切り分けは [開発パスの選び方](/ja-jp/getting-started/choosing-a-path/) を参照してください。
