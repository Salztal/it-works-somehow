# GitHub初回登録の公開前記録

対象: `Salztal/it-works-somehow` / `main`

Remote: `https://github.com/Salztal/it-works-somehow.git`

公開予定: `https://salztal.github.io/it-works-somehow/`

## 履歴と個人情報

- 元教材の履歴を移さず、新規リポジトリの最初のコミットとして登録する。
- Author Name / Committer Nameはともに`Salztal`。
- メールは所有者がGitHub Settings → Emailsから提示したGitHub提供noreplyを使用。認証済みアカウントIDとの一致も確認。アドレスの推測や本名・個人メールの使用はしない。
- 設定はこのリポジトリのローカルだけ。コミット直前のGit identityと、作成後の実コミットヘッダーを検査してからPushする。
- コミットメッセージは`Initial commit: integrate Network and Java study materials`。Co-authored-byや旧履歴を追加しない。
- Force Pushは使用しない。

## 最終検査

- Node.js 22.23.4 / pnpm 11.25.0で`pnpm verify`、`pnpm check:base`、`pnpm build`が成功。
- 40 HTML、1,622参照、27検索対象、11 ZIP（264エントリー）、106移行資産を検査。
- `/`と`/phase1-path-check/`で参照・アンカー・HTTPバイト一致を確認。
- 依存ストアの参照先が端末の既定値と異なっていたため、プロジェクト内ストアを指定し、固定lockfileのまま依存状態を修復。教材・依存バージョンの変更なし。
- 生成物・依存・検証用データ・`.env`・実DB設定・講師メモ・バックアップ・認証情報をGit対象から除外。
- 公開候補には、Gitの既定設定に含まれる個人名・個人メールとの一致がないことも確認。
- NetworkのMIT全文と由来を保持。Java教材の既存ライセンス未指定の表記を維持し、新しい利用許諾は付与していない。

## Pagesと継続確認

Sourceは**GitHub Actions**。初回Push後の実行結果と公開URLは、[Actions](https://github.com/Salztal/it-works-somehow/actions)および[Pages設定](https://github.com/Salztal/it-works-somehow/settings/pages)で確認する。

このファイルは初回コミット前の記録であり、コミットIDやデプロイ結果は含めない。元の`04-validation.md`にある「実公開未実施」は、Phase 1実装時点の検証範囲を記録したもの。
