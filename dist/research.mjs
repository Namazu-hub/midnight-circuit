import {TOOLS,equipTool,EQUIPMENT} from './equipment.mjs?v=4.9b';
import {applyRepairEffects,drawRepairMachines} from './repair-stations.mjs?v=4.9b';
// First overhaul milestone: shared rewards, spending and repair-linked exploration.
export const ECONOMY={pickup:5,enemy:15,repair:40,cache:75,max:99999};
export const GOODS=[{id:'heal',name:'応急補修 · HP +3',cost:25},{id:'drink',name:'モンエナ · 1本（Bで飲む）',cost:35},{id:'battery',name:'予備バッテリー · 残機 +1',cost:100},{id:'hint',name:'装置の位置ヒント',cost:10},{id:'assist',name:'近くの装置を自動補助',cost:80},...TOOLS];
export function balance(value){return Number.isFinite(value)?Math.min(ECONOMY.max,Math.max(0,Math.floor(value))):0;}
export function setupResearch(g){
 g.research={funds:0,earned:0,kills:0,repairs:0,fullRepairs:0,caches:0};
 g.level.vendors=g.level.vendorSites||[{x:g.level.spawn.x+70,y:g.level.spawn.y+40},...g.level.checkpoints.map(c=>({x:c.x+45,y:c.y}))];
 g.level.researchCaches=[];
 for(const [i,r] of g.level.relays.entries()){
  r.id??=`device-${g.index}-${i}`;r.rewardPaid=false;r.repairResult??=r.on?'restored':'broken';r.researchLink=[];
  if(g.level.pcb&&!r.puzzleType||g.level.printer||g.level.cart||r.portal||!r.mode)continue;
  // One-way service stairs are optional; they never gate the existing main route.
  for(let k=0;k<3;k++){
   const x=Math.max(10,Math.min(g.level.width-170,r.x-350+k*95)),y=r.y-45-k*65;
   const a={x,y,w:130,h:16,type:'ghost',group:r.id,requiresRepair:true};
   g.level.platforms.push(a);r.researchLink.push(g.level.platforms.length-1);
  }
  const top=g.level.platforms.at(-1);g.level.researchCaches.push({x:top.x+65,y:top.y-30,device:r.id,got:false,requiresRank:r.puzzleType?2:0});
  g.level.minY=Math.min(g.level.minY,top.y-120);
 }
}
export function grant(g,amount,text,x,y){const s=g.research;s.funds=balance(s.funds+amount);s.earned+=amount;g.events.push({type:'funds',text:`${text} +¥${amount}`,x,y});}
export function tickResearch(g){
 if(g.fever||!g.research)return;
 for(const c of g.level.chips)if(c.got&&!c.rewardPaid){c.rewardPaid=true;grant(g,ECONOMY.pickup,'科研費',c.x,c.y);}
 for(const e of g.level.enemies)if(!e.alive&&!e.rewardPaid){e.rewardPaid=true;g.research.kills++;grant(g,ECONOMY.enemy,'撃破助成',e.x,e.y);}
 for(const r of g.level.relays)if(r.on&&!r.rewardPaid){r.rewardPaid=true;if(!r.puzzleType)r.repairResult='restored';g.research.repairs++;grant(g,ECONOMY.repair,'修理助成',r.x,r.y);g.events.push({type:'researchRepair',x:r.x,y:r.y,text:r.effectText|| (r.researchLink.length?'装置復旧！ 緑の足場で上の科研費ボックスへ':'装置復旧！ 研究を再開できる')});}
 applyRepairEffects(g);
 for(const r of g.level.relays)if(r.on&&r.repairRank>=2&&!r.bonusPaid){r.bonusPaid=true;g.research.fullRepairs++;grant(g,30,'完全修理ボーナス',r.x,r.y);}
 for(const c of g.level.researchCaches)if(!c.got&&g.level.relays.find(r=>r.id===c.device)?.on&&(!c.requiresRank||(g.level.relays.find(r=>r.id===c.device)?.repairRank||0)>=c.requiresRank)&&Math.hypot(g.player.x+14-c.x,g.player.y+20-c.y)<38){c.got=true;g.research.caches++;grant(g,ECONOMY.cache,'高所探索ボーナス',c.x,c.y);}
}
export function nearVendor(g){return !g.fever&&g.level.vendors?.some(v=>Math.hypot(g.player.x+14-v.x,g.player.y+40-v.y)<155);}
export function purchase(g,id){
 const item=GOODS.find(i=>i.id===id);if(!item||!g.research||!nearVendor(g))return {ok:false,text:'自販機の近くで利用してください'};
 if(g.research.funds<item.cost)return {ok:false,text:'科研費が足りません。通常の修理は無料です'};
 const nearest=g.level.relays.filter(r=>!r.on&&!r.portal).sort((a,b)=>Math.hypot(g.player.x-a.x,g.player.y-a.y)-Math.hypot(g.player.x-b.x,g.player.y-b.y))[0];
 if(id==='heal'&&g.player.hp>=6)return {ok:false,text:'HPは満タンです'};
 if(id==='battery'&&g.lives>=3)return {ok:false,text:'バッテリーは最大3機です'};
 if(id==='drink'&&g.equipment.drinks>=EQUIPMENT.drinkCap)return {ok:false,text:'モンエナは3本まで持てます'};
 if(TOOLS.some(t=>t.id===id)&&g.equipment.weapon)return {ok:false,text:'装備中の工具を使い切ってください'};
 if(['hint','assist'].includes(id)&&!nearest)return {ok:false,text:'対象の未修理装置はありません'};
 if(id==='assist'&&Math.hypot(g.player.x-nearest.x,g.player.y-nearest.y)>800)return {ok:false,text:'装置が遠すぎます。近くの自販機へ進んでください'};
 if(id==='assist'&&nearest.actionRepair?.assisted)return {ok:false,text:'このハンドの補助は導入済みです'};
 if(id==='assist'&&nearest.worldRepair)return {ok:false,text:'この設備はPICOで操作します。位置ヒントを利用できます'};
 g.research.funds-=item.cost;let text='購入しました';
 if(id==='heal'){g.player.hp=Math.min(6,g.player.hp+3);g.player.displayHP=g.player.hp;text='応急補修完了！';}
 if(id==='battery'){g.lives++;text='予備バッテリーを追加！';}
 if(id==='drink'){g.equipment.drinks++;text='モンエナを保管。B / DRINKで使用';}
 if(TOOLS.some(t=>t.id===id)){equipTool(g,id);text='工具を装備。V / TOOLで使用';}
 if(id==='hint')text=`未修理装置まで ${Math.round(Math.abs(nearest.x-g.player.x))}：${nearest.x>g.player.x?'右':'左'}・${nearest.y<g.player.y?'上':'下'}。${nearest.label||'近くでパルス'}`;
 if(id==='assist'&&nearest.actionRepair){nearest.actionRepair.assisted=true;text='関節の緑の受付時間と部品回収範囲が広がりました。PICOで修理しよう！';}
 else if(id==='assist'){nearest.on=true;nearest.step=3;nearest.amount=6;nearest.repairRank=1;nearest.repairResult='応急修理';tickResearch(g);text='自動補助で装置が復旧しました';}
 return {ok:true,text};
}
export function drawResearch(c,g){if(!g.research||g.fever)return;if(!g.printer)drawRepairMachines(c,g);c.save();c.textAlign='center';
 for(const v of g.level.vendors){if(Math.abs(v.x-g.player.x)>1400)continue;c.fillStyle='#1a3447';c.fillRect(v.x-24,v.y-74,48,74);c.strokeStyle='#8ff4d0';c.lineWidth=2;c.strokeRect(v.x-24,v.y-74,48,74);c.fillStyle='#8ff4d0';c.fillRect(v.x-17,v.y-62,34,20);c.font='bold 12px sans-serif';c.fillStyle='#132d3b';c.fillText('¥ LAB',v.x,v.y-48);c.fillStyle='#ffce87';c.fillRect(v.x-14,v.y-28,28,10);c.fillStyle='#c8f4eb';c.fillText('研究支援 自販機',v.x,v.y-87);}
 for(const box of g.level.researchCaches){if(box.got)continue;const device=g.level.relays.find(r=>r.id===box.device);const on=device?.on&&(!box.requiresRank||(device.repairRank||0)>=box.requiresRank);c.globalAlpha=on?1:.35;c.fillStyle='#ffda85';c.fillRect(box.x-19,box.y-16,38,30);c.strokeStyle='#fff4bd';c.strokeRect(box.x-19,box.y-16,38,30);c.fillStyle='#553c23';c.font='bold 18px sans-serif';c.fillText('¥',box.x,box.y+5);if(!on&&box.requiresRank){c.font='11px sans-serif';c.fillStyle='#e5d6ac';c.fillText('完全修理で解錠',box.x,box.y+30);}}c.restore();}
