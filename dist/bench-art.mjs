// Original procedural industrial textures. No pixels from the reference map.
export function benchSurface(c,p){
 const {x,y,w,h}=p;c.save();c.fillStyle=h>60?'#203844':'#344f5a';c.fillRect(x,y,w,h);
 c.strokeStyle='#0c202c';c.lineWidth=2;c.strokeRect(x+1,y+1,w-2,h-2);
 c.fillStyle='#a6f5d4';c.fillRect(x,y,w,4);c.fillStyle='#557c7d';c.fillRect(x,y+5,w,5);
 c.beginPath();c.rect(x,y+10,w,h-10);c.clip();
 for(let xx=x+12;xx<x+w;xx+=72){c.fillStyle='#65858c';c.fillRect(xx,y+13,3,3);if(h>60){c.strokeStyle='#395864';c.strokeRect(xx-7,y+25,58,h-38);c.strokeStyle='#998360';c.beginPath();c.moveTo(xx+4,y+46);c.lineTo(xx+26,y+46);c.lineTo(xx+26,y+72);c.lineTo(xx+43,y+72);c.stroke();c.fillStyle='#74bfb2';c.fillRect(xx+41,y+70,4,4);}}
 if(h<=20){c.fillStyle='#152c38';for(let xx=x+8;xx<x+w;xx+=14)c.fillRect(xx,y+11,7,5);}
 c.restore();
}
export function drawBenchRooms(c,g){
 if(!g.level.benchMap)return;c.save();
 for(const r of g.level.benchRooms){
  c.fillStyle='#0c1a29';c.fillRect(r.x-30,r.y-100,r.w+200,r.h+100);
  c.strokeStyle='#29404d';c.lineWidth=5;// Background recess is not a structural wall; solid boundaries use benchSurface.

  // Muted conduits are background: no luminous horizontal top edges.
  for(let i=0;i<3;i++){c.strokeStyle=['#38465b','#345b5b','#665744'][i];c.lineWidth=6;c.beginPath();c.moveTo(r.x+30+i*20,510);c.lineTo(r.x+30+i*20,r.y+r.h-55);c.lineTo(r.x+r.w-60,r.y+r.h-55);c.stroke();}
  c.fillStyle='#6a919d';c.font='16px monospace';c.fillText(r.name,r.x+170,r.y+20);
  for(let xx=r.x+180;xx<r.x+r.w;xx+=230){c.fillStyle='#152e3b';c.fillRect(xx,r.y+65,120,150);c.fillStyle='#3e6771';for(let j=0;j<7;j++)c.fillRect(xx+12,r.y+80+j*17,72,4);c.fillStyle='#6cc9b3';c.fillRect(xx+97,r.y+82,5,5);}
 }
 for(const b of g.level.benchBeacons){c.fillStyle='#172c38';c.fillRect(b.x-44,b.y-28,88,46);c.fillStyle='#a9e7d1';c.font='13px monospace';c.fillText('SERVICE',b.x-29,b.y-9);c.fillText('↓',b.x-5,b.y+10);}
 c.restore();
}
