# Network Phase 3：一次資料と更新確認

確認日：**2026-11-11**。発行元はIETF/RFC Editor、IPA、IANA、IEEE、Wireshark、Azure固有の応用のみMicrosoft Learn。原文の転載ではなく、独自の例・図表・問題を作成した。各講義・ミッションに資料名、発行元、URL、版または年月、確認日を出力する。機械可読の資料台帳は `src/content/network/sources.json`。

## 調査方法と範囲

RFC EditorのinfoとIETF Datatrackerの文書メタデータでObsoletes / Obsoleted by / Updates / Updated byを確認し、採用する動作の原文節を読む。RFC Editorで429応答となった文書はDatatrackerの公式ミラーで確認した。更新一覧は将来変わるため確認日を固定する。更新があることと基礎説明全体が廃止されたことは同義ではない。関連更新のうち教材の条件へ影響するものを明示した。全Errataの実装適用監査や全更新RFCの全条項精査は行っていない。

|対象・基準|版・年月と更新関係（確認時）|教材への反映|
|---|---|---|
|[TCP RFC 9293](https://datatracker.ietf.org/doc/rfc9293/)|2022-08、STD7。793/879/6093/6528/2873/6429/6691を廃止、1122/1011/5961を更新。後継・Updated byの表示なし|§3.4番号、§3.5確立、§3.6終了、§3.10.7イベント処理。Clientの確立はSYN/ACK処理、Serverは最終ACK受信。受理可能なRSTのみの例|
|[RTO RFC 6298](https://datatracker.ietf.org/doc/rfc6298/)|2011-06、2988を廃止。後継・Updated by表示なし|説明用RTOと全接続打切りを分離。1/2/4秒・再送2回は教材条件|
|[ARP RFC 826](https://www.rfc-editor.org/info/rfc826)|1982-11、STD37。5227/5494で更新、廃止表示なし|次ホップIPv4のMAC解決。競合検出や登録値更新を否定しない。全メッセージが必ずブロードキャストとしない|
|[CIDR RFC 4632](https://www.rfc-editor.org/info/rfc4632)|2006-08、BCP122。1519を廃止。後継・Updated by表示なし|プレフィックス・最長一致。クラス境界の固定暗記を避ける|
|[/31 RFC 3021](https://datatracker.ietf.org/doc/rfc3021/)|2000-12。ポイントツーポイント向け|通常LANの総数−2の例外を計算機でも区別|
|[IPv6 RFC 8200](https://datatracker.ietf.org/doc/rfc8200/)|2017-07、STD86。2460を廃止、[9673](https://datatracker.ietf.org/doc/rfc9673/)（2024-10）でHop-by-Hop Options処理を更新|ルータが途中で断片化しない。拡張ヘッダーを常にすべてのルータが同様に処理するとは説明しない|
|[NDP RFC 4861](https://datatracker.ietf.org/doc/rfc4861/)|2007-09、2461を廃止。更新：5942/6980/7048/7527/7559/8028/8319/8425/9131/9685/9762/9926|ARPと区別、RA/NS/NA、ルータ寿命とPIOのA/Lを分離。5942のオンリンク判断の注意を反映|
|[SLAAC RFC 4862](https://datatracker.ietf.org/doc/rfc4862/)|2007-09、2462を廃止、7527/9762で更新|DAD、識別子はMAC固定ではない。P=0の通常例。全RAが自律構成を必ず有効化するとはしない|
|[RA Pフラグ RFC 9762](https://datatracker.ietf.org/doc/rfc9762/)|2025-06、4861/4862を更新|対応端末ではPが立つとPIOのAを無視する条件を11章へ追記。DHCPv6 PDの本格講座は対象外|
|[NDP RFC 9685](https://datatracker.ietf.org/doc/rfc9685/) / [9926](https://datatracker.ietf.org/doc/rfc9926/)|2024-11 / 2026-02、6LoWPAN・RPL等の登録拡張|通常Ethernetの基礎例へ登録型NDPを混ぜず、4861への更新があることを記録|
|[RA DNS RFC 8106](https://datatracker.ietf.org/doc/rfc8106/)|2017-03、6106を廃止|DNS配布はRA RDNSS等もあり、SLAACが必ずDNSまで一式決めるとはしない|
|[DHCPv4 RFC 2131](https://www.rfc-editor.org/info/rfc2131)|1997-03、1541を廃止、3396/4361/5494/6842で更新、廃止表示なし|DORAは初期取得の代表、更新は別。Client Identifierやオプション拡張を省略した例とする|
|[DNS RFC 1034](https://datatracker.ietf.org/doc/rfc1034/) / [1035](https://www.rfc-editor.org/info/rfc1035)|1987-11、STD13。882/883/973を廃止。多数の更新あり（下記）|再帰・委任・権威・通常キャッシュ。昔のUDP専用・512バイト固定の説明を採用しない|
|[DNS TCP RFC 7766](https://www.rfc-editor.org/info/rfc7766)|2016-03、5966を廃止、1035/1123を更新、8490/9103で更新|完全なDNS実装にTCPサポートが必要。TC再試行・最初からTCP・暗号化DNSを区別。DSOとゾーン転送TLSは範囲外|
|[NAT RFC 3022](https://www.rfc-editor.org/info/rfc3022)|2001-01、Informational、1631を廃止。後継・Updated by表示なし|歴史的基礎として使用。実装の全マッピング/フィルタ方式の現行共通規範とみなさない|
|[UDP RFC 768](https://datatracker.ietf.org/doc/rfc768/)|1980-08、STD6|データグラムとポート。UDP上のQUIC等による追加保証とUDP自身の保証を区別|
|[ICMP RFC 792](https://datatracker.ietf.org/doc/rfc792/)|1981-09、777を廃止、950/4884/6633/6918で更新|Echo・Time Exceededの観測限界。廃止されたSource Quenchを現行の輻輳制御として教えない|
|[PMTU RFC 1191](https://datatracker.ietf.org/doc/rfc1191/) / [8201](https://datatracker.ietf.org/doc/rfc8201/)|1990-11 / 2017-07。8201は1981を廃止。Updated by表示なし|IPv4 DFとIPv6 Packet Too Big、pingだけで全サイズ成功とはしない|

DNS更新一覧（メタデータ確認用）：1034は1101/1183/1348/1876/1982/2065/2181/2308/2535/4033/4034/4035/4343/4592/5936/8020/8482/8767/9471が掲載。1035は1101/1183/1348/1876/1982/1995/1996/2065/2136/2137/2181/2308/2535/2673/2845/3425/3658/4033/4034/4035/4343/5936/5966/6604/7766/8482/8490/8767/9619が掲載。これらにはさらに廃止・更新された文書も含まれるため、一覧中の旧文書をそのまま現行推奨と解釈しない。19章は通常の正キャッシュを扱い、8767のserve-staleを明示的にモデル外とする。DNSSECは既存Securityへリンクし、DNSの認証とWebのPKIを分離する。

## 試験シラバス・レジストリ・公開ドキュメント

- IPA [FE Ver.9.2](https://www.ipa.go.jp/shiken/syllabus/omgdg50000005kpe-att/syllabus_fe_ver9_2.pdf)（2026-01掲載）、[AP Ver.7.2](https://www.ipa.go.jp/shiken/syllabus/omgdg50000005kq5-att/syllabus_ap_ver7_2.pdf)（2026-01掲載、2026-07表記更新）、[NW Ver.4.1](https://www.ipa.go.jp/shiken/syllabus/nq6ept00000014fp-att/syllabus_nw_ver4_1.pdf)（2023-12掲載）。[公式一覧](https://www.ipa.go.jp/shiken/syllabus/gaiyou.html)から版を確認した。FE/APのネットワーク方式・データ通信と制御・通信プロトコル・ネットワーク管理、NWの設計・構築・運用の学習範囲を参考とした。試験の公式教材・過去問の転載ではない。
- [IANA Service Name and Transport Protocol Port Number Registry](https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml)：2026-11-10更新を確認。TCP/UDPのポートを区別し、登録ポートと実際のサービスの同定は同一ではないと説明。
- IEEE [802.1Q-2022公開規格情報](https://1.ieee802.org/maintenance/802-1q-2022-rev/)、[802委員会・802.3/802.11への入口](https://www.ieee802.org/)（オンライン、確認日現在）。タグとブロードキャスト範囲の説明に使用。有料規格全文の検収・物理層の全仕様網羅は行わない。
- Wireshark [User’s Guide §6.4](https://www.wireshark.org/docs/wsug_html_chunked/ChWorkBuildDisplayFilterSection.html)（オンライン、確認日現在）：取得/表示フィルタの区別とフィールド式を確認。tcpdumpの公式manサイトはrobots制限で取得できなかったため、[公式リポジトリのman原稿](https://raw.githubusercontent.com/the-tcpdump-group/tcpdump/master/tcpdump.1.in)（man日付2026-09-10）を代わりに確認した。21章の `tcpdump -nn -r sample.pcap` は保存ファイルの読取り例として掲載し、tcpdumpを実行して検証したとは報告しない。
- Microsoft Learn [Azure virtual network traffic routing](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview)（オンライン、確認日現在）：Azure応用への関連資料のみ。一般TCP/IPの規範の根拠として使わない。

確認には公開一次資料を利用した。出典URLが将来の全期間にわたって有効、仕様が将来も同じ、という保証ではない。実施した検査と未実施事項は `network-phase3-verification.md` を参照。
