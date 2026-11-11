// Shared by the browser labs and Node Web Crypto regression checks.
export const hex=(b:ArrayBuffer|Uint8Array)=>Array.from(b instanceof Uint8Array?b:new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
function encode(text:string) { if(text.length>4096)throw Error('入力は4096文字以内にしてください。');return new TextEncoder().encode(text); }
export async function hashText(text:string) { return hex(await crypto.subtle.digest('SHA-256',encode(text))); }
export async function encryptText(text:string,existing?:CryptoKey) {
  const plain=encode(text);
  const key=existing || await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const data=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,tagLength:128},key,plain));
  return {key,iv,data};
}
export async function decryptText(key:CryptoKey,iv:Uint8Array,data:Uint8Array) {
  return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:new Uint8Array(iv),tagLength:128},key,new Uint8Array(data)));
}
export async function signText(text:string) {
  const plain=encode(text);
  const key=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},false,['sign','verify']);
  const data=new Uint8Array(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key.privateKey,plain));
  return {key,data};
}
export async function verifyText(key:CryptoKey,text:string,data:Uint8Array) {
  return crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,new Uint8Array(data),encode(text));
}
