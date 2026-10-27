// In-world repair tasks: carry a physical part, install it at a reachable node,
// then use a fresh PICO pulse in the calibration window. No modal or auto-solver.
export function setupActionHand(g,r){
 r.actionRepair={kind:'joint-locks',completed:0,assisted:false,
  nodes:[{x:720,y:350,floor:380},{x:950,y:235,floor:265},{x:1170,y:120,floor:150}].map((n,i)=>({...n,id:`${r.id}-joint-${i}`,installed:false,locked:false,deploy:0})),
  parts:[{x:630,y:345},{x:460,y:255},{x:650,y:145}].map((p,i)=>({...p,id:`${r.id}-pin-${i}`,state:'loose'}))};
 const L=g.level;
 L.platforms.push({x:400,y:290,w:145,h:18,type:'platform'},{x:590,y:180,w:155,h:18,type:'platform'},
  {x:660,y:380,w:150,h:18,type:'platform'},
  {x:870,y:265,w:180,h:18,type:'ghost',actionDevice:r.id,actionStep:1},
  {x:1090,y:150,w:180,h:18,type:'ghost',actionDevice:r.id,actionStep:2});
 // The final bridge grows one finger section at a time, without changing the
 // original printed route. Collision begins only when each finger has settled.
 for(let i=0;i<3;i++)L.platforms.push({x:1200+i*100,y:490,w:100,h:16,type:'ghost',actionDevice:r.id,actionStep:i+1});
 L.signs.push({x:490,y:220,text:'固定ピンを拾い、関節へ運ぼう！'},{x:975,y:65,text:'① 運ぶ → Cで装着 → 緑の時にパルス'});
 L.students[0].lines.push('ハンドの固定ピンが高い棚に散らばった！ 触れると運べるよ。','関節でCか画面の修理ボタン。装着後、緑の合図にパルス！','直した指が次の足場になる。モンエナなら棚を素早く回れるよ。');
 L.tip='ハンド修理の試作：棚の固定ピンに触れて運搬 → 関節でC／修理ボタン → 緑の合図でパルス。通常の造形ルートも通れます。';
 g.carriedPart=null;
}
const distance=(p,o)=>Math.hypot(p.x+14-o.x,p.y+20-o.y);
export function activeActionDevice(g){return g?.level.relays.find(r=>r.actionRepair&&!r.on)||null;}
export function calibrationPhase(g,index){return (g.time/3.2+index*.23)%1;}
export function calibrationReady(g,r,index){const phase=calibrationPhase(g,index);return phase>=(r.actionRepair.assisted?.18:.35)&&phase<=(r.actionRepair.assisted?.82:.65);}
export function nearbyAction(g){
 const r=activeActionDevice(g);if(!r)return null;const a=r.actionRepair,node=a.nodes[a.completed];
 if(node&&distance(g.player,node)<76)return {device:r,node,index:a.completed,label:node.installed?'緑でパルス！':g.carriedPart?'固定ピンを装着':'固定ピンを探す'};
 if(distance(g.player,r)<100)return {device:r,node:null,label:'ハンドの修理手順'};
 return null;
}
export function actionObjective(g){
 const r=activeActionDevice(g);if(!r||g.player.x>1700)return '';
 const a=r.actionRepair,n=a.nodes[a.completed];
 if(n.installed)return `関節 ${a.completed+1}/3：緑の合図に X／パルス！`;
 if(g.carriedPart)return `固定ピン運搬中 → 関節 ${a.completed+1}/3 で C／装着`;
 return `ハンド修理 ${a.completed}/3：上の棚で金色の固定ピンを拾おう`;
}
export function actionPlatformSolid(g,p){const r=g.level.relays.find(r=>r.id===p.actionDevice);return !!r&&r.actionRepair.nodes[p.actionStep-1]?.deploy>=.98;}
export function returnCarriedPart(g){if(!g.carriedPart)return;for(const r of g.level.relays)for(const part of r.actionRepair?.parts||[])if(part.id===g.carriedPart)part.state='loose';g.carriedPart=null;}
export function tickActionRepairs(g,input,activated,dt){
 for(const r of g.level.relays){const a=r.actionRepair;if(!a)continue;
  a.nodes.forEach(n=>{n.deploy=Math.min(1,n.deploy+(n.locked?dt*1.6:0));});
  if(r.on)continue;
  if(!g.carriedPart){const part=a.parts.find(p=>p.state==='loose'&&distance(g.player,p)<(a.assisted?50:30));if(part){part.state='carried';g.carriedPart=part.id;g.events.push({type:'actionStep',x:part.x,y:part.y,text:`固定ピンを回収！ 関節${a.completed+1}へ運ぼう`});}}
  const nearby=nearbyAction(g);if(!nearby||nearby.device!==r)continue;const n=nearby.node;
  if(input.interact){
   if(!n){g.events.push({type:'repairStep',text:actionObjective(g)});continue;}
   if(!n.installed&&g.carriedPart){const part=a.parts.find(p=>p.id===g.carriedPart);if(part){part.state='installed';g.carriedPart=null;n.installed=true;g.cooldown=Math.min(g.cooldown,.35);g.events.push({type:'actionStep',x:n.x,y:n.y,text:'固定ピン装着！ 緑の合図で X／パルスを放とう'});}}
   else g.events.push({type:'repairStep',text:n.installed?'緑の合図に X／パルス！':'上の棚にある金色の固定ピンを運んでこよう'});
  }
  if(activated&&n?.installed&&!n.locked){
   // Only a fresh nearby pulse counts, never a lingering pulse field.
   g.cooldown=Math.min(g.cooldown,.7);
   if(!calibrationReady(g,r,nearby.index)){g.events.push({type:'repairStep',text:'まだ位置がずれている。緑の合図でもう一度！'});continue;}
   n.locked=true;a.completed++;
   // A fixed dock is a safe return point; no moving or airborne coordinates.
   g.respawn={x:n.x-14,y:n.floor-40};g.checkpoint=true;
   if(a.completed===a.nodes.length){r.on=true;r.repairRank=Math.max(1,r.repairRank||0);r.repairResult='応急修理';if(!r.healPaid){g.player.hp=Math.min(6,g.player.hp+1);r.healPaid=true;}g.events.push({type:'repairComplete',x:n.x,y:n.y,text:'ハンド応急修理完了！ 造形槽に橋が開通。入口端末でPICOを接続すると完全修理もできる。'});}
   else g.events.push({type:'actionStep',x:n.x,y:n.y,text:`関節${a.completed}を固定！ 次の指の足場が開く。チェックポイント更新。`});
  }
 }
}
function path(c,points,color,width){c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();}
function pin(c,x,y,scale=1){c.save();c.translate(x,y);c.scale(scale,scale);c.fillStyle='#172b3c';c.fillRect(-9,-17,18,34);c.fillStyle='#ffda87';c.fillRect(-5,-13,10,26);c.fillRect(-10,-13,20,6);c.fillRect(-10,7,20,6);c.fillStyle='#fff6c6';c.fillRect(-3,-10,3,19);c.restore();}
export function drawActionRepairs(c,g){
 c.save();c.lineCap='round';c.textAlign='center';
 for(const r of g.level.relays){const a=r.actionRepair;if(!a)continue;
  // Individual powered fingers lead to the three real calibration docks.
  const base=[1170,575];
  for(const [i,n] of a.nodes.entries()){
   const d=n.deploy,tipX=n.x+(1200+i*100+50-n.x)*d,tipY=n.y+(515-n.y)*d;
   const mid=[1100-i*85,390-i*70];path(c,[base,mid,[tipX,tipY]],'#152d40',25);path(c,[base,mid,[tipX,tipY]],n.locked?'#82d6ce':'#5d798d',16);
   for(const [x,y] of [mid,[tipX,tipY]]){c.fillStyle='#b2cbd2';c.beginPath();c.arc(x,y,13,0,Math.PI*2);c.fill();c.fillStyle=n.locked?'#65ffd2':'#eeaa76';c.beginPath();c.arc(x,y,6,0,Math.PI*2);c.fill();}
   c.fillStyle='#112d41';c.fillRect(n.x-36,n.y-27,72,56);c.strokeStyle=n.locked?'#75efce':'#ffd28a';c.lineWidth=2;c.strokeRect(n.x-36,n.y-27,72,56);
   c.font='bold 15px sans-serif';c.fillStyle='#e2f7f0';c.fillText(n.locked?'✓ 固定':`関節 ${i+1}`,n.x,n.y-7);
   if(n.installed&&!n.locked&&i===a.completed){const ready=calibrationReady(g,r,i);c.fillStyle='#345067';c.fillRect(n.x-42,n.y-51,84,12);c.fillStyle='#75efce';c.fillRect(n.x-42+(a.assisted?.18:.35)*84,n.y-51,(a.assisted?.64:.3)*84,12);c.fillStyle='#fff';c.fillRect(n.x-42+calibrationPhase(g,i)*84,n.y-55,3,20);c.fillStyle=ready?'#75efce':'#ffd28a';c.font='bold 13px sans-serif';c.fillText(ready?'今！ パルス':'緑の帯を待とう',n.x,n.y-64);}
   c.font='11px sans-serif';c.fillStyle=n.locked?'#75efce':'#ffd28a';c.fillText(n.locked?'次の道を復旧':i>a.completed?'前の関節を先に':n.installed?'X / パルス':'C / ピン装着',n.x,n.y+15);
  }
  for(const part of a.parts)if(part.state==='loose'){const bob=Math.sin(g.time*3)*3;pin(c,part.x,part.y+bob);c.fillStyle='#ffdc91';c.font='11px sans-serif';c.fillText('固定ピン',part.x,part.y-25);}
  if(g.carriedPart&&a.parts.some(p=>p.id===g.carriedPart)){pin(c,g.player.x+14,g.player.y-19,.65);c.fillStyle='#ffe3a2';c.font='10px sans-serif';c.fillText('運搬中',g.player.x+14,g.player.y-39);}
  if(g.repairSession?.id===r.id){path(c,[[g.player.x+14,g.player.y+20],[r.x-50,r.y+5],[r.x,r.y]],'#80ffd8',4);c.fillStyle='#80ffd8';c.font='13px sans-serif';c.fillText('PICO LINK',r.x,r.y-45);}
 }
 c.restore();
}
