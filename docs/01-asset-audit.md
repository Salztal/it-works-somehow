# Phase 1 資産調査・設計判断

調査日: 2026-11-10 (Asia/Tokyo)

## 調査元

- `../azure-network-basics/`: MIT。origin は `https://github.com/Salztal/azure-network-basics.git`、HEAD `2299cccbf7535b71c67007a3e92d7c6fa546d332`。
- Network の元フォルダーには `index.html` の変更と未追跡の `js/v02.js` が存在。作業中の追加教材も失わないため、そのローカル状態を移行元とする。`css/v02.css` が参照されるが実ファイルはない。旧UIは再利用しない。
- `../JavaStudy/`: Git管理なし。`course/`、`Todo/`、`TodoJSP/`、`sql/`、公開生成スクリプト、`docs/`、`release/` を確認。
- 公開Network URLも参照を試みたが取得不可。移行は利用可能なローカル原本に基づく。

## 棚卸し

- Network: 6レッスン、選択式問題23問（章順に3・4・3・4・4・5問）、図解、目標・身近な例・用語・Azureとの関連。
- Network追加版: 3ミッション (設計・Web通信・構成図読解)、計14問の参考回答、5語の自由記述復習、Azure調査の6項目と5つの問い。
- 旧進捗: レッスン完了・選択回答、ミッション完了・復習記述をlocalStorage保存。
- Java: Markdown 18本 (案内、環境構築、第1〜10章、追加課題、演習、つまずき集、用語集、旧検証記録、公開手順)。全本を移行する。
- Java配布物: 章別開始コード9個、完成版、SQL・設定キット、計11 ZIP。決定的ZIP生成・SHA-256 manifest・公開対象検査がある。
- `{{code:ファイル|メソッド}}` は完成ソースから展開する。講義とコードの対応を維持する。

## 公開境界とリスク

- 元の実 `db.properties`、`WEB-INF/classes`、build、`.local`、`.tools`、講師メモは持ち込まない。元フォルダー全体のコピーは禁止。
- 新プロジェクト内の `upstream/java/` に安全な拡張子・ディレクトリだけを明示コピー。既存package/checkをここで実行し、元フォルダーは変更しない。
- サイトに公開するのはビルド済みページと検査済み学習ZIPだけ。旧リポジトリ全体ZIPはサイトに置かない。
- Javaのライセンスは未指定。依頼された移行として扱い、独自のライセンスを勝手に付与しない。公開前の権利確認事項として残す。
- 旧サイトと新サイトはURL・originが異なるため、旧localStorageを自動で読み出せない。進捗は新しい名前空間で保存し、JSON書出し・読込みを用意する。
- 旧Java検証結果は原資料の記録として保存し、今回再実行した結果と区別する。実DBの変更を伴う検証は実環境の接続情報をコピーせず実行しない。

## 技術・情報設計

- Astro 7.4.7 / TypeScript / CSS、静的出力。公式要件はNode >=22.23.4。Node 22系に固定するが、この端末の初期環境はNode 24.22.1。公式配布から22.23.4をプロジェクト内に用意し、実ビルドも検証した。CIでも22.23.4を使用。
- Java原稿はMarkdownのまま管理。Networkは既存の問題・解答・図を構造化JSONとして保持。教材群のルート情報は共通catalogで定義し、Security追加時も拡張できる。
- `/network/basics/`、`/network/azure/`、`/network/exercises/`、`/java/setup/`、`/java/lessons/`、`/java/exercises/`、`/java/downloads/` を設ける。
- 検索は静的索引で本文も検索。学習再開・完了・回答・自由記述を端末内に保存。サーバ不要。
- UIは墨色・暖白色・深い青緑を基調に、小さな角丸、罫線、章番号で整理。デスクトップは左に章目次、本文幅約46rem、右にページ内目次。スマホは目次を折りたたむ。
- GitHub Pagesを公開先として準備する。Sitesホスティングは使用せず、新GitHubリポジトリ名・remoteも未設定とする。

## 公式仕様の確認

- [Astroのインストール](https://docs.astro.build/en/install-and-setup/)
- [GitHub Pagesへのデプロイ](https://docs.astro.build/en/guides/deploy/github/)
- npmレジストリでAstro 7.4.7のenginesを確認。

ファイル単位の出典・ハッシュ・移行先は `migration-manifest.json` に記録する。

最終依存確認: pnpm 11の公開待機ポリシーにより、公開直後のAstro 7.4.8は導入しない判断とした。2026-11-05公開の7.4.7へ固定し、ポリシーを維持したままlockfileを再生成。README・CIと同じpnpm 11で固定lockfileを検証する。
