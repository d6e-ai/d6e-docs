---
title: 開発パスの選び方
description: コンソール → Plugin → Docker STF → カスタムフロントエンドの段階採用ナビ。
---

d6e はビッグバン導入を要求しません。やりたいことに合わせて、次の段階のどこで止めても動くシステムが残ります。

## 意思決定フロー

```
チャットで業務が回る？
  ├─ Yes → コンソールのみで十分
  └─ No / 振る舞いを再現したい
         ├─ コンソール UX のまま配布したい → Plugin
         ├─ 重い処理・任意言語・外部NW → Docker STF（Plugin に含めても可）
         └─ 専用 UI・独自ドメインが必要 → カスタムフロントエンド
                                            （通常は Plugin と組み合わせ）
```

## パス別の比較

| パス | 向いていること | 向いていないこと | 入口 |
|---|---|---|---|
| **コンソールのみ** | 探索、データ投入、チームでのチャット活用 | 専用 UX、社外配布 | インスタンスにログイン |
| **Plugin** | プロンプト・STF・WF・ポリシーを再現可能にパッケージ化して配布 | 独自の画面 | [Plugin ガイド](/ja-jp/guides/plugins/) |
| **Docker STF** | 任意言語、重い計算、外部 API / DB への明示的接続 | 単純な SQL だけの処理（JS STF で足りる） | [Docker STF ガイド](/ja-jp/guides/docker-stf/) |
| **カスタム FE** | タスク特化 UI、ブランディング、簡略フロー | 「コンソールで十分な」業務 | [カスタム FE ガイド](/ja-jp/guides/custom-frontend/) |

## 推奨の始め方

1. **API キーを発行**し、手元の AI エージェントを [MCP に接続](/ja-jp/guides/local-ai-development/)する
2. コンソールまたは MCP でテーブル・プロンプトを試し、うまくいった手順を固める
3. 再現性が必要になったら `template.yaml` にまとめて Plugin 化
4. コンテナが必要なら [d6e-docker-stf-skills](https://github.com/d6e-ai/d6e-docker-stf-skills) で Docker STF を作り、Plugin に含める
5. 専用 UI が必要なら [d6e-custom-frontend-skills](https://github.com/d6e-ai/d6e-custom-frontend-skills) でフロントエンドを作り、Plugin が用意したワークスペースを消費する

## スキルリポジトリ（Agent Skills）

AI コーディングエージェントに読み込ませる実装ガイドです。

```bash
# Plugin
npx skills add d6e-ai/d6e-plugin-skills --skill d6e-plugin-development

# Docker STF
npx skills add d6e-ai/d6e-docker-stf-skills --skill d6e-docker-stf-development

# カスタムフロントエンド
npx skills add d6e-ai/d6e-custom-frontend-skills --skill d6e-auth-integration
npx skills add d6e-ai/d6e-custom-frontend-skills --skill d6e-workspace-api-client
npx skills add d6e-ai/d6e-custom-frontend-skills --skill d6e-prompt-driven-ui
```

この docs サイトは全体像とリファレンスに特化しています。コード生成の詳細は各スキルリポジトリが正です。
