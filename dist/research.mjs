// First overhaul milestone: shared rewards, spending and repair-linked exploration.
export const ECONOMY={pickup:5,enemy:15,repair:40,cache:75,max:99999};
export const GOODS=[{id:'heal',name:'応急補修 · HP +3',cost:25},{id:'drink',name:'モンエナ · 9秒加速',cost:35},{id:'battery',name:'予備バッテリー · 残機 +1',cost:100},{id:'hint',name:'装置の位置ヒント',cost:10},{id:'assist',name:'近くの装置を自動補助',cost:80}];
export function balance(value){return Number.isFinite(value)?Math.min(ECONOMY.max,Math.max(0,Math.floor(value))):0;}
export function setupResearch(g){
 g.research={funds:0,earned:0,kills:0,repairs:0,caches:0};
 g.level.vendors=[{x:g.level.spawn.x+70,y:g.level.spawn.y+40},...g.level.checkpoints.map(c=>({x:c.x+45,y:c.y}))];
 g.level.researchCaches=[];
 for(const [i,r] of g.level.relays.entries()){
  r.id??=`device-${g.index}-${i}`;r.rewardPaid=false;r.repairResult=r.on?'restored':'broken';r.researchLink=[];
  if(g.level.cart||r.portal||!r.mode)continue;
  // One-way service stairs are optional; they never gate the existing main route.
  for(let k=0;k<3;k++){
   const x=Math.max(10,Math.min(g.level.width-170,r.x-350+k*95)),y=r.y-45-k*65;
   const a={x,y,w:130,h:16,type:'ghost',group:r.id,requiresRepair:true};
   g.level.platforms.push(a);r.researchLink.push(g.level.platforms.length-1);
  }
  const top=g.level.platforms.at(-1);g.level.researchCaches.push({x:top.x+65,y:top.y-30,device:r.id,got:false});
  g.level.minY=Math.min(g.level.minY,top.y-120);
 }
}
function grant(g,amount,text,x,y){const s=g.research;s.funds=balance(s.funds+amount);s.earned+=amount;g.events.push({type:'funds',text:`${text} +¥${amount}`,x,y});}
export function tickResearch(g){
 if(g.fever||!g.research)return;
 for(const c of g.level.chips)if(c.got&&!c.rewardPaid){c.rewardPaid=true;grant(g,ECONOMY.pickup,'科研費',c.x,c.y);}
 for(const e of g.level.enemies)if(!e.alive&&!e.rewardPaid){e.rewardPaid=true;g.research.kills++;grant(g,ECONOMY.enemy,'撃破助成',e.x,e.y);}
 for(const r of g.level.relays)if(r.on&&!r.rewardPaid){r.rewardPaid=true;r.repairResult='restored';g.research.repairs++;grant(g,ECONOMY.repair,'修理助成',r.x,r.y);g.events.push({type:'researchRepair',x:r.x,y:r.y,text:r.researchLink.length?'装置復旧！ 緑の足場で上の科研費ボックスへ':'装置復旧！ 研究を再開できる'});}
 for(const c of g.level.researchCaches)if(!c.got&&g.level.relays.find(r=>r.id===c.device)?.on&&Math.hypot(g.player.x+14-c.x,g.player.y+20-c.y)<38){c.got=true;g.research.caches++;grant(g,ECONOMY.cache,'高所探索ボーナス',c.x,c.y);}
}
export function nearVendor(g){return !g.fever&&g.level.vendors?.some(v=>Math.hypot(g.player.x+14-v.x,g.player.y+40-v.y)<155);}
export function purchase(g,id){
 const item=GOODS.find(i=>i.id===id);if(!item||!g.research||!nearVendor(g))return {ok:false,text:'自販機の近くで利用してください'};
 if(g.research.funds<item.cost)return {ok:false,text:'科研費が足りません。通常の修理は無料です'};
 const nearest=g.level.relays.filter(r=>!r.on&&!r.portal).sort((a,b)=>Math.hypot(g.player.x-a.x,g.player.y-a.y)-Math.hypot(g.player.x-b.x,g.player.y-b.y))[0];
 if(id==='heal'&&g.player.hp>=6)return {ok:false,text:'HPは満タンです'};
 if(id==='battery'&&g.lives>=3)return {ok:false,text:'バッテリーは最大3機です'};
 if(id==='drink'&&g.player.boost>0)return {ok:false,text:'モンエナの効果が残っています'};
 if(['hint','assist'].includes(id)&&!nearest)return {ok:false,text:'対象の未修理装置はありません'};
 if(id==='assist'&&Math.hypot(g.player.x-nearest.x,g.player.y-nearest.y)>800)return {ok:false,text:'装置が遠すぎます。近くの自販機へ進んでください'};
 g.research.funds-=item.cost;let text='購入しました';
 if(id==='heal'){g.player.hp=Math.min(6,g.player.hp+3);g.player.displayHP=g.player.hp;text='応急補修完了！';}
 if(id==='battery'){g.lives++;text='予備バッテリーを追加！';}
 if(id==='drink'){g.player.boost=9;text='モンエナ！ 9秒間の虹色加速';}
 if(id==='hint')text=`未修理装置まで ${Math.round(Math.abs(nearest.x-g.player.x))}：${nearest.x>g.player.x?'右':'左'}・${nearest.y<g.player.y?'上':'下'}。${nearest.label||'近くでパルス'}`;
 if(id==='assist'){nearest.on=true;nearest.step=3;nearest.amount=6;tickResearch(g);text='自動補助で装置が復旧しました';}
 return {ok:true,text};
}
export function drawResearch(c,g){if(!g.research||g.fever)return;c.save();c.textAlign='center';
 for(const v of g.level.vendors){if(Math.abs(v.x-g.player.x)>1400)continue;c.fillStyle='#1a3447';c.fillRect(v.x-24,v.y-74,48,74);c.strokeStyle='#8ff4d0';c.lineWidth=2;c.strokeRect(v.x-24,v.y-74,48,74);c.fillStyle='#8ff4d0';c.fillRect(v.x-17,v.y-62,34,20);c.font='bold 12px sans-serif';c.fillStyle='#132d3b';c.fillText('¥ LAB',v.x,v.y-48);c.fillStyle='#ffce87';c.fillRect(v.x-14,v.y-28,28,10);c.fillStyle='#c8f4eb';c.fillText('研究支援 自販機',v.x,v.y-87);}
 for(const box of g.level.researchCaches){if(box.got)continue;const on=g.level.relays.find(r=>r.id===box.device)?.on;c.globalAlpha=on?1:.35;c.fillStyle='#ffda85';c.fillRect(box.x-19,box.y-16,38,30);c.strokeStyle='#fff4bd';c.strokeRect(box.x-19,box.y-16,38,30);c.fillStyle='#553c23';c.font='bold 18px sans-serif';c.fillText('¥',box.x,box.y+5);}c.restore();}
