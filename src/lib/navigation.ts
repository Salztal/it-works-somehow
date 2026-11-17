import {sections,entries,areaLabel} from './catalog';

// Presentation metadata only. Names and published category URLs come from the catalog.
const presentation:Record<string,{group:string;order:number;summary:string;practice:string;practiceLabel:string}>={
 network:{group:'communication',order:0,summary:'通信の仕組みから、TCP/IPの観測・障害調査へ。',practice:'/network/unit-e/n19-dns/#lab',practiceLabel:'Network：DNSの動きを追う'},
 java:{group:'development',order:1,summary:'Javaの基本から、DB連携・Webアプリの実装へ。',practice:'/java/downloads/',practiceLabel:'Java：演習コードを手に入れる'},
 security:{group:'security',order:2,summary:'攻撃と防御、暗号・認証を基礎から確かめる。',practice:'/security/advanced/s07-01/#lab',practiceLabel:'Security：TLSの条件を試す'},
 git:{group:'development',order:3,summary:'日々の変更管理と、困ったときの安全な対処。',practice:'/git/lab/',practiceLabel:'Git：状態の変化を試す'},
 'test-design':{group:'development',order:4,summary:'仕様から確認条件を選び、見落としを探す。',practice:'/test-design/lab/',practiceLabel:'テスト設計：条件と結果を比べる'},
 web:{group:'communication',order:5,summary:'HTTPからアプリまで、通信を追って切り分ける。',practice:'/web/lab/',practiceLabel:'HTTP・Webアプリ：通信を追う'},
 spring:{group:'development',order:6,summary:'DI・JPA・Transactionから業務アプリの設計を読む。',practice:'/spring/lab/',practiceLabel:'Spring：内部の状態を追う'},
 mail:{group:'communication',order:7,summary:'メールの受付・配送・認証と、届かない理由を追う。',practice:'/mail/lab/',practiceLabel:'Mail：配送の流れを追う'},
};
export const courses=sections.filter(s=>!('section' in s)).map(s=>({
 id:s.area,label:areaLabel(s.area),path:s.path,
 summary:presentation[s.area]?.summary??s.description,
 group:presentation[s.area]?.group??'other',order:presentation[s.area]?.order??99,
 pages:entries.filter(e=>e.area===s.area).length,
 practice:presentation[s.area]?.practice,practiceLabel:presentation[s.area]?.practiceLabel,
})).sort((a,b)=>a.order-b.order);
export const courseGroups=[
 {id:'communication',label:'通信・Web・メール'},
 {id:'development',label:'開発・設計'},
 {id:'security',label:'セキュリティ'},
 {id:'other',label:'その他の教材'},
].map(g=>({...g,courses:courses.filter(c=>c.group===g.id)})).filter(g=>g.courses.length);
export const helpLinks=[
 {path:'/git/rescue/',label:'Git救命救急センター'},
 {path:'/web/diagnosis/',label:'Web障害診断センター'},
 {path:'/mail/diagnosis/',label:'メール配送障害診断センター'},
 {path:'/network/unit-f/n24-troubleshooting/',label:'Network：通信障害の切り分け'},
 {path:'/java/lessons/troubleshooting/',label:'Java：つまずきから調べる'},
];
