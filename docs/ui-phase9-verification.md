# Phase 9 — UI・ナビゲーション改修の検証結果

作業日：2026-11-16〜17。対象：既存8カテゴリ・285ページ。ローカル調査・実装・検証までを実施。Commit・Push・Pages公開は未実施。

## 1. TOP・ナビゲーションの変更概要

- ヘッダーをブランド／「教材を探す」／検索／学習記録に整理。既存8カテゴリは「通信・Web・メール」「開発・設計」「セキュリティ」に分類した標準のdetails/summaryから選ぶ。
- TOPのH1を「ITの仕組みを学び、動かして確かめる。」へ変更。紹介→検索→記録がある場合の続き→目的→分野→補助リンクの順にした。
- 目的別は「仕組みから学ぶ」「動かして理解する」「困りごとから調べる」。すべて既存教材へのリンク。8分野のカードを同じ構造に揃えた。
- ヘッダー・TOP・フッターは既存catalog由来の共通カテゴリ情報を利用。既存カテゴリ名・URLを保持し、未公開カテゴリや新規ライブラリは追加していない。
- 長い章目次は入口・補助ページで初期折畳み、講義ではPC初期展開／モバイル初期折畳み。PCでも閉じられ、展開時の長い一覧は領域内でスクロールする。

## 2. 巡回したページ・UIパターン

実ブラウザで以下34画面をCSS幅325 / 390 / 768 / 1024 / 1440pxのそれぞれで巡回した。改修前170表示、改修後170表示を記録。全285ページの手動巡回ではない。

| パターン | URL（ルートからのパス） |
|---|---|
| TOP | `/` |
| 8カテゴリ入口 | `/network/`、`/java/`、`/security/`、`/git/`、`/test-design/`、`/web/`、`/spring/`、`/mail/` |
| 8カテゴリ代表講義 | `/network/unit-e/n19-dns/`、`/java/lessons/web-flow/`、`/security/advanced/s08-01/`、`/git/unit-1/g01/`、`/test-design/unit-3/td-t07/`、`/web/unit-1/web-h03/`、`/spring/unit-3/spring-s08/`、`/mail/unit-3/mail-ml08/` |
| 実践ミッション | `/mail/exercises/mail-m5/` |
| 操作教材 | `/git/lab/`、`/test-design/lab/coverage/`、`/web/lab/trace/`、`/spring/lab/transaction/`、`/mail/lab/auth/`、`/mail/lab/trace/` |
| 比較 | `/spring/comparisons/`、`/mail/comparisons/` |
| 用語集 | `/java/lessons/glossary/`、`/mail/glossary/` |
| 診断・QA | `/git/rescue/`、`/web/diagnosis/`、`/mail/diagnosis/` |
| 記録・検索・配布 | `/progress/`、`/search/`、`/java/downloads/` |

追加でMailのDNS・IMAP・ヘッダー3操作教材を実操作した。新メニューの開いた状態はTOP、Mail ML08、Spring Transaction、Git/Web/Mail診断、学習記録の7画面×5幅＝35ケースを確認した。

## 3. 発見事項と優先度

再現URL・幅・症状を修正前に[巡回記録](ui-phase9-audit.md)へ記録した。

| 分類 | 件数 | 結果 |
|---|---:|---|
| P0 操作不能 | 0 | 今回の巡回では検出なし |
| P1 利用上の支障 | 3 | UI01 ヘッダー内に隠れるリンク、UI07 小さい診断select、UI11 新メニューの768px時の画面外配置を修正 |
| P2 使いにくさ | 8 | UI02〜06、08〜10を修正。見出し・順序・フッター・章目次・カード・操作領域・Mail表示 |
| P3 好み | 0 | 配色・テーマの全面刷新や装飾追加は実施せず |

UI11は実装候補の開閉検証中に発見。パネルの配置基準をトリガーからヘッダー全体に変更し、35ケースを再検査した。

## 4. 修正した内容と対象ファイル

| ファイル | 変更内容 |
|---|---|
| `src/lib/navigation.ts` | 既存catalogのカテゴリ名・URLを再利用するUIメタデータ、目的別の既存リンク |
| `src/components/GlobalNavigation.astro` | 分類付きの標準disclosureと常設ユーティリティ |
| `src/components/SiteFooter.astro` | 共通情報から8カテゴリと補助リンクを表示 |
| `src/lib/navigation-client.ts` | Escape・外側クリック・メニュー外フォーカスで閉じる、開閉状態の通知 |
| `src/layouts/Shell.astro` | 共通ヘッダー／フッター、章目次の表示・初期状態、短い共通紹介 |
| `src/pages/index.astro` | TOPの情報順序・目的別リンク・カテゴリカード |
| `src/styles/ui.css` | 既存配色を維持した幅・余白・グリッド、44px操作領域、目次・表・コードの領域内スクロール |
| `src/lib/client.ts` | 記録がある場合だけ続きのパネルを表示、章目次の幅別初期状態 |
| `src/lib/mail-client.ts` | 承認された特例：DNS・IMAP・ヘッダーの固定された「段階：未操作」を表示層で「直近の操作」に変更 |
| `scripts/check-ui.mjs` | 全HTMLの共通ナビ・フッター・TOP順序・目次初期状態とローカル原本照合 |
| `package.json`、`scripts/verify.mjs`、`scripts/check-base.mjs`、`.github/workflows/pages.yml` | UI検査を既存の検証経路へ追加。クラウドのworkflowは今回実行していない |
| `README.md`、`docs/ui-phase9-*.md` | 作業範囲、検査コマンド、発見事項・結果・制約の記録 |

TOPの既存アンカー`courses`、`courses-title`、`quick-title`、`resume-title`、`home-query`を保持した。教材本文・問題・選択肢・正解・ミッション・出典は変更していない。

## 5. 修正しなかった問題と理由

巡回で記録したP1/P2はすべて対応した。教材内容やモデルを変更する別件の不具合は今回新たに確定していない。実機・支援技術・ブラウザ拡大の未検証範囲は第10節に記載する。未検証項目を「問題なし」とは扱わない。

Mail特例は模型の`labRows`や状態遷移を変更せず、クライアントで3教材の表示行だけを整えた。操作結果・ログ・判定は既存のまま。

## 6. PC・スマートフォン相当幅

- 34画面×5幅で、実際の`innerWidth`と対象URLを照合して測定。不要なページ全体の水平はみ出しとブラウザconsole errorは検出なし。
- 35件の開いたメニューは全幅で画面内に収まり、8リンクへ到達可能。768px最終確認では左13px・右725px。
- TOP検索は390px幅で上端約377px。改修前の約3396pxから、紹介の直後へ移動した。
- Mail入口の章目次は全幅で初期折畳み。講義は325/390/768pxで折畳み、1024/1440pxで展開。モバイルで展開した章一覧は高さ600px・内容1704pxの領域内スクロールを確認。
- 代表画面のボタン・入力・selectの小さい操作領域を改善。checkbox/radioは本体の寸法だけで評価せず、ラベル側の領域も確認した。
- 長い検索結果メッセージ874文字でページ全体の横はみ出しなし。表・コードの領域内スクロールを維持した。

## 7. キーボード・メニュー操作

実ブラウザでEnter／Spaceによる展開、Tabでカテゴリリンクへ移動、Escapeで閉じてsummaryへ戻ることと可視フォーカスを確認。最後のカテゴリからTabで検索へ移るとメニューが閉じる。全8カテゴリをクリックし、遷移先と現在カテゴリ表示を確認した。

全35ケースで開閉・`aria-expanded`・Escape・フォーカス復帰を確認。独自のARIA menuやフォーカストラップは導入していない。章目次はPCの折畳みとモバイルの展開を実操作した。

325pxのSpring Transaction表は表示領域249px・内容570px。キーボードのArrowRight後に`scrollLeft=40`、フォーカス枠表示、ページ全体の横はみ出し0を確認した。

ページのscriptタグを取り除いたローカル試験HTMLで、script数0・標準summaryのEnter展開・8リンク・Mailへの遷移を確認した。これはブラウザ設定でJavaScriptそのものを無効化した試験とは区別する。

## 8. 既存8カテゴリの回帰

既存検証スクリプトを実行し、すべて成功した。ログは公開対象外の`.local/ui-phase9/`に保持。

| 検査 | 結果 |
|---|---|
| `node scripts/verify.mjs` | PASS。Astro型検査168ファイル、error/warning/hintすべて0。静的285ページ、既存全8カテゴリ検査、既存モデル・採点・v1互換性、実Git照合44時点 |
| `node scripts/check-base.mjs` | PASS。`/`と`/it-works-somehow/`のビルド・リンク・アンカー・全カテゴリ・UI検査。各baseで317生成ファイルをHTTP取得しバイト一致、404も確認 |
| 最終ルートビルド＋`check.mjs` | PASS。285ページ、20,680参照、1,035アセット参照、11 ZIP・264エントリー、336検索文書 |
| 最終`check-ui.mjs` | PASS。285ページの共通構造、原本91ファイル一致、検索索引一致 |
| 最終`check-mail.mjs` | PASS。60問240分岐、26認証事例、11 TLS事例、330遷移等の既存試験 |
| `git diff --check` | PASS |

実Git検査のcommitは合成作者情報を渡す隔離一時リポジトリだけに作られる。作業リポジトリの履歴・永続作者設定は変更していない。`check-base`後のdistは最後にルート用へ再ビルドした。

## 9. 学習記録・検索・操作教材の維持

- 作業開始時に保存した91ファイルのSHA-256と一致。全`src/content`、操作モデル、`progress.ts`、`search.ts`、検索JSON生成元を含む。検索索引336件もbase差分を正規化して一致。
- 記録の保存キー・version 1 schema・採点・検索判定ロジックは変更していない。
- localhostの既存記録をUIで書き出して退避し、Mail ML08で正答・完了・875文字メモ・記述復習を登録。リロード後の復元、進捗1/20、TOPの続きへのリンクを確認した。
- 複合記録のJSONを書出し→読込み→再書出しし、全JSON一致を確認。空v1記録ではTOPの続きが非表示。最後に退避記録を読み戻し、再書出しで元JSONとの完全一致を確認した。本番originの記録には触れていない。
- TOPからDNS検索73件、DMARC SPFのAND検索15件、長文該当なし0件を確認。Mail診断535で1症例、展開・該当なし、Web診断の選択絞込みも確認した。
- サブパスでもTOP→メニュー→Mail→検索を実操作。DMARC検索24件、全結果が`/it-works-somehow/`配下、console errorなし。
- Spring Transactionは既存の7段階操作後にcommitted、リセット後にidle。Mail DNSはMX候補の順序、IMAPはサーバー保存、ヘッダーは送信ログ照合の既存結果を保ったまま、直近操作の表示が更新されることを確認した。

## 10. 未検証事項

- ブラウザの実際の200%ズーム。拡大キーは今回のin-app browserで測定値に変化を生じず、成功と判定していない。狭幅325pxの検査は実施済みだが、ズーム検査の代用とは扱わない。
- スマートフォン実機、Safari、Firefox、スクリーンリーダーによる読み上げ。標準disclosureと開閉状態・ラベルを使用しているが、実機検収済みとは表現しない。
- ブラウザ設定による完全なJavaScript無効化。script除去HTMLの確認は第7節の範囲に限る。
- 全285ページの手動操作、全模型条件のブラウザ実操作。全ページの静的検査と既存のモデル試験、代表画面のブラウザ操作を分けて評価した。
- 本番Pagesでの今回改修の確認。ローカル限定の依頼に従い、公開・クラウドworkflow実行は行っていない。

## 11. Git状態・成果物

開始時clean、開始・終了HEADは`9a44ec536bde051487c691fb500ac1896f8c5c01`。Phase 9の変更は未stageのローカル差分と新規ファイルとして残した。Commit・Push・Pages公開、履歴改変、Author/Committerの永続設定変更はしていない。既存Phase 8のcommitは維持した。

スクリーンショット、ブラウザ測定JSON、ログ、バックアップ、試験HTMLサーバーはgitignore対象の`.local/ui-phase9/`に保管し、公開対象のdistへ含めていない。依存ライブラリ・lockfile変更なし。

確認用画像：`after-home-1440.jpg`、`after-home-390.jpg`、`after-menu-768.png`。元表示の画像・JSONと改修後170表示・メニュー35ケース・操作ログも同ディレクトリに保持。これらは検証用のローカル成果物であり、配布ファイルではない。
