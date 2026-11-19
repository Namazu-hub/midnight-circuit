// Both rigs belong to a single attempt. A recovery keeps the paid rig available.
export function installHandRigs(level){
 level.handRigs=[
  {kind:'tendon',x:4340,y:-600,relay:'bio-joints',cost:60,paid:false,locked:false,time:0,extension:0},
  {kind:'grip',x:8130,y:510,relay:'bio-grasp',cost:90,paid:false,delivered:false,time:0,phase:'dock'}
 ];
}
const calibrated=(g,r)=>g.level.relays.find(v=>v.id===r.relay)?.on;
export const tensionAt=t=>(1-Math.cos(t*Math.PI))/2;
export const balanced=t=>{const tension=tensionAt(t);return tension>=.4&&tension<=.7;};
export function handControl(g){
 return g?.level.handRigs?.find(r=>!(r.kind==='tendon'?r.locked:r.paid)&&
  Math.abs(g.player.x+14-r.x)<68&&Math.abs(g.player.y+40-r.y)<65);
}
export function handLabel(g,r){
 if(!calibrated(g,r))return '先に左の関節を校正';
 if(r.paid)return '張力を固定';
 return (r.kind==='tendon'?'腱を巻く':'三指を起動')+' ¥'+r.cost;
}
function announce(g,r,text){g.events.push({type:'handNotice',x:r.x,y:r.y-65,text});}
function operate(g,r){
 if(!calibrated(g,r)){announce(g,r,'左の校正台で関節角を合わせよう');return;}
 if(!r.paid){
  if(g.research.funds<r.cost){announce(g,r,'科研費があと¥'+(r.cost-g.research.funds)+'必要。チップや敵の撃破で集めよう');return;}
  g.research.funds-=r.cost;r.paid=true;
  announce(g,r,r.kind==='tendon'?'−¥'+r.cost+'　針が中央の帯に入ったらもう一度固定':'−¥'+r.cost+'　試験片に乗ると三指が把持します');return;
 }
 if(r.kind==='tendon'){
  r.locked=balanced(r.time);
  announce(g,r,r.locked?'拮抗張力が釣り合った。指骨を伸展します':'張力が帯の外です。もう一度固定できます');
 }
}
export function tickHandRigs(g,input,dt){
 const rigs=g.level.handRigs;if(!rigs)return;
 const control=input.interact&&handControl(g);if(control)operate(g,control);
 const [tendon,grip]=rigs;
 if(tendon.paid&&!tendon.locked)tendon.time+=dt;
 if(tendon.locked)tendon.extension=Math.min(1,tendon.extension+dt/1.5);
 const block=g.level.platforms.find(p=>p.gripSpecimen);
 const oldX=block.x,oldY=block.y;
 const aboard=g.player.standing===block.id;
 if(grip.paid){
  if(grip.phase==='dock'&&aboard){grip.phase='close';grip.time=0;}
  grip.time+=dt;
  const duration={close:.9,carry:5,release:2,return:4}[grip.phase];
  if(duration&&grip.time>=duration){
   if(grip.phase==='carry')grip.delivered=true;
   grip.phase={close:'carry',carry:'release',release:'return',return:'dock'}[grip.phase];grip.time=0;
  }
 }
 const u=grip.phase==='carry'?grip.time/5:grip.phase==='release'?1:grip.phase==='return'?1-grip.time/4:0;
 const s=u*u*(3-2*u);
 block.x=block.baseX+600*s;block.y=block.baseY-145*Math.sin(Math.PI*s);
 block.dx=block.x-oldX;block.dy=block.y-oldY;
}
export function resetHandRide(g){
 const grip=g.level.handRigs?.[1];if(grip){grip.phase='dock';grip.time=0;}
}
export function pendingHandTask(g){
 const rigs=g.level.handRigs;
 if(rigs&&!rigs[0].locked)return '関節リンク回廊で腱の張力を固定しよう';
 if(rigs&&!rigs[1].delivered)return '把持試験台の試験片に乗って対岸へ運ぼう';
}
export function drawHandRigs(c,g){
 const [tendon,grip]=g.level.handRigs;
 c.save();c.font='bold 15px sans-serif';c.textAlign='center';
 for(const r of [tendon,grip]){
  const x=r.x,y=r.y;if(Math.abs(x-g.player.x)>1700)continue;
  c.fillStyle='#244556';c.fillRect(x-29,y-71,58,71);
  c.strokeStyle='#96c8c0';c.lineWidth=3;c.strokeRect(x-29,y-71,58,71);
  c.fillStyle='#e9e3b8';c.fillText(r.paid?'通電中':'¥'+r.cost,x,y-81);
  if(r===tendon){
   c.fillStyle='#112532';c.fillRect(x-24,y-57,48,16);c.fillStyle='#77d6ad';c.fillRect(x-24+48*.4,y-57,48*.3,16);
   c.fillStyle='#fff4cd';c.fillRect(x-25+48*tensionAt(r.time),y-62,3,26);
   c.fillStyle='#abd5d1';c.fillText(r.locked?'固定':'張力',x,y-15);
  }else{c.fillStyle='#a5d7c6';c.fillText('三指',x,y-39);c.fillText('把持',x,y-17);}
 }
 const a=g.level.platforms.find(p=>p.gripSpecimen);
 if(Math.abs(a.x-g.player.x)<1700){
  const x=a.x+a.w/2,y=a.y,close=grip.phase==='close'?Math.min(1,grip.time/.9):grip.phase==='carry'?1:grip.phase==='release'?Math.max(0,1-grip.time/.9):0;
  c.fillStyle='#54647e';c.fillRect(a.baseX-10,a.baseY-340,760,10);
  c.strokeStyle='#81c3bd';c.lineWidth=3;c.beginPath();c.moveTo(x,y-133);c.lineTo(x,a.baseY-335);c.stroke();
  c.fillStyle='#879ab1';c.fillRect(x-43,y-145,86,24);
  for(const dir of [-1,0,1]){
   const bx=x+dir*34,ex=x+dir*(111-25*close),ey=y+(dir===0?-20:6);
   c.strokeStyle=dir===0?'#648b94':'#d3c9c0';c.lineWidth=10;c.beginPath();c.moveTo(bx,y-123);c.lineTo(x+dir*103,y-60);c.lineTo(ex,ey);c.stroke();
   c.fillStyle='#73cbbb';c.beginPath();c.arc(x+dir*103,y-60,6,0,Math.PI*2);c.fill();
  }
  c.fillStyle='#eaaf70';c.fillRect(a.x,y,a.w,a.h);c.fillStyle='#523e42';c.fillText('把持試験片',x,y+16);
 }
 c.restore();
}
