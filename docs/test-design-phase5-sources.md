# Phase 5 一次資料と適用版

確認日：2026-11-11。公開資料は参照のみで、PDF等の全文を同梱しない。講義、問題、図の例、仕様、合成データは独自作成。規格の義務と実務上の推奨を混同しない。

| 資料・発行元 | URL | 適用版・照合範囲 |
| --- | --- | --- |
| Foundation Level シラバス 日本語版 / JSTQB翻訳・ISTQB原著 | https://jstqb.jp/dl/JSTQB-SyllabusFoundation_VersionV40.J02.pdf | 2023V4.0.J02。日本語修正2024-07-10。第1〜5章の目的、用語、技法、管理を確認 |
| Certified Tester Foundation Level / ISTQB | https://istqb.org/?download_id=3345&sdm_process_download=1 | v4.0.1 / 2024-09-15。§4.2.1〜4.3.3を中心に照合。現行案内 https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/ にこの版の配布を確認 |
| シラバスと用語集の案内 / JSTQB | https://www.jstqb.jp/syllabus/ | 現行の日本語FL案内と、用語集をWebで一元管理する方針を確認 |
| ISTQB Glossary日本語 / ISTQB・JSTQB | https://glossary.istqb.org/ja_JP/search | 随時更新。動的な用語本文はWeb取得で読めなかったため、個別語の最新版を直接検収したとは扱わない。主要定義は日本語シラバスとの照合を優先 |
| 基本情報技術者試験 / IPA | https://www.ipa.go.jp/shiken/syllabus/omgdg50000005kpe-att/syllabus_fe_ver9_2.pdf | Ver.9.2。2026-01-08掲載。ソフトウェア構築・テストの命令/条件/判定条件網羅、同値・境界等 |
| 応用情報技術者試験 / IPA | https://www.ipa.go.jp/shiken/syllabus/omgdg50000005kq5-att/syllabus_ap_ver7_2.pdf | Ver.7.2。2026-01-08掲載。開発技術・テスト・統合・保守。指定の2版が現行案内 https://www.ipa.go.jp/shiken/syllabus/gaiyou.html に掲載されていることを確認 |
| Combinatorial Methods for Trust and Assurance ACTS / NIST | https://csrc.nist.gov/Projects/automated-combinatorial-testing-for-software | 固定版のないWeb一次資料。因子の相互作用、t-wayの実務補足。4ケースの例は独自作成 |
| JUnit 5 User Guide / JUnit Team | https://docs.junit.org/5.13.4/user-guide/ | 5.13.4を固定参照。最新版という主張ではない。テスト・assertionとケース設計の区別に使用 |

## 版と用語の扱い

- 日本語2023V4.0.J02と英語4.0.1を同じ改訂とは扱わない。英語4.0.1の訂正で無効同値クラスを個別に検査する説明も確認した。
- 2値境界値分析は各境界と隣接する別クラスの値。3値は境界と両隣。整数1〜1000000では2値の0/1/1000000/1000001に対し、3値は2/999999を加える。
- 状態網羅、有効遷移網羅、禁止遷移試行を別々に数える。「全遷移」と「有効遷移」の語を混ぜない。到達した状態だけで全有効遷移達成としない。
- 条件網羅の補足とペアワイズ入門はCTFLの基礎2技法（命令・分岐）の説明へ無理に含めない。IPA/NIST等と区別して扱う。
- 結合テストは実務上の広い呼称。CTFLでのコンポーネント統合/システム統合の違いを本文で記載。
- 不具合という広い表現に対して、人のエラー→成果物の欠陥→動作の故障を分けて説明する。成功したテストや100%カバレッジを品質保証の完了と同一視しない。
- シラバス原著の権利はISTQBおよび著者、日本語訳はJSTQB。本サイトはIPA・JSTQB・ISTQBの公式教材ではない。
