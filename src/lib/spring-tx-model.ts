export type TxConfig={timing:string;exception:string;rollbackFor:string;path:string;flush:string;caught:string};
export type TxState={step:number;status:'idle'|'active'|'no-service-tx'|'committed'|'rolled-back'|'individual-commits';orders:number;stock:number;dbOrders:number;dbStock:number;pendingOrders:number;pendingStock:number;sql:string[];log:string[];done:boolean;thrown:boolean;escaped:boolean};
export const initialTx=():TxState=>({step:0,status:'idle',orders:0,stock:10,dbOrders:0,dbStock:10,pendingOrders:0,pendingStock:10,sql:[],log:['開始前：注文0件・在庫10。'],done:false,thrown:false,escaped:false});
export const defaultTxConfig=():TxConfig=>({timing:'none',exception:'runtime',rollbackFor:'no',path:'proxy',flush:'no',caught:'no'});
export function validateTx(c:TxConfig){for(const [k,values] of Object.entries({timing:['none','before','after'],exception:['runtime','checked'],rollbackFor:['no','yes'],path:['proxy','self'],flush:['no','yes'],caught:['no','yes']}))if(!values.includes(c[k as keyof TxConfig]))throw Error(`未定義の条件：${k}`);}
export function txNext(input:TxState,c:TxConfig):TxState {
 validateTx(c);if(input.done)throw Error('この試行は終了しました。リセットしてください。');
 const s=structuredClone(input),proxy=c.path==='proxy',say=(t:string)=>s.log.push(t);
 const flush=()=>{if(s.dbOrders!==s.pendingOrders)s.sql.push('INSERT orders (quantity) VALUES (1)');if(s.dbStock!==s.pendingStock)s.sql.push('UPDATE stock SET quantity=9');s.dbOrders=s.pendingOrders;s.dbStock=s.pendingStock;};
 const throwAt=(t:string)=>{if(c.timing!==t)return false;s.thrown=true;s.escaped=c.caught==='no';say(`${c.exception==='runtime'?'RuntimeException':'Checked Exception'}発生。${c.caught==='yes'?'Serviceでcatchし通常復帰（rollback-onlyなし）。':'外へ伝播。'}`);s.step=6;return true;};
 switch(s.step){
 case 0:s.status=proxy?'active':'no-service-tx';say(proxy?'Serviceプロキシ：REQUIREDのTransaction開始。':'自己呼出し：Serviceの新境界なし。Repositoryごとに確定する仮定。');s.step=1;break;
 case 1:s.pendingOrders=1;if(!proxy){s.sql.push('INSERT orders (quantity) VALUES (1)');s.dbOrders=1;s.orders=1;say('注文Repository自身のTransactionで注文1件を確定。');}else say('注文登録：永続化の変更を保持、まだ未確定。');s.step=2;break;
 case 2:if(c.flush==='yes'&&proxy){flush();say('明示flush：注文のSQLを発行、確定済み注文は0のまま。');}else say(proxy?'明示flushなし。同期は最終確定の前。':'Service共通のflush境界なし。注文は個別確定済み。');s.step=3;break;
 case 3:if(!throwAt('before')){say('在庫減算前：例外なし。');s.step=4;}break;
 case 4:s.pendingStock=9;if(!proxy){s.sql.push('UPDATE stock SET quantity=9');s.stock=9;s.dbStock=9;say('在庫Repository自身のTransactionで在庫9を確定。');}else say('在庫減算：未確定の在庫9。');s.step=5;break;
 case 5:if(!throwAt('after')){say('在庫減算後：例外なし。');s.step=6;}break;
 case 6:if(!proxy){s.status='individual-commits';say('Service単位の一括commit/rollbackはない。実行済みRepositoryの確定結果が残る。');}else if(s.thrown&&c.caught==='no'&&(c.exception==='runtime'||c.rollbackFor==='yes')){s.status='rolled-back';s.dbOrders=s.orders;s.dbStock=s.stock;say('Proxyの例外規則に一致：rollback。発行済みSQLもDBでは取消し。');}else{flush();s.orders=s.dbOrders;s.stock=s.dbStock;s.status='committed';say(s.thrown&&c.caught==='no'?'checked例外は標準規則の対象外：commit後も例外は呼出し元へ伝わる。':'通常復帰：flushしてcommit。');}s.done=true;s.step=7;break;
 default:throw Error('未定義の処理段階です。');
 }
 return s;
}
export function runTx(c:TxConfig){let s=initialTx();while(!s.done)s=txNext(s,c);return s;}
