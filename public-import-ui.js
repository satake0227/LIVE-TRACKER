'use strict';
// 公開情報だけを新規入力へ反映します。申込結果・支払い情報へは書き込みません。
function showOfficialLinks(){
 const artist=$('#wizardForm').elements.artist.value.normalize('NFKC').replace(/\s/g,'').toLowerCase(),out=$('#officialLinks');out.replaceChildren();
 if(['田村ゆかり','tamurayukari','yukaritamura'].includes(artist)){
  const p=node('p');link(p,'https://www.tamurayukari.com/live/list.php');p.firstChild.textContent='田村ゆかり 公式Live一覧を開く ↗';out.append(p);
  const info=node('p');link(info,'https://www.tamurayukari.com/information/list.php?category=2');info.firstChild.textContent='公式の公演・イベント告知を開く ↗';out.append(info);
 }
}
$('#wizardForm').elements.artist.addEventListener('input',showOfficialLinks);window.addEventListener('artistChanged',showOfficialLinks);
$('#parsePublic').onclick=()=>{
 const out=$('#publicCandidates');out.replaceChildren();
 try{
  const candidates=PublicSchedule.parse($('#publicText').value,$('#publicTitle').value,$('#publicUrl').value.trim());
  if(!candidates.length){out.textContent='日付と会場を特定できませんでした。年を含む日程見出しと、会場の行を含めてください。手入力もできます。';return}
  out.append(node('p','hint',`${candidates.length}件の候補。年・日付・会場・開演時刻を出典と照合してください。受付期間・当落発表は自動抽出しません。`));
  for(const item of candidates){
   const c=node('div','candidate');c.append(node('strong','',item.title),node('p','muted',`${fmt(item.date||item.dateOnly)} · ${item.venue}`));link(c,item.url);
   c.append(button('この候補を反映',()=>{
    const f=$('#wizardForm');if(mode!=='new')return;
    if(['title','venue','date','dateOnly','url'].some(k=>f.elements[k].value)&&!confirm('公演情報を選んだ候補で更新しますか？申込・支払い情報は変更しません。'))return;
    for(const key of ['title','venue','date','dateOnly'])f.elements[key].value=item[key];
    if(item.url)f.elements.url.value=item.url;
    // 日程からタイムゾーンは推測しません。必要に応じて手入力します。
    $('#publicText').value='';out.replaceChildren(node('p','hint','公演情報に反映しました。内容を確認して次へ進んでください。'));
   }));out.append(c);
  }
 }catch(e){out.textContent=e.message}
};
