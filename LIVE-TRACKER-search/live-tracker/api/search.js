// Vercel Serverless Function。APIキーはサーバーの環境変数だけで使用します。
const API='https://app.ticketmaster.com/discovery/v2/events.json';
function localTime(value,zone){
  if(!value||!zone)return '';
  try{const d=new Date(value);if(isNaN(d))return '';const parts=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(d);const get=k=>parts.find(p=>p.type===k)?.value;return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;}catch{return ''}
}
function clean(s){return typeof s==='string'?s.slice(0,300):''}
function mapEvent(e){
 const d=e.dates?.start||{}, date=/^\d{4}-\d{2}-\d{2}$/.test(d.localDate||'')?d.localDate:'', time=!d.noSpecificTime&&/^\d{2}:\d{2}/.test(d.localTime||'')?d.localTime.slice(0,5):'';
 const url=typeof e.url==='string'&&/^https:\/\/[^\s]+$/i.test(e.url)?e.url:'';
 return {id:clean(e.id),title:clean(e.name),venue:clean(e._embedded?.venues?.[0]?.name),date:date&&time?`${date}T${time}`:'',dateOnly:date&&!time?date:'',url,timezone:clean(e.dates?.timezone),applyStart:e.sales?.public?.startTBD||e.sales?.public?.startTBA?'':localTime(e.sales?.public?.startDateTime,e.dates?.timezone),applyDeadline:localTime(e.sales?.public?.endDateTime,e.dates?.timezone)};
}
async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');
 if(req.method!=='GET')return res.status(405).json({error:'GETのみ対応しています。'});
 const q=typeof req.query.artist==='string'?req.query.artist.trim():'';
 if(!q||q.length>120)return res.status(400).json({error:'アーティスト名を1〜120文字で入力してください。'});
 if(!process.env.TICKETMASTER_API_KEY)return res.status(503).json({error:'検索にはサーバー側のAPIキー設定が必要です。READMEの設定手順をご確認ください。'});
 const url=new URL(API);url.search=new URLSearchParams({apikey:process.env.TICKETMASTER_API_KEY,keyword:q,classificationName:'music',size:'30',sort:'date,asc'}).toString();
 try{const response=await fetch(url,{signal:AbortSignal.timeout(8000),headers:{Accept:'application/json'}});if(!response.ok)return res.status(response.status===429?429:502).json({error:response.status===429?'検索回数の上限に達しました。時間をおいてお試しください。':'公演情報の取得に失敗しました。時間をおいてお試しください。'});const body=await response.json();return res.status(200).json({source:'Ticketmaster Discovery API',events:(body._embedded?.events||[]).map(mapEvent).filter(e=>e.title)});}catch{return res.status(502).json({error:'公演情報に接続できませんでした。時間をおいてお試しください。'});}
}
module.exports=handler;module.exports.mapEvent=mapEvent;
