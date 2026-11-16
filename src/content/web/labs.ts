export const labs=[['trace','HTTPリクエスト追跡ラボ'],['request','HTTPリクエスト組み立て機'],['redirect','リダイレクト追跡'],['cookie','Cookie・セッション研究室'],['cors','CORS・Preflight実験室'],['cache','キャッシュ研究室'],['proxy','nginx・リバースプロキシ経路実験'],['lb','LB・セッション・障害シミュレーター']] as const;
export const intents=[
 {title:'HTTP通信の仕組みを知りたい',lesson:'web-h01',lab:'trace',mission:'web-m1'},
 {title:'ログイン状態を理解したい',lesson:'web-h05',lab:'cookie',mission:'web-m2'},
 {title:'APIが失敗する理由を探したい',lesson:'web-h06',lab:'cors',mission:'web-m3'},
 {title:'キャッシュの挙動を試したい',lesson:'web-h07',lab:'cache',mission:'web-m4'},
 {title:'nginxの転送先を確認したい',lesson:'web-h08',lab:'proxy',mission:'web-m5'},
 {title:'500系エラーを切り分けたい',lesson:'web-h14',lab:'trace',mission:'web-m5'},
];
