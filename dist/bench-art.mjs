// Original Canvas lab materials. All repeat phases use world coordinates.
const fill=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
const line=(c,x,y,xx,yy,col,w=1)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();};
export function drawBenchBackdrop(c,g,width,height){
 const x=Math.round(g.camera)-24,y=Math.round(g.cameraY||0)-24;width+=48;height+=48;
 c.save();const fade=c.createLinearGradient(0,-150,0,820);fade.addColorStop(0,'#101d2c');fade.addColorStop(.65,'#182b39');fade.addColorStop(1,'#101e2a');c.fillStyle=fade;c.fillRect(x,y,width,height);
 // A single wall grid follows both camera axes; no screen-anchored underground windows.
 for(let yy=Math.floor(y/96)*96;yy<y+height;yy+=96){line(c,x,yy,x+width,yy,'#20323e');}
 for(let xx=Math.floor(x/144)*144;xx<x+width;xx+=144){line(c,xx,y,xx,y+height,'#213542');for(let yy=Math.floor(y/96)*96;yy<y+height;yy+=96)fill(c,xx+8,yy+8,2,2,'#35505c');}
 for(let xx=Math.floor((x-120)/576)*576;xx<x+width;xx+=576){
  fill(c,xx+48,40,420,262,'#0b1725');fill(c,xx+56,48,404,246,'#142b3c');
  // Distant lab silhouettes; frames are continuous and remain behind terrain.
  for(let i=0;i<10;i++){const h=28+(i*29+xx/576*17)%57;fill(c,xx+60+i*40,290-h,37,h,'#0c1b2a');fill(c,xx+68+i*40,298-h,3,4,'#4e666d');}
  fill(c,xx+252,48,5,246,'#294554');fill(c,xx+56,174,404,4,'#294554');
  fill(c,xx+48,307,420,5,'#253e4c');
 }
 for(const yy of [338,350,704,716]){line(c,x,yy,x+width,yy,'#304653',3);}
 // Low-contrast recessed access panels, not freestanding climbable furniture.
 for(let xx=Math.floor(x/288)*288;xx<x+width;xx+=288){fill(c,xx+32,388,224,100,'#142633');fill(c,xx+38,395,212,2,'#2e4653');for(let i=0;i<5;i++)fill(c,xx+52,412+i*9,64,2,'#263b47');}
 c.restore();
}
export function benchSurface(c,p,g){
 const {x,y,w,h}=p,room=g?.level.benchRooms.find(r=>y>=730&&x>=r.x-30&&x<r.x+r.w+30),warm=room?.role==='supply',accent=warm?'#e6d2a4':'#a6f5d4';c.save();
 if(p.benchWall){
  fill(c,x,y,w,h,warm?'#514a3c':'#2b4652');fill(c,x+4,y+4,w-8,h-8,'#142733');
  for(let yy=Math.ceil(y/48)*48;yy<y+h;yy+=48){fill(c,x+5,yy,w-10,3,warm?'#796a4e':'#52717b');fill(c,x+8,yy+7,3,3,'#97a8a4');}
  fill(c,x+(x<room?.x?24:2),y+10,3,h-20,warm?'#a18b5f':'#6d9eaa');c.restore();return;
 }
 fill(c,x,y,w,h,h>60?(warm?'#383c37':'#203844'):(warm?'#535649':'#344f5a'));
 c.beginPath();c.rect(x,y,w,h);c.clip();
 if(h>60){
  // Panels share a global pitch and a common underside across every step.
  for(let xx=Math.floor(x/96)*96;xx<x+w;xx+=96){line(c,xx, y+10,xx,y+h,'#142b37',2);for(let yy=Math.floor(y/96)*96;yy<y+h;yy+=96){line(c,xx+8,yy+60,xx+88,yy+60,'#36515c');fill(c,xx+12,yy+69,3,3,'#607b80');line(c,xx+23,yy+78,xx+58,yy+78,'#756a50',2);}}
  fill(c,x,y+h-9,w,9,'#142733');
 }else{
  for(let xx=Math.floor(x/16)*16;xx<x+w;xx+=16)fill(c,xx+4,y+11,7,5,'#162d39');
  fill(c,x,y+h-3,w,3,'#122733');
 }
 fill(c,x,y,w,4,accent);fill(c,x,y+5,w,4,warm?'#8c8769':'#557c7d');
 if(p.benchDeck){
  // Only exposed risers receive an edge: adjacent slabs do not create false walls.
  for(const edge of [x,x+w]){const other=g.level.platforms.find(a=>a!==p&&a.benchDeck&&(Math.abs(a.x+a.w-edge)<.1||Math.abs(a.x-edge)<.1));line(c,edge,y+5,edge,other?other.y:y+h,'#102735',2);}
 }
 c.restore();
}
function serverRack(c,x,y,w=122){
 fill(c,x+5,y+6,w,224,'#081723');fill(c,x,y,w,222,'#29434e');fill(c,x+6,y+6,w-12,210,'#102632');
 for(let i=0;i<10;i++){const yy=y+11+i*20;fill(c,x+10,yy,w-20,17,'#203b47');fill(c,x+13,yy+3,w-26,2,'#3b5962');for(let j=0;j<4;j++)fill(c,x+18+j*16,yy+7,9,2,'#112b36');fill(c,x+w-23,yy+7,3,3,i%3?'#79bba8':'#b9a86b');}
 line(c,x+5,y+4,x+5,y+216,'#63828a',2);fill(c,x+16,y+217,10,5,'#0b1c27');fill(c,x+w-26,y+217,10,5,'#0b1c27');
}
export function drawBenchRooms(c,g,width=1200){
 if(!g.level.benchMap)return;c.save();
 for(const r of g.level.benchRooms){
  if(r.x+r.w<g.camera||r.x>g.camera+width+180)continue;
  const warm=r.role==='supply';
  fill(c,r.x,r.y,r.w,r.h,warm?'#252d2d':'#101f2b');
  // Matching panel seams continue through the room and the return shaft.
  for(let yy=Math.ceil(r.y/96)*96;yy<r.floorY;yy+=96)line(c,r.x,yy,r.x+r.w,yy,warm?'#35403d':'#263a47');
  for(let xx=Math.ceil(r.x/144)*144;xx<r.x+r.w;xx+=144)line(c,xx,r.y,xx,r.floorY,warm?'#343f3d':'#233744');
  fill(c,r.x,r.y+8,r.w,10,warm?'#655d49':'#3c5f6a');fill(c,r.x,r.y+21,r.w,2,warm?'#beaa7a':'#6ea4ac');
  // Conduits connect the surface opening to the room's perimeter, with no seams.
  for(let i=0;i<3;i++){const xx=r.x+22+i*14;line(c,xx,510,xx,r.floorY-18,warm?'#5c614c':'#355666',5);line(c,xx,r.floorY-18-i*8,r.x+r.w-30,r.floorY-18-i*8,warm?'#5c614c':'#355666',4);}
  c.textAlign='left';c.font='16px monospace';c.fillStyle=r.accent;c.fillText(r.name,r.x+300,r.y+65);c.font='14px sans-serif';c.fillText(r.subtitle,r.x+300,r.y+90);
  if(!warm){
   for(const xx of [3490,3660,4270,4440])serverRack(c,xx,r.floorY-244);
   // Patch field is clearly a rear-wall appliance, without a luminous standing edge.
   fill(c,3865,955,270,120,'#182e3b');for(let i=0;i<12;i++){fill(c,3881+(i%6)*40,974+Math.floor(i/6)*38,20,13,'#0c202c');fill(c,3884+(i%6)*40,978+Math.floor(i/6)*38,14,3,'#526e78');}
  }else{
   fill(c,6380,865,270,122,'#3d443b');for(let i=0;i<30;i++)fill(c,6394+(i%15)*17,879+Math.floor(i/15)*83,2,2,'#7b7e62');
   for(let i=0;i<6;i++){const xx=6410+i*33;line(c,xx,887,xx,935,'#a6b0a1',4);fill(c,xx-4,925,8,19,i%2?'#b58e60':'#6c9b9a');}
   fill(c,6660,1012,116,68,'#4a4c3c');for(let i=0;i<4;i++){fill(c,6668,1020+i*15,100,11,'#313b36');fill(c,6713,1024+i*15,18,3,'#aa9b70');}
   // Wall extractor and warm strip lighting distinguish this occupied service room.
   fill(c,6915,910,105,98,'#33413e');for(let i=0;i<8;i++)line(c,6925,921+i*10,7010,921+i*10,'#718276',3);
   for(const xx of [6290,6610,6930]){fill(c,xx,792,146,8,'#9c9475');fill(c,xx+5,800,136,3,'#cbbf93');}
  }
 }
 for(const b of g.level.benchBeacons){fill(c,b.x-83,b.y-29,166,48,'#142733');c.textAlign='center';c.fillStyle=b.accent;c.font='12px monospace';c.fillText(b.label,b.x,b.y-9);c.font='18px sans-serif';c.fillText('↓',b.x,b.y+12);}
 c.restore();
}
export function drawBenchSupplies(c,g){
 if(!g.level.benchMap)return;c.save();c.textAlign='center';
 for(const b of g.level.benchSupplies){
  fill(c,b.x-32,b.y-30,64,28,'#6c5d40');fill(c,b.x-29,b.y-27,58,22,'#b39358');fill(c,b.x-32,b.y-6,64,6,'#443d31');
  fill(c,b.x-34,b.y-(b.opened?59:42),68,10,b.opened?'#ab945f':'#d2b575');
  if(!b.opened){fill(c,b.x-5,b.y-33,10,13,'#e4d9aa');c.font='13px sans-serif';c.fillStyle='#e6d5a8';c.fillText('補給箱',b.x,b.y-57);}
  else if(!b.drinkTaken){fill(c,b.x-8,b.y-56,16,29,'#192f31');c.font='20px monospace';c.fillStyle='#b6e57d';c.fillText('M',b.x,b.y-33);}
  else{c.font='12px sans-serif';c.fillStyle='#a0ae96';c.fillText('回収済',b.x,b.y-37);}
 }
 c.restore();
}
export function drawBenchChat(c,g,width,height,t){
 if(!g.level.benchMap)return;
 const p=g.player,s=g.level.students.filter(s=>Math.hypot(p.x-s.x,p.y+40-s.y)<185).sort((a,b)=>Math.hypot(p.x-a.x,p.y+40-a.y)-Math.hypot(p.x-b.x,p.y+40-b.y))[0];if(!s)return;
 const small=width<1000,font=small?19:15,max=Math.min(340,width-40),lines=[];let text=s.lines[Math.floor(t/7)%s.lines.length];if(g.touchInput)text=text.replace(/Xで/g,'PULSEで');
 c.save();c.font=`${font}px sans-serif`;let row='';for(const ch of text){if(c.measureText(row+ch).width>max-30&&!/[。、！？…]/.test(ch)){lines.push(row);row=ch;}else row+=ch;}if(row)lines.push(row);
 const h=42+lines.length*(font+7),x=Math.max(g.camera+15,Math.min(s.x-125,g.camera+width-max-15)),y=Math.max((g.cameraY||0)+110,Math.min(s.y-h-100,(g.cameraY||0)+height-h-85));
 fill(c,x,y,max,h,'#10232ff5');c.strokeStyle=s.color;c.lineWidth=1;c.strokeRect(x+.5,y+.5,max,h);c.textAlign='left';c.font='12px sans-serif';c.fillStyle=s.color;c.fillText(s.name,x+14,y+22);c.font=`${font}px sans-serif`;c.fillStyle='#e0ece9';lines.forEach((l,i)=>c.fillText(l,x+14,y+45+i*(font+7)));c.restore();
}
