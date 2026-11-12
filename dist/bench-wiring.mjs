// Physical floor-button repair. Contact edges, not held input, advance the circuit.
export const WIRE_ORDER=[1,0,2];
export function tickBenchWiring(g,dt){
 if(!g.level.benchMap)return;
 const r=g.level.relays[0],p=g.player;
 r.flash=Math.max(0,(r.flash||0)-dt);
 const button=g.level.wireButtons.findIndex(b=>p.onGround&&Math.abs(p.y+p.h-b.y)<5&&p.x+p.w>b.x&&p.x<b.x+b.w);
 if(button!==r.contact&&button>=0&&!r.on){
  if(button===WIRE_ORDER[r.step]){r.step++;r.flash=.5;g.events.push({type:'repairStep',x:p.x,y:p.y,text:`接続 ${r.step}/3`});}
  else{r.step=0;r.flash=1;g.events.push({type:'repairStep',x:p.x,y:p.y,text:'接続リセット'});}
  if(r.step===3){r.on=true;g.events.push({type:'relay',x:r.x,y:r.y});}
 }
 r.contact=button;
}
export function drawBenchWiring(c,g){
 if(!g.level.benchMap)return;const r=g.level.relays[0],labels=['△','○','□'];c.save();c.textAlign='center';c.font='bold 22px sans-serif';
 for(const [i,b] of g.level.wireButtons.entries()){
  const lit=WIRE_ORDER.slice(0,r.step).includes(i);c.strokeStyle=lit?'#91ffce':'#526679';c.lineWidth=4;c.beginPath();c.moveTo(b.x+b.w/2,b.y-8);c.lineTo(b.x+b.w/2,b.y-65);c.lineTo(r.x,b.y-65);c.stroke();
  c.fillStyle=lit?'#91ffce':r.flash>.5?'#ff936f':'#a1bdd2';c.fillRect(b.x,b.y-9,b.w,9);c.fillText(labels[i],b.x+b.w/2,b.y-20);
 }
 c.fillStyle='#152c38';c.fillRect(r.x-100,r.y-145,200,42);c.fillStyle='#b5f8df';c.font='16px sans-serif';c.fillText(r.on?'通電 / 光の橋 開通':`配線 ${r.step}/3 · 床ボタン`,r.x,r.y-118);
 for(const h of g.level.wireHints){c.fillStyle='#152e3b';c.fillRect(h.x-150,h.y-120,300,120);c.strokeStyle='#7899aa';c.strokeRect(h.x-150,h.y-120,300,120);c.fillStyle='#b5f8df';c.font='15px sans-serif';c.fillText('起動順序 / SERVER LOG',h.x,h.y-91);c.font='30px sans-serif';c.fillText(WIRE_ORDER.map(i=>labels[i]).join(' → '),h.x,h.y-48);c.font='12px monospace';c.fillText('STARTUP SEQUENCE · 3 NODES',h.x,h.y-18);}
 c.restore();
}
