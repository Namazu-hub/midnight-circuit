// Spatial controls use the same hand rig input on keyboard and touch.
export function installWorkshop(L){
 L.wireControls=[];
 const drum=(relay,x,y,target,label)=>L.wireControls.push({kind:'drum',relay,x,y,target,angle:0,label});
 drum('bio-joints',12520,-1320,2,'伸筋を巻く');
 drum('bio-joints',4170,-600,1,'屈筋を巻く');
 drum('bio-grasp',17520,-930,1,'母指を巻く');
 drum('bio-grasp',7940,510,3,'対向指を巻く');
}
export function nearbyWorkshop(g){
 const p=g?.player;
 return g?.level.wireControls?.find(o=>!g.level.relays.find(r=>r.id===o.relay).on&&
  Math.abs(p.x+14-o.x)<58&&Math.abs(p.y+40-o.y)<56);
}
export function operateWorkshop(g,o){
 o.angle=(o.angle+1)%4;
 const r=g.level.relays.find(r=>r.id===o.relay);
 if(g.level.wireControls.filter(k=>k.relay===r.id).every(k=>k.angle===k.target)){
  r.on=true;r.repairRank=2;r.repairResult='完全修理';
  g.player.hp=Math.min(6,g.player.hp+1);
  g.events.push({type:'repairComplete',text:r.effectText,x:o.x,y:o.y-50});
 }else g.events.push({type:'repairStep',x:o.x,y:o.y-35,text:o.angle===o.target?'合印一致':'巻取り'});
}
const angles=[-1.45,-1.05,-.63,-.18];
function link(x,y,a,length){
 return [x+Math.cos(a)*length,y+Math.sin(a)*length];
}
function stroke(c,points,col,width){
 c.strokeStyle=col;c.lineWidth=width;c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);c.stroke();
}
export function drawWorkshop(c,g){
 c.save();c.font='bold 15px sans-serif';c.textAlign='center';
 for(const o of g.level.wireControls){
  if(Math.abs(o.x-g.camera-600)>1500||Math.abs(o.y-g.cameraY-300)>630)continue;
  const {x,y}=o;
  const ready=o.angle===o.target;
  // The dashed arm is the fixture. The solid linkage follows the drum detent.
  const px=x+28,py=y-83;
  for(const ghost of [true,false]){
   const a=angles[ghost?o.target:o.angle],elbow=link(px,py,a,60),tip=link(...elbow,a*.65,48);
   c.setLineDash(ghost?[6,4]:[]);
   stroke(c,[[px,py],elbow,tip],ghost?'#ffd587':ready?'#8de2bd':'#ded5bf',ghost?4:8);
   c.setLineDash([]);if(!ghost){stroke(c,[[x,y-38],[px,py-12],elbow],'#74c9c1',2);c.fillStyle='#36485b';c.beginPath();c.arc(...elbow,4,0,7);c.fill();}
  }
  c.fillStyle='#43566a';c.fillRect(x-23,y-56,46,56);c.fillStyle=ready?'#8de2bd':'#e4b788';c.beginPath();c.arc(x,y-38,16,0,7);c.fill();
  stroke(c,[[x,y-38],link(x,y-38,angles[o.angle]*2,13)],'#284153',4);
  c.fillStyle='#ecdfbd';c.fillText(ready?'✓ 合印':o.label,x,y-65);
 }
 c.restore();
}
