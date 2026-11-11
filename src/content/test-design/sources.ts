export const sources:Record<string,{title:string;publisher:string;url:string;version:string;checked:string;scope:string}>={
 jstqb:{title:'Foundation Level シラバス 日本語版',publisher:'JSTQB（翻訳）/ ISTQB（原著）',url:'https://jstqb.jp/dl/JSTQB-SyllabusFoundation_VersionV40.J02.pdf',version:'2023V4.0.J02（2024-07-10日本語訳修正）',checked:'2026-11-11',scope:'第1〜5章。日本語の用語・技法の基準。英文v4.0.1と同じ版とは扱わない。'},
 ctfl:{title:'Certified Tester Foundation Level Syllabus',publisher:'ISTQB / syllabus authors',url:'https://istqb.org/?download_id=3345&sdm_process_download=1',version:'v4.0.1 / 2024-09-15',checked:'2026-11-11',scope:'§1〜5、特に4.2と4.3。無効同値クラスの個別検証等の訂正も確認。'},
 glossary:{title:'ISTQB用語集（日本語）',publisher:'ISTQB / JSTQB',url:'https://glossary.istqb.org/ja_JP/search',version:'随時更新のWeb版。固定の版番号なし',checked:'2026-11-11',scope:'JSTQBの現行案内を確認。動的Web画面の本文は自動取得できず、定義は日本語シラバスとの照合を優先。'},
 'ipa-fe':{title:'基本情報技術者試験 シラバス',publisher:'IPA',url:'https://www.ipa.go.jp/shiken/syllabus/omgdg50000005kpe-att/syllabus_fe_ver9_2.pdf',version:'Ver.9.2 / 2026-01-08掲載',checked:'2026-11-11',scope:'開発技術のソフトウェア構築・テスト。条件網羅等はCTFL本体の範囲と区別した補足。'},
 'ipa-ap':{title:'応用情報技術者試験 シラバス',publisher:'IPA',url:'https://www.ipa.go.jp/shiken/syllabus/omgdg50000005kq5-att/syllabus_ap_ver7_2.pdf',version:'Ver.7.2 / 2026-01-08掲載',checked:'2026-11-11',scope:'開発技術のテスト設計、統合、保守と管理。試験対策を目的にしない。'},
 nist:{title:'Combinatorial Testing',publisher:'NIST',url:'https://csrc.nist.gov/Projects/automated-combinatorial-testing-for-software',version:'Web解説（固定版なし）',checked:'2026-11-11',scope:'組み合わせ・相互作用テストの実務補足。2因子網羅を万能としない。'},
 junit:{title:'JUnit 5 User Guide',publisher:'JUnit Team',url:'https://docs.junit.org/5.13.4/user-guide/',version:'5.13.4（Java教材との接続用に固定参照。最新版の主張ではない）',checked:'2026-11-11',scope:'テストとアサーション、自動実行とケース設計の区別。'}
};
