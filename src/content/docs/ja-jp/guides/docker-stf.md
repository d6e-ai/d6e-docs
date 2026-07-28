---
title: Docker STF 開発
description: stdin/stdout の JSON 契約で動くコンテナ化ビジネスロジックを作る。
---

Docker STF は、任意言語のコンテナとして実装する State Transition Function です。契約は単純です。

- **stdin:** JSON 入力
- **stdout:** `{"output": ...}`
- **stderr:** エラーメッセージ
- **シークレット:** 実行時に環境変数として注入（値は API 経由で書き込み専用）

d6e 非依存の普通のコンテナなので、ローカル `docker run` で単体テストできます。

## 最短セットアップ

```bash
npx skills add d6e-ai/d6e-docker-stf-skills --skill d6e-docker-stf-development
```

リポジトリ: [d6e-ai/d6e-docker-stf-skills](https://github.com/d6e-ai/d6e-docker-stf-skills)

5 分 Quick Start: [docs/QUICKSTART.md](https://github.com/d6e-ai/d6e-docker-stf-skills/blob/main/docs/QUICKSTART.md)

## 典型フロー

1. スキルでコード生成（Dockerfile / エントリポイント / README）
2. ローカルで `docker build` → `docker run` して stdin/stdout を確認
3. レジストリ（ghcr.io / Docker Hub 等）へ公開
4. d6e コンソールまたは API で STF として登録（`runtime: docker`）
5. 必要なら [Plugin](/ja-jp/guides/plugins/) の `template.yaml` に含めて配布

## いつ Docker STF を選ぶか

| 選ぶ | JS STF（QuickJS）で足りる |
|---|---|
| 任意言語・重い計算・ネイティブ依存 | 単純な SQL 変換・集計 |
| 外部ネットワーク / 外部 DB への明示接続 | ワークスペース SQL だけで完結 |
| 既存のコンテナ資産を流用 | 数行の純粋関数 |

## ドキュメント索引

- [DEVELOPER_GUIDE.md](https://github.com/d6e-ai/d6e-docker-stf-skills/blob/main/docs/DEVELOPER_GUIDE.md)
- [TESTING.md](https://github.com/d6e-ai/d6e-docker-stf-skills/blob/main/docs/TESTING.md)
- [PUBLISHING.md](https://github.com/d6e-ai/d6e-docker-stf-skills/blob/main/docs/PUBLISHING.md)
- [AI-PROMPTS.md](https://github.com/d6e-ai/d6e-docker-stf-skills/blob/main/docs/AI-PROMPTS.md)

API 側の登録・instant-run・describe は [REST API](/ja-jp/reference/rest-api/#stfs) と [MCP](/ja-jp/reference/mcp-tools/#stfs--libraries) を参照してください。
