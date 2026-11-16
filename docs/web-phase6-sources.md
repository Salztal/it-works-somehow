# Phase 6 一次資料・適用範囲

確認日：2026-11-12。継続更新資料は当日の内容を確認した記録。

## HTTP Semantics

- 発行：IETF
- 版：RFC 9110 / STD 97, June 2022
- 確認日：2026-11-12
- URL：https://www.rfc-editor.org/rfc/rfc9110.html

§9 メソッド・安全性・冪等性、§15 ステータスとリダイレクト。infoページで現行状態・errataへの導線も確認。意味論とワイヤ形式を区別する。

## HTTP Caching

- 発行：IETF
- 版：RFC 9111 / STD 98, June 2022
- 確認日：2026-11-12
- URL：https://www.rfc-editor.org/rfc/rfc9111.html

§4 再利用・検証、§5.2 Cache-Control。教材はGETの完全な応答・単一ETagを扱い、Vary・Age・部分応答は対象外。

## HTTP overview and reference

- 発行：MDN
- 版：継続更新版・確認日の表示内容
- 確認日：2026-11-12
- URL：https://developer.mozilla.org/en-US/docs/Web/HTTP

HTTPの全体像、メッセージ、各バージョン、ヘッダーを確認。ブラウザ差は規範仕様と分ける。

## Set-Cookie header

- 発行：MDN
- 版：継続更新版・確認日の表示内容
- 確認日：2026-11-12
- URL：https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie

Domain・Path・期限・Secure・HttpOnly・明示的SameSite。省略時Laxの短時間POST例外、第三者Cookie制限、Partitionedはモデル対象外。

## Cross-Origin Resource Sharing (CORS)

- 発行：MDN
- 版：継続更新版・確認日の表示内容
- 確認日：2026-11-12
- URL：https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS

単純リクエストとPreflight、資格情報と明示Origin、ブラウザ差。

## Fetch Standard — CORS protocol

- 発行：WHATWG
- 版：Living Standard（確認時 Last Updated 19 October 2026）
- 確認日：2026-11-12
- URL：https://fetch.spec.whatwg.org/#http-cors-protocol

CORS safelist、credentials mode、応答共有チェック、CORS-preflight fetch。教材の固定ヘッダープリセットの根拠。

## HTTP caching

- 発行：MDN
- 版：継続更新版・確認日の表示内容
- 確認日：2026-11-12
- URL：https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching

private・no-cache・no-store、再検証とアセットのバージョン付きURL。

## Session Management Cheat Sheet

- 発行：OWASP
- 版：Cheat Sheet Series 継続更新版
- 確認日：2026-11-12
- URL：https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html

セッションID更新、期限、ログアウト時のサーバー側無効化、Cookie保護。

## Cross-Site Request Forgery Prevention Cheat Sheet

- 発行：OWASP
- 版：Cheat Sheet Series 継続更新版
- 確認日：2026-11-12
- URL：https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html

CSRFトークン・Origin検証・SameSiteの補助的防御。CORSと認可の相違。

## Module ngx_http_proxy_module — proxy_pass

- 発行：NGINX
- 版：オンラインモジュールリファレンス・1.1.12以降の通常prefix locationを対象
- 確認日：2026-11-12
- URL：https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass

URIあり／なしの置換、Host既定値、転送ヘッダー、タイムアウト。正規表現location・変数・rewrite・エスケープは教材対象外。

## NGINX Reverse Proxy

- 発行：F5 / NGINX
- 版：オンライン管理ガイド・確認日の表示内容
- 確認日：2026-11-12
- URL：https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/

proxy_passとproxy_set_headerの設定例。実NGINX実行の代わりではない。
