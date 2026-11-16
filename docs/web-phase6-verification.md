# Phase 6 実装・検証記録

実装・一次資料確認：2026-11-12。再開・検証：2026-11-16（Asia/Tokyo）。環境：Windows / Node.js v24.22.1。Node 22のCI定義と依存の固定版は維持したが、今回この端末でNode 22を実行したわけではない。

## 実装

5 Unit・15講義・5ミッション、各3問の60問と全240選択肢理由。HTTP・状態管理・CORS・キャッシュ・プロキシ・アプリ処理・開発者ツール・障害対応を収録。ミッションには背景・前提・証拠・判断・自由記述・解説・未確認・残存リスクを付けた。

操作教材8種類：HTTP追跡、要求組立、リダイレクト、Cookie/セッション、CORS/Preflight、キャッシュ、nginx経路、LB/セッション。追跡は正常と11障害、層の選択・段階実行・合成ログ・仮想時間・比較・履歴・初期化に対応。実通信・実認証情報を使わない。全モデルの範囲は設計書・各UIに明記。

症状から進む13症例、12比較、一次資料11件、検索と学習記録v1、既存教材への双方向リンクを追加。新依存なし。長い通信メッセージは専用スクロール領域とし、フォームラベル・フォーカス・aria-liveを用意。

## 自動検証

| 項目 | 結果 |
| --- | --- |
| `node scripts/verify.mjs` | 最終実行PASS。全カテゴリ・新教材・実Git照合を一括実行 |
| Astro型検査 | PASS、118ファイル、0 errors / warnings / hints |
| 静的ビルド | PASS、208 HTMLページ（既存169＋新規39） |
| 検索 | 201文書（既存148＋新規53）。講義・ミッション20、操作8、症例13、比較12を追加 |
| 新教材 | PASS、15講義・5ミッション・60問・全240分岐、描画、ID・出典・関連参照、8ラボ・13症例・12比較 |
| モデル | PASS、メソッド/入力/本文制約、リダイレクト/ループ、Cookie属性/期限/状態遷移、CORS/Preflight/credentials、保存/再検証/ETag、nginxパス/Host、LB/検出前後、障害の層/statusなし/復帰を独立した固定期待値で照合 |
| v1 JSON往復 | PASS、Network/Java/Security/Git/Test Designの旧記録とWeb追加後の混在記録。完了・回答・自由記述・メモ・最終ページを保持 |
| 移行原稿・配布物 | PASS、106原本ハッシュ・Java18原稿・5メソッド・既存Network6講義/23問/3ミッション/14参考回答/5記述語。11 ZIP・264 ZIP内エントリー |
| 既存教材 | Security30講義/90問、Network追加教材、Git40問/160分岐、Test Design60問/240分岐の既存検査PASS |
| 実Git回帰 | PASS、一時環境の44時点を照合。既存checkoutの履歴・永続設定は変更しない |
| rootとPagesサブパス | `/` と `/it-works-somehow/` の双方で全参照・アンカー・公開物・検索・全カテゴリ検査PASS |
| HTTP配信 | 両baseで238生成ファイルのバイト一致・404を確認。実ブラウザ操作とは別検査 |

証拠ログはGit対象外の `.local/phase6-verify.log`、`.local/phase6-git-real.log`、`.local/phase6-base.log`。最初のverifyは短すぎる選択肢説明を検出し、説明を具体化して修正。再実行は新教材を含む全検査を通過した後、一時Gitリポジトリへのsandbox書込み制限で停止。実Git検査は必要な権限で個別に再実行してPASS。その後、正式なverify全体も必要な権限で再実行してPASS。最初のprepareを省いた試験ビルドで旧base付きJava生成原稿が検出された件も、正式なprepareから再生成して解消した。

## 実ブラウザ検証

2026-11-16、ChatGPT in-app browserでビルド済みサイトを127.0.0.1:4327から操作した。既存の利用者記録と混同しないポートで、架空メモと回答だけを作った。自動モデルテストやHTTP取得とは別の証拠である。

| 操作 | 観測した結果 |
| --- | --- |
| HTTP追跡 | 正常200・仮想65ms。DNS/TLSはHTTP応答なし、転送先誤り502、アプリ例外500、DB待ち504、期限切れ401、CORSは200＋JS参照不可、CDN旧版200。比較と初期化も動作 |
| Cookie | SecureでHTTPへ未送信、明示LaxでクロスSite fetchへ未送信・トップレベルGETで送信。時間経過後はCookie送信ありでも401。ログアウトで状態失効とCookie削除 |
| CORS | include＋*のJSONは事前確認失敗・実要求なし。同条件のフォームPOSTは実送信あり・JS参照不可。明示Originへ変更すると成功。JSONは事前確認ありで成功 |
| Cache | 初回200→通信なし再利用→60秒後304・本文空→版変更と強制再検証で200/v2 |
| nginx | URIなしは/api/orders?q=1、/指定は/orders?q=1、/v1/指定は/v1/orders?q=1を表示 |
| LB | ローカルのAログイン→B要求は401。共有ならBも200。A停止・検出前502→ヘルスチェック後Bで200 |
| 組立・Redirect | POSTの再送で保存2→3件、HEAD200の本文は空。302でPOST→GET・本文除去、307はPOST・本文保持、ループで停止 |
| 診断導線 | 症状選択でCORS症例の証拠・手順等を展開し、関連H06へ移動できた |
| v1保存と復元 | H06の完了・回答・予想・メモが再読込みで復元。JSONを書出し、メモを一時変更後にそのJSONを読み込み、旧メモ・正解・完了を復元 |
| 390px・325px | 実CSS幅を読取り確認。入口・8ラボ・診断・H06の11ページ×2幅で、document幅は各377px/312pxでページ全体の横はみ出しなし。拡大率のため最初の指定サイズと実CSS幅が違ったので補正後に検査し直した |
| 長い通信ログ | 325px幅、425文字のURLでリクエスト欄の内容幅3072px・枠249px。文書幅312pxのまま専用領域だけが横スクロール |
| キーボード | EnterでCORS判定が動作。フォーカス対象は判定ボタン、:focus-visible=true、outline=solid |
| Console | 確認したローカル操作と公開入口でwarn/errorは0件 |
| 公開入口 | https://salztal.github.io/it-works-somehow/web/ で講座見出し・目的別導線を確認 |

画面記録： [公開入口](screenshots/web-phase6-published.jpg)、[325pxのCORS教材](screenshots/web-phase6-cors-325.jpg)、[追跡ラボ](screenshots/web-phase6-trace-desktop.jpg)。スクリーンショットは表示確認の記録で、上記の全操作を1枚で証明するものではない。

## 既知の制約・未検証事項

実機Safari/Firefox、タッチ端末、全ブラウザ組合せ、支援技術による読上げの全経路は未検証。実NGINX・実DB・実認証・第三者Cookie制限・Partitioned等は教育モデルの対象外。実装の全ての例外入力をブラウザで総当たりしたものではなく、モデルの固定期待値検査と代表UI操作を組み合わせた。

## Git方針の変更

当初はCommit・Push禁止。2026-11-12にユーザーが保存を承認し、2026-11-16にmainへのPushを明示承認した。mainへのPushは既存Pagesワークフローを起動することを案内済み。Author/Committerは既存規則のSalztalとGitHub提供noreplyを使い、Co-authored-byや永続設定変更・履歴改変は行わない。検証ログ・依存・生成物はGitへ含めない。

mainへ実装を保存したコミットは1696aee。AuthorとCommitterはともに既存のSalztal/noreplyで、実コミットヘッダーをPush前に確認済み。[既存Pagesワークフロー](https://github.com/Salztal/it-works-somehow/actions/runs/43857228962)はcheck/build/deployを含めsuccessとなり、公開入口も実ブラウザで確認した。ブラウザ検証記録と画像は追補コミットで保存する。
