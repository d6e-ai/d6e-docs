---
title: 開発パスの選び方
description: コンソール → Plugin → Docker STF → カスタムフロントエンドの段階採用ナビ。
---

d6e はビッグバン導入を要求しません。やりたいことに合わせて、次の段階のどこで止めても動くシステムが残ります。

## 先に Skills を入れる（推奨）

Cursor / Claude Code / Codex に設計や質問をさせる場合、およびカスタムフロントエンドを作る場合は、**3 リポジトリのスキルをすべて**入れてください。片方だけでは境界を誤解しやすいです。

```bash
npx skills add d6e-ai/d6e-plugin-skills --skill '*' -y
npx skills add d6e-ai/d6e-docker-stf-skills --skill '*' -y
npx skills add d6e-ai/d6e-custom-frontend-skills --skill '*' -y
```

詳細は [Agent Skills の入れ方](/ja-jp/guides/agent-skills/) を参照してください。

## 意思決定フロー

```
チャットで業務が回る？
  ├─ Yes → コンソールのみで十分
  └─ No / 振る舞いを再現したい
         ├─ コンソール UX のまま配布したい → Plugin
         ├─ 重い処理・任意言語・外部NW → Docker STF（Plugin に含めても可）
         └─ 専用 UI・独自ドメインが必要 → カスタムフロントエンド
                                            （通常は Plugin ± Docker STF と組み合わせ）
```

## パス別の比較

| パス | 向いていること | 向いていないこと | 入口 |
|---|---|---|---|
| **コンソールのみ** | 探索、データ投入、チームでのチャット活用 | 専用 UX、社外配布 | インスタンスにログイン |
| **Plugin** | プロンプト・STF・WF・ポリシーを再現可能にパッケージ化して配布 | 独自の画面 | [Plugin ガイド](/ja-jp/guides/plugins/) |
| **Docker STF** | 任意言語、重い計算、外部 API / DB への明示的接続 | 単純な SQL だけの処理（JS STF で足りる） | [Docker STF ガイド](/ja-jp/guides/docker-stf/) |
| **カスタム FE** | タスク特化 UI、ブランディング、簡略フロー | 「コンソールで十分な」業務 | [カスタム FE ガイド](/ja-jp/guides/custom-frontend/) |

カスタム FE を選ぶ場合でも、依存するテーブル・プロンプト・WF・STF は Plugin（必要なら Docker STF）側に置くのが一般的です。だからスキルもまとめて入れます。

## 推奨の始め方

1. [Agent Skills をすべて入れる](/ja-jp/guides/agent-skills/)
2. **API キーを発行**し、手元の AI エージェントを [MCP に接続](/ja-jp/guides/local-ai-development/)する
3. コンソールまたは MCP でテーブル・プロンプトを試し、うまくいった手順を固める
4. 再現性が必要になったら `template.yaml` にまとめて Plugin 化
5. コンテナが必要なら Docker STF を作り、Plugin に含める
6. 専用 UI が必要ならカスタムフロントエンドを作り、Plugin が用意したワークスペースを消費する

この docs サイトは全体像とリファレンスに特化しています。コード生成の詳細は各スキルリポジトリが正です。
