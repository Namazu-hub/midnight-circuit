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
 // The terminal sits *below* the final walkable deck. Its three physical
 // conductors can be followed from the floor contacts to the powered exit.
 const colors=['#d3a56e','#8bded2','#b6b4e8'],panelY=145;
 c.fillStyle='#122b36';c.fillRect(r.x-105,panelY-24,210,123);
 c.strokeStyle='#7b9aa1';c.lineWidth=3;c.strokeRect(r.x-105,panelY-24,210,123);
 for(let i=0;i<4;i++){c.fillStyle='#6b8790';c.fillRect(r.x-99+i*62,panelY-18,4,4);}
 for(const [i,b] of g.level.wireButtons.entries()){
  const lit=WIRE_ORDER.slice(0,r.step).includes(i);
  const bx=b.x+b.w/2,tx=r.x-60+i*60,ty=panelY+18;
  c.beginPath();c.moveTo(bx,b.y-3);c.lineTo(bx,105+i*10);c.lineTo(tx,105+i*10);c.lineTo(tx,ty);
  c.strokeStyle='#0c1c27';c.lineWidth=13;c.stroke();c.strokeStyle=lit?'#a0ffe2':colors[i];c.lineWidth=7;c.stroke();
  c.fillStyle=lit?'#c5ffe3':'#70858d';c.fillRect(tx-13,ty-10,26,23);
  c.fillStyle='#152630';c.fillRect(tx-5,ty-4,10,10);
  c.fillStyle=lit?'#91ffce':r.flash>.5?'#ff936f':'#a1bdd2';c.fillRect(b.x,b.y-9,b.w,9);c.fillText(labels[i],b.x+b.w/2,b.y-20);
 }
 c.strokeStyle=r.on?'#a0ffe2':'#475966';c.lineWidth=11;c.beginPath();c.moveTo(r.x+93,panelY+42);c.lineTo(r.x+165,panelY+42);c.lineTo(r.x+165,panelY+73);c.lineTo(r.x+285,panelY+73);c.lineTo(r.x+285,80);c.lineTo(g.level.goal.x-50,80);c.stroke();
 c.strokeStyle=r.on?'#e4fff3':'#6b7983';c.lineWidth=4;c.stroke();
 c.fillStyle=r.on?'#a0ffe2':'#718992';c.fillRect(r.x+274,panelY+52,30,42);
 c.fillStyle='#b5f8df';c.font='16px sans-serif';c.fillText(r.on?'通電 / 光の橋 開通':`配線 ${r.step}/3 · 床ボタン`,r.x,panelY+70);
 for(const h of g.level.wireHints){c.fillStyle='#152e3b';c.fillRect(h.x-150,h.y-120,300,120);c.strokeStyle='#7899aa';c.strokeRect(h.x-150,h.y-120,300,120);c.fillStyle='#b5f8df';c.font='15px sans-serif';c.fillText('起動順序 / SERVER LOG',h.x,h.y-91);c.font='30px sans-serif';c.fillText(WIRE_ORDER.map(i=>labels[i]).join(' → '),h.x,h.y-48);c.font='12px monospace';c.fillText('STARTUP SEQUENCE · 3 NODES',h.x,h.y-18);}
 c.restore();
}
