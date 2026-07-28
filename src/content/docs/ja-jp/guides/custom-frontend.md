---
title: カスタムフロントエンド
description: OAuth2 でログインし公開 API を呼ぶ、独立した普通の Web アプリを作る。
---

カスタムフロントエンドとは、中央サイトでユーザーをログインさせたうえで、**特定の d6e インスタンス上の特定のワークスペース**を公開 HTTP API — コンソールと同じ API — 経由で操作する、独立してデプロイされた Web アプリです。

特権的な連携は存在しません。セキュリティ境界はインスタンスのままです。

## 最短セットアップ

```bash
npx skills add d6e-ai/d6e-custom-frontend-skills --skill d6e-auth-integration
npx skills add d6e-ai/d6e-custom-frontend-skills --skill d6e-workspace-api-client
npx skills add d6e-ai/d6e-custom-frontend-skills --skill d6e-prompt-driven-ui
```

リポジトリ: [d6e-ai/d6e-custom-frontend-skills](https://github.com/d6e-ai/d6e-custom-frontend-skills)  
リファレンス実装（AI 経理）も同リポジトリに含まれます。

## 3 スキルの役割

| スキル | 担当 |
|---|---|
| `d6e-auth-integration` | OAuth2（認可コード）・セッション Cookie・リフレッシュ・ワークスペース allow-list |
| `d6e-workspace-api-client` | サーバ側プロキシ（files / SQL / workflows / async jobs 等） |
| `d6e-prompt-driven-ui` | LLM 出力の `kind` JSON・Zod パース・改訂フロー・UI 契約 |

## 認証の要点

1. ブラウザを `https://www.d6e.ai/auth/login` へリダイレクト
2. 認可コードを**インスタンス**の `POST /api/v1/auth/token` へ POST
3. 以後は Bearer トークンで `/api/v1/*` を呼ぶ

フロントエンドは **client secret を持ちません**。本番の callback URL は d6e-auth に登録します（localhost は不要）。詳細は [アーキテクチャ](/ja-jp/getting-started/architecture/) を参照。

## 概念ドキュメント（原典）

- [frontend-and-instance.ja.md](https://github.com/d6e-ai/d6e-custom-frontend-skills/blob/main/docs/frontend-and-instance.ja.md) — 3 者関係
- [architecture.md](https://github.com/d6e-ai/d6e-custom-frontend-skills/blob/main/docs/architecture.md) — リファレンスアプリのシーケンス
- [d6e-api-integration.md](https://github.com/d6e-ai/d6e-custom-frontend-skills/blob/main/docs/d6e-api-integration.md) — request/response 詳細
- [workspace-setup.md](https://github.com/d6e-ai/d6e-custom-frontend-skills/blob/main/docs/workspace-setup.md) — 依存ワークスペースの構築

## Plugin との組み合わせ

フロントエンドが依存するテーブル・プロンプト・WF を Plugin としてパッケージ化すると、新しいワークスペースを再現可能に用意できます。切り分けは [開発パスの選び方](/ja-jp/getting-started/choosing-a-path/) を参照してください。
