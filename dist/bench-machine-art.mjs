// Physical control silhouettes and their destinations share symbols and cable colors.
const box=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);};
const path=(c,points,col,w=3)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
export function drawBenchMachines(c,g,reduced=false){
 if(!g.level.benchMachines)return;c.save();c.textAlign='center';
 for(const m of g.level.benchMachines){
  const parts=g.level.platforms.filter(a=>a.benchMachine===m.id),a=parts[0],bridge=m.kind==='bridge',shuttle=m.kind==='shuttle',col=bridge?'#f2cb81':shuttle?'#a8dbea':'#98e8cc';
  const x=bridge?m.x:a.x,y=bridge?m.y:a.y,w=bridge?m.w:a.w;
  if(m.kind==='lift'){
   for(const xx of [m.x+10,m.x+m.w-10]){path(c,[[xx,m.top-12],[xx,m.y]],'#3d5e69',6);for(let yy=m.top;yy<m.y;yy+=20)box(c,xx-4,yy,8,3,'#66808a');}
   // Behind the bright actual platform: rails are thin and clearly non-walkable.
   box(c,a.x,a.y,a.w,4,col);box(c,a.x+10,a.y+7,a.w-20,7,'#3f6972');
  }else if(shuttle){
   path(c,[[m.x+60,m.y],[m.x+60,m.top-30],[m.endX+60,m.top-30],[m.endX+60,m.top]],'#375966',5);
   for(let xx=m.x+70;xx<m.endX+60;xx+=48)path(c,[[xx,m.top-36],[xx+7,m.top-30],[xx,m.top-24]],'#5b7d88',2);
   box(c,a.x,a.y,a.w,4,col);box(c,a.x+8,a.y+5,a.w-16,10,'#405f73');
  }else{
   path(c,[[x+w/2,y-12],[x+w/2,430],[2020,430],[2020,410]],m.extended?col:'#53616a',3);
   for(let i=0;i<parts.length;i++){const p=parts[i];box(c,p.x-10,p.y+6,10,20,'#62727a');if(m.extended){box(c,p.x,p.y,p.w,4,col);for(let xx=p.x+10;xx<p.x+p.w;xx+=24)box(c,xx,p.y+10,12,3,'#927d51');}else{c.setLineDash([5,8]);c.strokeStyle='#9a865e88';c.strokeRect(p.x,p.y,p.w,20);c.setLineDash([]);}}
  }
  // The contact pad stays flush with its actual support surface.
  box(c,x+w/2-23,y-5,46,5,m.contact?'#ecfff3':col);box(c,x+w/2-27,y-2,54,2,'#304954');
  c.fillStyle=col;c.font='bold 18px sans-serif';c.fillText(bridge?'◷':shuttle?'ϟ':'↕',x+w/2,y-16);
  const mx=m.kind==='bridge'?m.x+32:m.x+60,my=m.kind==='lift'?m.top-100:m.kind==='bridge'?m.y-106:m.top-77;
  box(c,mx-67,my-28,134,49,'#102633');c.strokeStyle='#47616a';c.strokeRect(mx-67,my-28,134,49);
  c.font='13px sans-serif';c.fillStyle=col;c.fillText(m.label,mx,my-10);c.font='12px monospace';
  c.fillText(bridge?(m.timer>0?`${Math.ceil(m.timer)} s`:m.extended?'乗客待ち':'10 s'):shuttle?(m.phase==='idle'?`${Math.round(m.charge*100)}%`:m.phase==='back'?'← RETURN':m.phase==='wait'?'停車 3s':'→ MOVE'):(m.on?'↑ UP':m.paid?'↓ RETURN / 無料':`¥${m.price} / ↑ UP`),mx,my+10);
  if(shuttle){box(c,mx-48,my+16,96,3,'#314550');box(c,mx-48,my+16,96*m.charge,3,col);}
  if(m.flash>0&&!reduced){c.globalAlpha=m.flash*.45;box(c,x-5,y-10,w+10,15,col);c.globalAlpha=1;}
 }
 c.restore();
}
