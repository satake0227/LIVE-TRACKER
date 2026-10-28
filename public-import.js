/* 公開日程のプレーンテキストを端末内で解析します。通信は行いません。 */
(function(root){
 'use strict';
 function parse(text,title,url){
  if(typeof text!=='string'||text.length>50000)throw Error('貼り付けは50,000文字以内にしてください。');
  if(!title?.trim())throw Error('公演名を入力してください。');
  if(url){try{const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password)throw Error();}catch{throw Error('出典URLはhttps://から始まるURLにしてください。');}}
  const lines=text.normalize('NFKC').replace(/\r/g,'').split('\n').map(s=>s.trim()).filter(Boolean);
  let year='',record=null;const events=[];
  const dateString=(y,m,d)=>{const value=`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;const check=new Date(value+'T00:00:00Z');return !isNaN(check)&&check.toISOString().slice(0,10)===value?value:'';};
  function finish(){
   // 会場のない日付は記事の投稿日等の可能性があるため候補にしません。
   if(!record?.day||!record.venue)return;
   const times=[...new Set(record.times)];
   for(const time of times.length?times:[''])events.push({title:title.trim(),venue:record.venue,date:time?`${record.day}T${time}`:'',dateOnly:time?'':record.day,url:url||'',timezone:'',applyStart:'',applyDeadline:''});
  }
  for(const line of lines){
   // 年は「2027年公演日程」のような明示された見出しからのみ引き継ぎます。
   const heading=line.match(/(?:^|[<【「])\s*((?:19|20|21)\d{2})年\s*(?:の)?(?:公演日程|開催日程|日程|スケジュール|Schedule)/i);
   if(heading){year=heading[1];continue;}
   let m=line.match(/^((?:19|20|21)\d{2})(?:年|[.\-/])(\d{1,2})(?:月|[.\-/])(\d{1,2})日?/);
   let prefix='',day='';
   if(m){day=dateString(m[1],m[2],m[3]);prefix=m[0];}
   else if(year&&(m=line.match(/^(\d{1,2})月(\d{1,2})日/))){day=dateString(year,m[1],m[2]);prefix=m[0];}
   if(prefix){
    finish();record=null;
    let rest=line.slice(prefix.length).replace(/^\s*[（(][^）)]*[）)]\s*/,'').trim();
    // 「〜より開催」の文章や受付案内を、日程表の行として解釈しません。
    if(!day||/^(より|から|まで)|受付|締切|発表|発売|申込|開催決定/.test(rest))continue;
    record={day,venue:'',times:[]};
    if(rest&&!/開場|開演/.test(rest)&&!rest.includes(title.normalize('NFKC').trim()))record.venue=rest.replace(/^会場\s*[:：]\s*/,'');
   }
   if(!record)continue;
   const venue=line.match(/^(?:【会場】|会場\s*[:：])\s*(.+)$/);if(venue)record.venue=venue[1].trim();
   for(const t of line.matchAll(/開演\s*[:：]?\s*([01]?\d|2[0-3]):([0-5]\d)/g))record.times.push(`${t[1].padStart(2,'0')}:${t[2]}`);
  }
  finish();
  return events.filter((e,i,all)=>all.findIndex(x=>x.date===e.date&&x.dateOnly===e.dateOnly&&x.venue===e.venue)===i).slice(0,100);
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={parse};else root.PublicSchedule={parse};
})(typeof globalThis!=='undefined'?globalThis:this);
