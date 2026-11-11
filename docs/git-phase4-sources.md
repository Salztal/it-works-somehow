# Phase 4 Git：一次資料と仕様確認

確認日：2026-11-11。Gitの現行オンラインマニュアル、Pro Git第2版、GitHub Docsを参照。各教材末尾・QA内にも資料名・URL・発行元・確認日を記録する。端末側の照合は Git 2.55.0.windows.3。オンライン資料の最終更新版と端末バージョンは同一とは限らず、ここで使用する基本操作の範囲を実Gitと照合した。

| 資料 | 確認した点 |
| --- | --- |
| [git merge](https://git-scm.com/docs/git-merge) | 早送りは新規記録なし。分岐mergeは親2つ。--squashはWT/Indexを準備し、コミット・HEAD移動・MERGE_HEAD記録を行わない。--no-commitだけでは早送り停止不可。未記録変更を抱えた開始はabortで戻せない場合がある。 |
| [git cherry-pick](https://git-scm.com/docs/git-cherry-pick) | 通常は選択差分から新しい記録。依存・重複・空の変更・競合を別途判断。--continue / --abort。特殊な--ffを通常動作と混同しない。 |
| [git rebase](https://git-scm.com/docs/git-rebase) | 基準へ変更を順次再適用。IDは通常変わる。公開済み履歴の影響。進行中のHEAD、continue / abort / skipの違い。空・重複・merge commitは限定モデル外。 |
| [git revert](https://git-scm.com/docs/git-revert) | 元記録を残す打消しコミット。競合とテスト。merge commitの親選択・将来のmergeへの影響は単純な通常コミットと分ける。 |
| [git reset](https://git-scm.com/docs/git-reset) | ブランチ/HEADとsoft / mixed / hardのIndex・WTへの影響。mixedはWT保持。hardは未記録編集を失い得る。パス指定resetとは分ける。 |
| [git restore](https://git-scm.com/docs/git-restore) | 通常はIndex→WT、--stagedは通常HEAD→Index。履歴参照は移動しない。未ステージ編集の破棄とステージ選択の取消を区別。 |
| [git reflog](https://git-scm.com/docs/git-reflog) | ローカル参照の移動履歴。既定90日/到達不能30日、設定と管理処理に依存。期限とオブジェクト削除は別。未記録編集の永久バックアップではない。 |
| [git push](https://git-scm.com/docs/git-push) | 通常の非FF拒否。forceの危険。leaseの期待値条件と、バックグラウンドfetchが追跡参照を更新する場合の限界。合意を代替しない。 |
| [git fetch](https://git-scm.com/docs/git-fetch) / [git pull](https://git-scm.com/docs/git-pull) | 取得と現在枝への統合の違い。pullの動作は設定/オプションで変わるため明示した--ff-onlyを扱う。 |
| [git stash](https://git-scm.com/docs/git-stash) | 通常の対象、-uと無視対象、apply / pop / --index、競合時の退避保持、apply専用abortがない点。 |
| [git status](https://git-scm.com/docs/git-status) / [git diff](https://git-scm.com/docs/git-diff) | 2列の意味、通常diffとcachedの比較対象、未追跡ファイルと同期の限界。 |
| [git add](https://git-scm.com/docs/git-add) / [git commit](https://git-scm.com/docs/git-commit) | Indexへの選択と記録。ステージ後の追加編集は自動追従しない。amendも履歴置換。 |
| [git branch](https://git-scm.com/docs/git-branch) / [git switch](https://git-scm.com/docs/git-switch) | 参照の作成と切替の違い。未記録編集の持越し・拒否、detached HEADの保護。 |
| [git log](https://git-scm.com/docs/git-log) / [git show](https://git-scm.com/docs/git-show) | 親子グラフ・参照・パスでの履歴調査、候補差分の確認。 |
| [git clone](https://git-scm.com/docs/git-clone) / [git remote](https://git-scm.com/docs/git-remote) | originは通常の別名。upstreamの追跡設定とは別。 |
| [Pro Git：Branches in a Nutshell](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell) | スナップショット・親・ブランチ・HEADの概念。 |
| [GitHub：Pull request merges](https://docs.github.com/en/pull-requests/reference/pull-request-merges) | サーバーのPR統合方式。CLI squash直後の状態とUIの完了処理を同一視しない。GitHub Rebase and merge固有の再作成。 |
| [GitHub：About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) | CI必須チェック、レビュー、権限と設定の制約。 |
| [GitHub：Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) | 最初に認証情報の失効/ローテーション。履歴削除だけではclone/fork/キャッシュ等に残る情報を回収できない。 |

図・例・判断問題は独自制作。資料の文章・公式図を転載せず、事実を演習用ケースへ書き下ろした。ユーモアは導入と注意に限定した。
