import {drawResearch} from './research.mjs?v=4.4b';
import {drawPrinter} from './printer-art.mjs?v=4.4b';
import {drawLab} from './laboratory.mjs?v=4.4b';
import {VIEW,RULES,clamp,laserActive,laserPhase,lifeNotice,platformSolid,printedPhase,pressState} from './engine.mjs?v=4.4b';
const PALETTES={
  fever:{sky:'#190d2b',low:'#402843',line:'#85633e',deep:'#291b36',top:'#fff0b3',edge:'#c7a754',soil:'#453345',glow:'#ffdf89'},
  bench:{sky:'#111d30',low:'#1d3342',line:'#2a4657',deep:'#142331',top:'#71b7b1',edge:'#3b6e75',soil:'#223e4b',glow:'#75efce'},
  garden:{sky:'#10262d',low:'#254a41',line:'#306251',deep:'#17392f',top:'#acd97a',edge:'#6a9360',soil:'#294d3c',glow:'#c1ef82'},
  ice:{sky:'#15243c',low:'#2e4a65',line:'#375d7b',deep:'#1b304a',top:'#b3e5fa',edge:'#71aacb',soil:'#314c66',glow:'#94ccff'},
  foundry:{sky:'#281d30',low:'#4b333e',line:'#5d3c4b',deep:'#302333',top:'#d5ac8c',edge:'#ad7359',soil:'#4b383b',glow:'#ffae87'},
  printer:{sky:'#171e30',low:'#233e50',line:'#3a5668',deep:'#142a3a',top:'#91e8f5',edge:'#368baf',soil:'#26516a',glow:'#ffae87'},
  solder:{sky:'#281d27',low:'#50382f',line:'#69483e',deep:'#2d282c',top:'#e8b77e',edge:'#ab7650',soil:'#463c36',glow:'#ffbe7c'},
  scope:{sky:'#0b252c',low:'#1d4547',line:'#2e6462',deep:'#153536',top:'#8bffd2',edge:'#3b9a82',soil:'#23574e',glow:'#8bffd2'},
  optics:{sky:'#201d36',low:'#3a345c',line:'#5a4e7e',deep:'#282440',top:'#dcb9ff',edge:'#9372b5',soil:'#44375d',glow:'#e2a9ff'},
  tower:{sky:'#211e3d',low:'#4b3859',line:'#59456a',deep:'#2d2546',top:'#c7b3e3',edge:'#8b78b4',soil:'#443952',glow:'#c4a6ff'}
};
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));};
function line(c,x1,y1,x2,y2,color,width=1){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();}
function round(c,x,y,w,h,r,color){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
function star(c,x,y,s,color){rect(c,x-s,y-1,s*2+1,3,color);rect(c,x-1,y-s,3,s*2+1,color);}
function glow(c,x,y,r,color){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
export function robot(c,x,y,scale=2,time=0,walking=false,face=1,air=false){
  c.save();c.translate(Math.round(x),Math.round(y));c.scale(scale,scale);
  const step=walking?Math.sin(time*17)*2:0;
  rect(c,2,20+Math.max(0,step),5,3,'#0c1927');rect(c,10,20+Math.max(0,-step),5,3,'#0c1927');
  rect(c,3,18+Math.max(0,step),3,3,'#a7c9c9');rect(c,10,18+Math.max(0,-step),3,3,'#a7c9c9');
  rect(c,2,9,13,11,'#172c38');rect(c,3,10,11,9,'#afd6d2');rect(c,4,10,9,3,'#dcf3e3');
  rect(c,6,14,6,3,'#44898d');rect(c,7,14,4,1,'#6cf0ce');rect(c,3,16,2,2,'#ffb282');
  rect(c,0,11+step*.3,3,7,'#284956');rect(c,0,12+step*.3,2,4,'#87b8b8');rect(c,14,11-step*.3,3,7,'#284956');rect(c,15,12-step*.3,2,4,'#87b8b8');
  rect(c,1,-1,15,11,'#142f3b');rect(c,2,0,13,9,'#afd6d2');rect(c,3,0,11,2,'#e1f4e7');rect(c,4,3,10,5,'#15343d');rect(c,3,3,1,4,'#3a6973');
  const blink=Math.sin(time*.9)> .992;
  rect(c,face===1?7:5,blink?6:4,2,blink?1:3,'#8affdc');rect(c,face===1?11:9,blink?6:4,2,blink?1:3,'#8affdc');
  rect(c,7,-5,2,4,'#90b4bc');rect(c,6,-6,4,2,'#ffb17e');rect(c,15,4,2,3,'#ffae80');
  if(air){rect(c,6,22,5,3,'#75efce');rect(c,7,25,3,2+Math.sin(time*30)*2,'#d6fff0');}
  c.restore();
}
function student(c,x,y,color,t,s=1){
  c.save();c.translate(Math.round(x),Math.round(y));c.scale(s,s);
  // Laptop, seated student, coffee, and an implausibly late-night notebook.
  rect(c,-29,-35,40,4,'#81726e');rect(c,-26,-31,3,31,'#43515a');rect(c,5,-31,3,31,'#43515a');
  rect(c,-24,-53,24,18,'#0d1928');rect(c,-22,-51,20,13,'#3a6f82');rect(c,-20,-48,12,2,'#81e4c7');rect(c,-20,-44,9,1,'#b4d8e1');rect(c,-20,-41,15,1,'#91aebf');rect(c,-25,-36,27,2,'#607e8d');
  rect(c,-34,-42,6,7,'#d2c0a5');line(c,-33,-46,-31,-50,'#a4c5c34f');
  rect(c,15,-27,5,25,'#0e1a2c');rect(c,26,-25,5,23,'#0e1a2c');rect(c,12,-3,10,3,'#bfc3c6');rect(c,24,-3,10,3,'#bfc3c6');
  rect(c,13,-46,20,24,color);rect(c,12,-27,22,5,'#526479');rect(c,12,-42,7,14,color);rect(c,1,-37,17,5,'#dbac91');
  const bob=Math.sin(t*1.7)*.7;rect(c,15,-65+bob,16,18,'#e0b497');rect(c,13,-69+bob,20,10,'#28313d');rect(c,13,-62+bob,4,8,'#28313d');rect(c,30,-61+bob,3,11,'#28313d');
  rect(c,15,-57+bob,6,5,'#24384a');rect(c,23,-57+bob,6,5,'#24384a');line(c,20,-55+bob,24,-55+bob,'#24384a',2);rect(c,16,-56+bob,3,1,'#a4e5df');rect(c,24,-56+bob,3,1,'#a4e5df');
  rect(c,33,-24,4,18,'#34475b');rect(c,9,-23,28,3,'#34475b');
  c.restore();
}
function plant(c,x,y,s=1,color='#70af91'){
  c.save();c.translate(x,y);c.scale(s,s);rect(c,-13,-24,26,21,'#ab7d6b');rect(c,-16,-27,32,6,'#d3a489');rect(c,-10,-20,5,14,'#c1957b');rect(c,-2,-70,4,44,'#4d866a');
  const leaves=[[-18,-66,18,11],[2,-79,18,13],[-26,-47,24,12],[2,-57,29,12],[-12,-83,13,14]];
  for(const [a,b,w,h] of leaves){rect(c,a,b,w,h,color);rect(c,a+3,b+3,w-5,3,'#a8dbae');}c.restore();
}
function monitor(c,x,y,w=120,h=85,color='#70cbb9'){
  rect(c,x,y,w,h,'#0c1928');rect(c,x+5,y+5,w-10,h-15,'#244352');rect(c,x+w*.4,y+h, w*.2,10,'#526a76');rect(c,x+w*.25,y+h+10,w*.5,5,'#6c8490');
  rect(c,x+14,y+15,w*.44,3,color);rect(c,x+14,y+24,w*.6,2,'#5c8390');rect(c,x+14,y+31,w*.35,2,'#5c8390');
  c.strokeStyle=color;c.lineWidth=2;c.beginPath();for(let i=0;i<55;i++){const xx=x+13+i*(w-26)/55,yy=y+h*.65+Math.sin(i*.27)*h*.13;i?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.stroke();rect(c,x+w-12,y+h-7,3,2,color);
}
function background(c,theme,camera,t,width=VIEW.w,height=VIEW.h){
  const P=PALETTES[theme];const gradient=c.createLinearGradient(0,0,0,height);gradient.addColorStop(0,P.sky);gradient.addColorStop(1,P.low);c.fillStyle=gradient;c.fillRect(0,0,width,height);
  if(theme==='fever'){
    const par=camera*.24;for(let i=-1;i<Math.ceil(width/310)+1;i++){const x=i*310-par%310;round(c,x+35,80,240,315,30,'#2c1a3a');c.strokeStyle='#d1a75b55';c.lineWidth=3;c.strokeRect(x+47,95,216,285);c.strokeStyle='#ffdfa577';c.lineWidth=1;c.strokeRect(x+54,102,202,271);c.font='900 180px Arial Black, sans-serif';c.textAlign='center';c.fillStyle='#f1ce8b18';c.fillText('7',x+155,290);c.font='11px monospace';c.fillStyle='#e9c58066';c.fillText('GOLDEN CIRCUIT',x+155,342);for(let j=0;j<8;j++){const sy=115+j*32;star(c,x+45,sy,2,'#ffe7ad');star(c,x+265,sy,2,'#ddc0f7');}}
    c.textAlign='left';for(let i=0;i<32;i++){const x=((i*137-camera*.4)%width+width)%width,y=60+(i*71)%390;star(c,x,y,2+i%2,'#ffdf9766');}line(c,0,450,width,450,'#b9956655',3);return;
  }
  // Fixed wall seams and far-away architecture move at different speeds.
  const par=camera*.18;
  for(let i=-1;i<6;i++){
    const x=i*330-(par%330);rect(c,x+30,70,260,235,'#08152366');rect(c,x+38,78,244,219,P.deep);
    if(theme==='bench'||theme==='tower'){
      rect(c,x+41,81,238,211,theme==='tower'?'#302b4c':'#152b40');
      for(let j=0;j<11;j++){const sx=x+50+((j*71+i*23)%220+220)%220,sy=91+((j*37)%130);rect(c,sx,sy,2,2,'#7593aa99');}
      for(let j=0;j<7;j++){const hh=25+(j*47+i*17+150)%60;rect(c,x+41+j*35,291-hh,33,hh,'#0b192d');for(let k=0;k<2;k++)rect(c,x+50+j*35,297-hh+k*16,3,4,j%3?'#6a7e8e70':'#b1b88c70');}
      rect(c,x+156,78,6,219,P.line);rect(c,x+38,185,244,5,P.line);
    }else if(theme==='garden'){
      rect(c,x+41,81,238,211,'#183d3b');for(let j=0;j<4;j++){rect(c,x+70+j*54,90,3,194,'#37705b');for(let k=0;k<5;k++){rect(c,x+60+j*54,112+k*33,13,6,'#32624b');rect(c,x+73+j*54,125+k*29,12,5,'#4b7754');}}
      rect(c,x+39,182,240,6,'#3a5e58');
    }else if(theme==='scope'){
      rect(c,x+46,86,228,205,'#0c292d');for(let gy=105;gy<290;gy+=30)line(c,x+49,gy,x+271,gy,'#254d4c');for(let gx=x+60;gx<x+270;gx+=30)line(c,gx,91,gx,287,'#254d4c');
      c.strokeStyle='#81f2bf';c.lineWidth=3;c.beginPath();for(let n=0;n<220;n++){const yy=188+Math.sin(n*.045-t*1.4+i)*48;n?c.lineTo(x+50+n,yy):c.moveTo(x+50+n,yy);}c.stroke();c.fillStyle='#8dc9b6';c.font='9px monospace';c.fillText('CH1 / 2V / 500ms',x+65,107);
    }else if(theme==='optics'){
      for(let n=0;n<7;n++){const sx=x+60+n*30,sy=100+(n*47+i*19)%170;star(c,sx,sy,2,'#e4c8ff');if(n)line(c,sx-30,100+((n-1)*47+i*19)%170,sx,sy,'#9778bc50');}
      rect(c,x+72,260,175,12,'#73628a');for(const xx of [x+90,x+155,x+222]){rect(c,xx,209,4,50,'#8592a7');c.strokeStyle='#b6dcf5';c.lineWidth=3;c.beginPath();c.ellipse(xx+2,202,10,25,0,0,Math.PI*2);c.stroke();}line(c,x+55,202,x+260,202,'#f4a8ff88',2);
    }else if(theme==='solder'){
      rect(c,x+49,91,220,194,'#24483d');for(let n=0;n<6;n++){line(c,x+65,115+n*28,x+247,115+n*28,'#4d8866',2);rect(c,x+65+n*29,111+n*28,8,8,'#b3a66e');}rect(c,x+119,145,76,72,'#162d2f');for(let n=0;n<7;n++){rect(c,x+113,149+n*10,8,4,'#b6c6b2');rect(c,x+194,149+n*10,8,4,'#b6c6b2');}rect(c,x+130,156,54,5,'#608278');
    }else if(theme==='printer'){
      rect(c,x+55,84,12,215,'#84949d');rect(c,x+251,84,12,215,'#84949d');rect(c,x+53,105,210,12,'#506d7b');
      for(let k=0;k<15;k++)line(c,x+55,90+k*13,x+67,95+k*13,'#c6d6d8',2);
      const nx=x+115+Math.sin(t*.7+i)*45;rect(c,nx,117,55,49,'#d4dcde');rect(c,nx+8,157,38,14,'#425c69');rect(c,nx+22,170,10,16,'#ffac77');
      c.fillStyle='#79d7e5';c.font='11px monospace';c.fillText('LAYER 048 / 128',x+86,217);c.fillStyle='#406071';c.fillRect(x+86,229,125,5);c.fillStyle='#81dcec';c.fillRect(x+86,229,48,5);
    }else if(theme==='ice'){
      for(let j=0;j<3;j++){rect(c,x+48+j*76,90,65,197,'#27435c');rect(c,x+53+j*76,97,55,82,'#40657d');rect(c,x+58+j*76,102,45,3,'#6c95ab');rect(c,x+58+j*76,170,45,4,'#70a6be');rect(c,x+58+j*76,193,45,3,'#6c95ab');rect(c,x+58+j*76,266,45,4,'#70a6be');rect(c,x+100+j*76,183,5,8,'#93c7d7');}
    }else{
      for(let j=0;j<4;j++){rect(c,x+52+j*57,90,20,199,'#754b4966');rect(c,x+57+j*57,90,4,199,'#bd85622e');rect(c,x+48+j*57,137,28,9,'#694f52');rect(c,x+48+j*57,237,28,9,'#694f52');}
      glow(c,x+165,240,140,'#ee89530c');
    }
    rect(c,x+25,305,270,8,P.line);
  }
  for(let i=-1;i<9;i++){const x=i*190-((camera*.38)%190);rect(c,x,390,165,105,P.deep);rect(c,x+7,397,151,3,P.line);rect(c,x+10,408,70,72,P.sky);rect(c,x+89,408,65,72,P.sky);rect(c,x+69,432,4,18,P.line);rect(c,x+98,432,4,18,P.line);}
  line(c,0,348,width,348,P.line,3);line(c,0,353,width,353,P.deep,3);
  for(let i=0;i<15;i++){const x=((i*179-camera*.12)%width+width)%width,y=90+(i*89)%390+Math.sin(t*.5+i)*8;rect(c,x,y,2,2,P.glow+'30');}
}
function platform(c,p,P,pulse,t,g=null){
  const x=p.x,y=p.y,w=p.w;
  if(p.type==='ghost'){
    c.save();if(g?!platformSolid(g,p):pulse<=0){c.globalAlpha=.45;c.setLineDash([7,6]);c.strokeStyle=P.glow;c.lineWidth=2;c.strokeRect(x+1,y+1,w-2,18);c.setLineDash([]);for(let j=12;j<w;j+=22)rect(c,x+j,y+8,3,3,P.glow);c.restore();return;}
    glow(c,x+w/2,y,100,P.glow+'20');rect(c,x,y,w,20,'#418d89');rect(c,x,y,w,4,'#b3fff0');for(let j=10;j<w;j+=20)rect(c,x+j,y+8,4,4,'#9bffe2');c.restore();return;
  }
  if(p.type==='leaf'){
    if(p.missing>0){c.save();c.globalAlpha=.23;c.setLineDash([4,6]);c.strokeStyle='#c4eb8e';c.strokeRect(x,y,w,10);c.setLineDash([]);c.restore();return;}
    const wobble=p.crumble>0?Math.sin(t*45)*2:0;rect(c,x+wobble,y,w,8,p.crumble>0?'#e8bf6f':'#a5d86c');rect(c,x+8+wobble,y+8,w-16,9,'#507f4e');line(c,x+14,y+4,x+w-14,y+4,'#dfefa4',2);for(let i=20;i<w;i+=25)line(c,x+i,y+4,x+i+10,y+13,'#83b05a',2);return;
  }
  if(p.type==='printed'){
    const solid=g?platformSolid(g,p):true,phase=printedPhase(p);c.save();c.globalAlpha=solid?1:.38;
    rect(c,x,y,w,20,solid?'#35768e':'#a56c46');for(let yy=0;yy<20;yy+=5)line(c,x,y+yy,x+w,y+yy,solid?'#a4f0ff':'#eab38b',2);
    rect(c,x,y-5,w*clamp(phase/1.4,0,1),3,solid?'#9bfbdc':'#ffc788');c.font='9px monospace';c.fillStyle=solid?'#b9f7e3':'#f8c49a';c.textAlign='center';c.fillText(solid?'COOLED / SOLID':'PRINTING…',x+w/2,y+35);c.textAlign='left';c.restore();return;
  }
  if(p.type==='conveyor'){
    rect(c,x,y,w,p.h,P.soil);rect(c,x,y,w,12,'#879b9c');rect(c,x,y+4,w,5,'#1f3135');
    c.save();c.beginPath();c.rect(x,y,w,35);c.clip();for(let xx=x-35+((t*(p.belt||55))%36);xx<x+w+35;xx+=36){const dir=p.belt<0?-1:1;line(c,xx-dir*6,y+19,xx,y+24,'#f6c58a',2);line(c,xx,y+24,xx-dir*6,y+29,'#f6c58a',2);}c.restore();
    for(let xx=x+13;xx<x+w;xx+=57){rect(c,xx,y+45,21,21,'#223235');rect(c,xx+6,y+51,9,9,'#6c8381');}return;
  }
  if(p.type==='cart'){
    rect(c,x,y,w,10,'#aab8bb');rect(c,x+5,y+10,w-10,16,'#70858b');rect(c,x+38,y+17,w-76,20,'#18222b');
    for(const xx of [x+15,x+w-43]){rect(c,xx,y+23,29,29,'#0c1420');rect(c,xx+5,y+27,19,21,'#333e48');rect(c,xx+11,y+31,6,13,'#8999a5');}
    rect(c,x+w/2-18,y+13,36,12,'#262f38');rect(c,x+w/2-9,y+15,18,4,'#73f5c9');rect(c,x+11,y-3,w-22,3,'#ffffff');
    c.font='10px monospace';c.fillStyle='#263647';c.textAlign='center';c.fillText('PICO CARGO / 03',x+w/2,y+8);c.textAlign='left';return;
  }
  if(P===PALETTES.printer&&p.type!=='ghost'&&p.type!=='moving'&&p.type!=='wave'){
    rect(c,x,y,w,p.h,P.soil);for(let yy=y;yy<y+p.h;yy+=7)line(c,x,yy,x+w,yy,yy===y?'#b4f5ff':'#3c82a1',2);
    rect(c,x+4,y+4,w-8,2,'#74cede');return;
  }
  if(p.type==='spring'){rect(c,x,y,w,7,'#c3ee88');rect(c,x+4,y+7,w-8,3,'#57885e');for(let j=6;j<w-3;j+=12){line(c,x+j,y+9,x+j+9,y+14,'#c2ec99',2);}return;}
  rect(c,x,y,w,p.h,P.soil);rect(c,x,y,w,5,p.type==='ice'?'#c4f1ff':P.top);rect(c,x,y+5,w,5,P.edge);rect(c,x,y+10,w,2,'#07182466');
  if(p.type==='moving'||p.type==='wave'){rect(c,x,y+14,w,10,'#3d606f');for(let j=5;j<w;j+=23)rect(c,x+j,y+17,10,3,'#a9d6dc');rect(c,x+w/2-15,y+24,30,7,'#172c3b');glow(c,x+w/2,y+30,30,P.glow+'30');rect(c,x+w/2-9,y+27,18,3,P.glow);}
  if(p.type==='ice'){for(let j=8;j<w;j+=43){line(c,x+j,y+1,x+j+13,y+13,'#e3faff77',2);line(c,x+j+10,y+7,x+j+19,y+17,'#acdff188');}}
  if(p.h>60){for(let j=0;j<w;j+=56){line(c,x+j,y+14,x+j,y+p.h,P.edge+'66');rect(c,x+j+7,y+20,3,3,P.top+'66');rect(c,x+j+7,y+67,3,3,P.top+'44');}for(let j=28;j<w;j+=112){line(c,x+j,y+31,x+j+28,y+31,P.edge,2);line(c,x+j+28,y+31,x+j+28,y+54,P.edge,2);rect(c,x+j+25,y+51,6,6,P.edge);}rect(c,x,y+96,w,4,P.deep);}
}
function gear(c,x,y,t,color='#9af5cf',scale=1){
  c.save();c.translate(x,y);c.rotate(Math.floor(t*3)%8*Math.PI/4);c.scale(scale,scale);for(let i=0;i<4;i++){c.rotate(Math.PI/2);rect(c,-3,-12,6,7,color);}rect(c,-8,-8,16,16,color);rect(c,-4,-4,8,8,'#1b4150');rect(c,-2,-2,4,4,'#a7f6d5');c.restore();
}
function checkpoint(c,cp,active,t){
  rect(c,cp.x-3,cp.y-83,5,83,'#6e8994');rect(c,cp.x-12,cp.y-4,24,4,'#a1b9bd');
  const col=active?'#7ef2ce':'#728b9e';rect(c,cp.x+2,cp.y-81,30,22,col);rect(c,cp.x+29,cp.y-77+Math.sin(t*3)*2,8,17,col);rect(c,cp.x+9,cp.y-75,4,10,'#23484e');rect(c,cp.x+6,cp.y-72,10,4,'#23484e');if(active)glow(c,cp.x+13,cp.y-70,70,'#75efce17');
}
function goal(c,g,t){
  const {x,y}=g.level.goal,ready=g.level.relays.every(r=>r.optional||r.on)&&(!g.level.boss||g.level.boss.repaired)&&(!g.printer||g.printer.boss.done),col=ready?g.level.color:'#8c7d9e';glow(c,x,y-50,110,col+'20');
  rect(c,x-31,y-102,62,102,'#101e31');rect(c,x-36,y-105,72,9,'#6a8895');rect(c,x-32,y-96,5,96,'#82aaa9');rect(c,x+27,y-96,5,96,'#82aaa9');rect(c,x-23,y-91,46,85,'#233d4f');
  rect(c,x-18,y-86,36,50,col+'44');rect(c,x-15,y-82,30,40,'#163140');
  const wave=Math.sin(t*4)*4;line(c,x-11,y-60,x-5,y-60,col,2);line(c,x-5,y-60,x,y-69-wave,col,2);line(c,x,y-69-wave,x+5,y-52+wave,col,2);line(c,x+5,y-52+wave,x+12,y-60,col,2);
  rect(c,x-20,y-29,40,4,col);rect(c,x-17,y-18,6,6,col);rect(c,x+11,y-18,6,6,col);rect(c,x-39,y-5,78,5,'#9ab7bc');
  c.font='9px monospace';c.textAlign='center';c.fillStyle=col;c.fillText(ready?'RESTORE':`${g.level.relays.filter(r=>!r.optional&&!r.on).length} TO REPAIR`,x,y-120);c.textAlign='left';
}
export function drawWorld(c,g,t,effects=[],reduced=false){
  const P=PALETTES[g.level.theme];background(c,g.level.theme,g.camera,t);
  c.save();if(g.shake>0&&!reduced){c.translate(Math.sin(t*87)*g.shake*12,Math.cos(t*99)*g.shake*7);}c.translate(-Math.round(g.camera),-Math.round(g.cameraY||0));
  for(const w of g.level.winds){c.fillStyle='#b9ee9e0b';c.fillRect(w.x,w.y,w.w,w.h);for(let i=0;i<18;i++){const x=w.x+15+(i*71)%(w.w-30),y=w.y+((i*59-t*100)%w.h+w.h)%w.h;line(c,x,y,x,y+12,'#c8f2aa50',2);line(c,x,y,x-3,y+4,'#c8f2aa50');line(c,x,y,x+3,y+4,'#c8f2aa50');}rect(c,w.x+10,w.y+w.h-28,w.w-20,25,'#244a45');for(let x=w.x+25;x<w.x+w.w-15;x+=22)rect(c,x,w.y+w.h-25,9,18,'#5d8870');}
  for(const a of g.level.platforms){if(a.x+a.w<g.camera-30||a.x>g.camera+VIEW.w+30)continue;platform(c,a,P,g.pulse,t,g);}
  for(const z of g.level.gravityZones){c.save();c.fillStyle='#75ebce0b';c.fillRect(z.x,z.y,z.w,z.h);c.strokeStyle='#7bedd357';c.setLineDash([7,10]);c.strokeRect(z.x,z.y,z.w,z.h);c.setLineDash([]);c.fillStyle='#9bded0';c.font='13px monospace';c.fillText('LOW GRAVITY / 0.38 G',z.x+30,z.y+40);for(let i=0;i<25;i++){const x=z.x+(i*149)%z.w,y=z.y+((i*87-t*18)%z.h+z.h)%z.h;star(c,x,y,2,'#b7ffe555');}c.restore();}
  for(const r of g.level.rails){
    const slope=(r.y2-r.y1)/(r.x2-r.x1);for(let x=Math.max(r.x1,g.camera-60);x<Math.min(r.x2,g.camera+VIEW.w+60);x+=32){const y=r.y1+(x-r.x1)*slope;line(c,x-7,y-1,x+7,y+12,'#bba989',6);if(Math.floor(x/32)%6===0){line(c,x,y+8,x,y+170,'#415b6d',8);line(c,x,y+10,x+42,y+75,'#415b6d',4);}}
    line(c,r.x1,r.y1,r.x2,r.y2,'#d4e4df',5);line(c,r.x1,r.y1+8,r.x2,r.y2+8,'#6d8e9d',3);
    if(!g.level.rails.some(next=>next.x1===r.x2)&&r.x2<g.level.width-100){c.font='bold 13px monospace';c.textAlign='center';c.fillStyle='#ffe1a1';c.fillText('JUMP ↗',r.x2-70,r.y2-95);c.textAlign='left';for(let i=0;i<3;i++)line(c,r.x2-100+i*22,r.y2-12,r.x2-90+i*22,r.y2-25,'#ffbe7c',3);}
  }
  if(g.cart){c.save();c.translate(g.cart.x,g.cart.y);c.rotate(g.cart.angle);platform(c,{x:-g.cart.w/2,y:0,w:g.cart.w,h:18,type:'cart'},P,0,t);c.restore();}
  for(const h of g.level.presses){const state=pressState(g,h),color=g.pulse>0?'#89efce':state.warning?'#ffd68f':'#f2a08d';line(c,h.x+h.w/2,h.y-140,h.x+h.w/2,h.y,'#76838c',18);rect(c,h.x-13,h.y-16,h.w+26,20,'#87949a');rect(c,h.x,state.y,h.w,state.h,'#34464f');for(let y=h.y+10;y<h.y+state.h-20;y+=17)line(c,h.x+10,y,h.x+h.w-10,y,'#677f88',3);rect(c,h.x-8,h.y+state.h-16,h.w+16,16,color);if(state.warning){c.save();c.strokeStyle='#ffd68f88';c.setLineDash([5,6]);c.strokeRect(h.x,h.y,h.w,h.floorY-h.y);c.restore();c.font='bold 15px monospace';c.fillStyle='#ffd68f';c.textAlign='center';c.fillText('!',h.x+h.w/2,h.y-30);c.textAlign='left';}}
  for(const portal of g.level.portals){const col=portal.on?'#8affd5':'#d5adff';glow(c,portal.x,portal.y,90,col+'24');c.save();c.translate(portal.x,portal.y);c.strokeStyle=col;c.lineWidth=5;c.beginPath();c.ellipse(0,0,30,60,0,0,Math.PI*2);c.stroke();c.lineWidth=1;c.beginPath();c.ellipse(0,0,40,69,0,0,Math.PI*2);c.stroke();for(let i=0;i<5;i++)star(c,Math.cos(t+i*1.25)*28,Math.sin(t+i*1.25)*56,3,col);c.font='11px monospace';c.fillStyle=col;c.textAlign='center';c.fillText('X / TRANSFER',0,-82);c.restore();}
  for(const q of g.projectiles){if(q.kind==='screw'){rect(c,q.x,q.y,12,5,'#d0e0ed');rect(c,q.x+4,q.y+5,4,17,'#a2b9cd');for(let k=0;k<4;k++)line(c,q.x+2,q.y+7+k*4,q.x+10,q.y+5+k*4,'#e1ebef',2);}else if(q.kind==='acid'){round(c,q.x,q.y,q.w,q.h,4,'#acdf72');glow(c,q.x+q.w/2,q.y,28,'#b4ff5226');for(let i=0;i<3;i++)rect(c,q.x+9+i*17,q.y-4-Math.sin(t*6+i)*3,3,3,'#cbf590');}else{glow(c,q.x+4,q.y+4,17,'#ffab773d');rect(c,q.x,q.y,q.w,q.h,'#ffb78b');rect(c,q.x+2,q.y+2,4,4,'#fff0c9');}}
  // Small details make each room feel inhabited.
  for(const p of g.level.platforms){if(p.h<60||p.w<350)continue;const x=p.x+p.w-65;if(x<g.camera-100||x>g.camera+VIEW.w+100)continue;
    if(g.level.theme==='garden')plant(c,x,p.y,1.1,'#9ac77a');else{rect(c,x-13,p.y-34,35,34,'#354b5c');rect(c,x-10,p.y-31,29,4,P.edge);rect(c,x-8,p.y-21,8,11,P.glow+'88');rect(c,x+5,p.y-21,10,2,'#748f9b');rect(c,x+5,p.y-16,8,2,'#748f9b');}}
  for(const s of g.level.students){student(c,s.x,s.y,s.color,t,1);const close=Math.hypot(g.player.x-s.x,g.player.y+40-s.y)<200;rect(c,s.x+18,s.y-87,3,7,g.level.color);rect(c,s.x+18,s.y-77,3,3,g.level.color);
    if(close){const text=s.lines[Math.floor(t/7)%s.lines.length],small=VIEW.w<1000,bodyFont=small?20:12,nameFont=small?15:9,top=s.y-(small?215:184),h=small?92:65;c.font=`${bodyFont}px "Segoe UI",sans-serif`;const w=Math.max(c.measureText(text).width+28,180),left=clamp(s.x-w/2,g.camera+10,g.camera+VIEW.w-w-10);
      round(c,left,top,w,h,6,'#101f32ee');c.strokeStyle=g.level.color+'70';c.lineWidth=1;c.strokeRect(left+.5,top+.5,w,h);c.fillStyle=g.level.color;c.font=`${nameFont}px "Segoe UI",sans-serif`;c.fillText(s.name,left+13,top+(small?28:19));c.fillStyle='#e0ecef';c.font=`${bodyFont}px "Segoe UI",sans-serif`;c.fillText(text,left+13,top+(small?65:44));line(c,s.x+15,top+h,s.x+15,s.y-100,g.level.color+'77');}}
  for(const sign of g.level.signs){if(Math.abs(g.player.x-sign.x)>310||g.level.students.some(s=>Math.abs(g.player.x-s.x)<185&&Math.abs(s.x-sign.x)<240&&sign.y>310&&sign.y<410))continue;c.save();c.globalAlpha=.8;c.font='11px "Segoe UI",sans-serif';const w=c.measureText(sign.text).width+20;round(c,sign.x-w/2,sign.y-13,w,26,4,'#0d1c2bbc');c.fillStyle='#b6ced6';c.textAlign='center';c.fillText(sign.text,sign.x,sign.y+4);c.textAlign='left';c.restore();}
  for(const coin of g.level.chips){if(coin.got||coin.x<g.camera-30||coin.x>g.camera+VIEW.w+30)continue;const yy=coin.y+Math.sin(t*3+coin.x)*3;glow(c,coin.x,yy,18,'#f8d98a10');const ww=4+Math.abs(Math.sin(t*2+coin.x*.01))*3;rect(c,coin.x-ww,yy-7,ww*2,14,'#d0a75e');rect(c,coin.x-ww+2,yy-6,ww*2-3,10,'#ffe3a2');rect(c,coin.x-1,yy-4,2,6,'#fff2ca');}
  for(const item of g.level.gears){if(item.got)continue;glow(c,item.x,item.y,34,'#75efce22');gear(c,item.x,item.y+Math.sin(t*2)*4,t);star(c,item.x+19,item.y-17,2,'#c8ffe5');}
  for(const r of g.level.relays){if(r.portal)continue;glow(c,r.x,r.y-10,55,r.on?'#75efce33':'#c4a6ff16');rect(c,r.x-18,r.y-30,36,58,'#233448');rect(c,r.x-14,r.y-26,28,28,r.on?'#65d2b3':'#73658e');rect(c,r.x-9,r.y-21,18,18,'#18343a');c.fillStyle=r.on?'#a5f9da':'#cfb7ff';c.font='18px monospace';c.textAlign='center';c.fillText(r.on?'✓':'ϟ',r.x,r.y-6);c.textAlign='left';rect(c,r.x-12,r.y+11,24,3,r.on?'#75efce':'#8b73a1');}
  for(const cp of g.level.checkpoints)checkpoint(c,cp,cp.active,t);goal(c,g,t);
  for(const e of g.level.enemies){if(!e.alive||e.x<g.camera-60||e.x>g.camera+VIEW.w+60)continue;
    const x=e.x,y=e.y,freeze=g.pulse>0,col=freeze?'#76eacf':e.kind==='capacitor'?'#a4b5fc':e.kind==='beaker'?'#f19ea6':'#d5b486';
    if(e.kind==='spring'){
      const ex=freeze?0:e.extension||0;c.strokeStyle=freeze?'#76eacf':'#ffbd80';c.lineWidth=4;c.beginPath();for(let i=0;i<=14;i++){const xx=x-ex+(32+ex*2)*i/14,yy=y+14+(i%2?9:-9);i?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.stroke();
    }else if(e.kind==='coil'){c.strokeStyle='#df91fa';c.lineWidth=3;for(let i=0;i<5;i++){c.beginPath();c.ellipse(x+5+i*5,y+13,6,14,0,0,Math.PI*2);c.stroke();}if(e.state==='charge'||e.state==='discharge'){c.strokeStyle=e.state==='discharge'?'#ffc7ee':'#bd8aff55';c.beginPath();c.arc(x+16,y+14,e.state==='discharge'?65:190,0,Math.PI*2);c.stroke();}}
    else if(e.kind.startsWith('silicone')){round(c,x,y+3,32,25,12,e.kind==='silicone-a'?'#8ee4ee':'#e8a3dc');c.font='10px monospace';c.fillStyle='#233147';c.fillText(e.kind.endsWith('a')?'A':'B',x+12,y+8);}
    else if(e.kind.startsWith('mouse')){round(c,x,y+5,32,22,10,e.kind==='mouse-dash'?'#eeb88d':e.kind==='mouse-hop'?'#c1dbad':e.kind==='mouse-erratic'?'#d9afff':'#e5a1ab');round(c,x+5,y-5,10,13,5,'#eeb8bf');line(c,x+30,y+20,x+44,y+8,'#ddabb3',2);}
    else if(e.kind==='resistor'){line(c,x-4,y+12,x+36,y+12,'#b7c6d1',3);rect(c,x+3,y+3,26,19,col);for(let i=0;i<3;i++)rect(c,x+8+i*7,y+3,3,19,['#ad5749','#513947','#d49254'][i]);}
    else if(e.kind==='beaker'){rect(c,x+9,y-7,14,8,'#a6d0dc');rect(c,x+11,y,10,9,'#a6d0dc');rect(c,x+4,y+9,25,16,'#b4deea');rect(c,x+7,y+13,19,10,col);rect(c,x+13,y+9,4,3,'#ffe1dd');}
    else if(e.kind==='capacitor'){rect(c,x+3,y-3,26,29,col);rect(c,x+6,y,20,3,'#e0e9ff');rect(c,x+22,y+4,4,18,'#6073b7');line(c,x+12,y-2,x+18,y-2,'#53618c',2);line(c,x+15,y-5,x+15,y+1,'#53618c',2);}
    else if(e.kind==='diode'){rect(c,x+4,y+5,24,15,'#779ac5');rect(c,x+11,y+2,10,22,'#c4dcff');rect(c,x-7,y+10,12,4,'#8df5e5');rect(c,x+29,y+10,12,4,'#8df5e5');rect(c,x+14,y+23,4,9,'#d0f0ff');}
    else{rect(c,x+3,y,27,24,'#303e50');for(let i=0;i<4;i++){rect(c,x-2,y+3+i*5,6,2,'#bdc8c7');rect(c,x+28,y+3+i*5,6,2,'#bdc8c7');}rect(c,x+7,y+3,18,3,'#697b83');}
    rect(c,x+9,y+10,4,4,'#0d2230');rect(c,x+21,y+10,4,4,'#0d2230');rect(c,x+9,y+10,2,2,'#ffeaca');rect(c,x+21,y+10,2,2,'#ffeaca');
    if(!freeze&&e.active){
      if(e.state==='charge'||e.state==='aim'){c.font='bold 18px monospace';c.fillStyle='#ffce7b';c.textAlign='center';c.fillText('!',x+16,y-17);c.textAlign='left';}
      if(e.kind==='capacitor'&&(e.state==='charge'||e.state==='discharge')){c.save();c.strokeStyle=e.state==='discharge'?'#ffd2f3':'#d3aeff88';c.lineWidth=e.state==='discharge'?5:2;c.setLineDash(e.state==='discharge'?[]:[4,6]);c.beginPath();c.arc(x+16,y+14,72,0,Math.PI*2);c.stroke();if(e.state==='discharge')glow(c,x+16,y+14,78,'#eeb5ff35');c.restore();}
      if(e.kind==='chip'&&e.state==='aim'&&e.aim){c.save();c.setLineDash([5,6]);line(c,x+16,y+12,x+16+e.aim.x*240,y+12+e.aim.y*240,'#ffba8266',2);c.restore();}
      if(e.kind==='diode'&&e.state==='aim'){line(c,x+16,y+30,x+16,e.targetY+28,'#ffcc8666',2);}
    }
    rect(c,x+4,y+24,8,4,'#6f8493');rect(c,x+22,y+24,8,4,'#6f8493');if(freeze)glow(c,x+16,y+12,35,'#75efce30');
  }
  for(const d of g.level.drinks){if(d.got)continue;const yy=d.y+Math.sin(t*3)*3;glow(c,d.x,yy,36,'#aaff4328');rect(c,d.x-10,yy-18,20,35,'#0a171e');rect(c,d.x-9,yy-20,18,3,'#b7c5bd');rect(c,d.x-9,yy+16,18,3,'#809e8c');c.font='bold 18px monospace';c.fillStyle='#b0ff63';c.textAlign='center';c.fillText('M',d.x,yy+5);c.font='7px monospace';c.fillText('ENA',d.x,yy+13);c.textAlign='left';}
  for(const l of g.level.lasers){if(l.nozzle){rect(c,l.x-25,l.y-52,62,38,'#dde5e4');rect(c,l.x-15,l.y-46,40,19,'#263f52');rect(c,l.x-5,l.y-27,22,20,'#bf875b');line(c,l.baseX-85,l.y-55,l.baseX+110,l.y-55,'#819ba5',7);}rect(c,l.x-8,l.y-11,28,12,'#706276');rect(c,l.x-8,l.y+l.h-1,28,10,'#706276');if(laserActive(g,l)){glow(c,l.x+6,l.y+l.h/2,100,'#ff665a12');rect(c,l.x-5,l.y,22,l.h,'#ff646026');rect(c,l.x+2,l.y,8,l.h,'#ff8676');rect(c,l.x+5,l.y,2,l.h,'#ffdbbc');}else{const warning=g.pulse<=0&&laserPhase(g,l)<.65;for(let y=l.y;y<l.y+l.h;y+=16)rect(c,l.x+5,y,warning?4:2,5,warning?'#ffd88caa':'#90edc740');if(warning){c.font='bold 18px monospace';c.fillStyle='#ffd88c';c.fillText('!',l.x-5,l.y-20);}}}
  drawLab(c,g);drawResearch(c,g);drawPrinter(c,g);
  const p=g.player;
  if(p.boost>0){
    for(let i=reduced?1:6;i>0;i--){c.save();c.globalAlpha=.07+(6-i)*.025;c.filter=`hue-rotate(${(t*95+i*45)%360}deg)`;robot(c,p.x-3-p.face*i*9,p.y-3,2,p.walk*.018,true,p.face,!p.onGround);c.restore();}
    c.save();c.shadowColor=`hsl(${t*130%360},100%,65%)`;c.shadowBlur=22;c.strokeStyle=`hsl(${t*130%360},100%,65%)`;c.lineWidth=3;c.beginPath();c.ellipse(p.x+14,p.y+20,27,33,0,0,Math.PI*2);c.stroke();c.restore();
  }
  if(g.fever||reduced||p.invul<=0||Math.floor(p.invul*12)%2===0){c.save();if(p.boost>0){c.filter=`hue-rotate(${t*150%360}deg) saturate(2.6)`;c.shadowColor=`hsl(${t*130%360},100%,65%)`;c.shadowBlur=18;}robot(c,p.x-3,p.y-3,2,p.walk*.018,Math.abs(p.vx)>25,p.face,!p.onGround&&p.vy<0);c.restore();}
  // The head stays clear during normal play; show the loss briefly after a hit.
  const hx=p.x+14,hy=p.y-43,notice=lifeNotice(p);
  if(notice){
    const col=notice.to>3?'#83ef59':notice.to>1?'#ffd66b':'#ff626c';
    c.save();c.globalAlpha=notice.alpha;c.beginPath();c.arc(hx,hy,20,0,Math.PI*2);c.fillStyle='#0a1922ef';c.fill();
    c.lineWidth=5;c.strokeStyle='#28413c';c.stroke();c.strokeStyle='#ffe1a2';c.beginPath();c.arc(hx,hy,20,-Math.PI/2,-Math.PI/2+Math.PI*2*notice.from/RULES.maxHP);c.stroke();
    c.strokeStyle=col;c.beginPath();c.arc(hx,hy,20,-Math.PI/2,-Math.PI/2+Math.PI*2*notice.fraction);c.stroke();c.font='bold 22px monospace';c.textAlign='center';c.fillStyle='#fff';c.fillText(notice.value,hx,hy+8);
    c.font='bold 12px monospace';c.fillStyle='#ffccd0';c.fillText(`${notice.from} → ${notice.to}`,hx,hy-30);c.restore();
  }
  if(p.boost>0){c.save();c.textAlign='center';c.fillStyle='#baff89';c.font='bold 10px monospace';c.fillText('BOOST '+p.boost.toFixed(1)+'s',hx,notice?hy-48:hy+10);c.restore();}
  for(const e of effects){const a=clamp(e.life/e.max,0,1);c.save();c.globalAlpha=a;if(e.text){c.font='bold 22px monospace';c.fillStyle=e.color;c.textAlign='center';c.fillText(e.text,e.x,e.y);}else if(e.ring){c.strokeStyle=e.color;c.lineWidth=3*a;c.beginPath();c.arc(e.x,e.y,(1-a)*e.radius,0,Math.PI*2);c.stroke();}else rect(c,e.x,e.y,e.size,e.size,e.color);c.restore();}
  c.restore();if(g.pulse>0){c.strokeStyle='#75efce33';c.lineWidth=7;c.strokeRect(3,3,VIEW.w-6,VIEW.h-6);}
  if(g.warp>0){c.fillStyle=`rgba(171,142,235,${g.warp*.25})`;c.fillRect(0,0,VIEW.w,VIEW.h);}
  const shade=c.createLinearGradient(0,0,0,100);shade.addColorStop(0,'#07112265');shade.addColorStop(1,'transparent');c.fillStyle=shade;c.fillRect(0,0,VIEW.w,100);
}
export function drawHome(c,t){
  background(c,'bench',0,t);glow(c,883,240,300,'#72cfaa14');
  // Moonlit window and cable tracks.
  rect(c,633,65,366,236,'#0b192c');rect(c,641,73,350,220,'#1c3448');
  const sky=c.createLinearGradient(0,73,0,293);sky.addColorStop(0,'#18324b');sky.addColorStop(1,'#2d4b5b');c.fillStyle=sky;c.fillRect(646,78,340,210);
  for(let i=0;i<22;i++)star(c,655+(i*113)%320,90+(i*47)%150,i%4===0?2:1,i%3?'#779ba6':'#d1d9bf');
  glow(c,906,132,75,'#f0dbac1a');rect(c,889,112,34,40,'#dcd9b2');rect(c,884,119,44,26,'#dcd9b2');rect(c,897,112,26,6,'#f3e6bc');rect(c,884,126,8,15,'#bdc5a2');rect(c,911,137,9,7,'#bdc5a2');
  for(let i=0;i<8;i++){const h=25+(i*17)%55;rect(c,646+i*44,289-h,42,h,'#14283d');rect(c,657+i*44,295-h,4,5,'#91ad9e60');rect(c,668+i*44,309-h,4,5,'#91ad9e60');}
  rect(c,814,73,8,220,'#3d5a66');rect(c,642,192,349,6,'#3d5a66');rect(c,627,295,379,11,'#608183');rect(c,632,306,369,7,'#203d4d');
  line(c,713,0,713,40,'#3b5863',4);line(c,713,40,1090,40,'#3b5863',4);line(c,1090,40,1090,100,'#3b5863',4);
  rect(c,1050,98,80,12,'#526d77');rect(c,1062,110,56,5,'#abc9b2');
  const light=c.createLinearGradient(0,110,0,475);light.addColorStop(0,'#c7e5a50d');light.addColorStop(1,'#c7e5a500');c.fillStyle=light;c.beginPath();c.moveTo(1063,114);c.lineTo(1120,114);c.lineTo(1200,480);c.lineTo(850,480);c.fill();
  // Main workbench: layered panels and custom pixel props.
  rect(c,560,480,640,120,'#1b3442');rect(c,549,469,651,10,'#81a5a1');rect(c,549,479,651,8,'#455f68');
  for(let i=0;i<7;i++){rect(c,572+i*92,501,80,95,'#203e4b');rect(c,578+i*92,507,68,3,'#335865');rect(c,600+i*92,519,21,5,'#5e7f86');rect(c,578+i*92,589,68,3,'#122b3a');}
  rect(c,689,461,220,8,'#32505b');rect(c,696,452,204,9,'#587e80');
  // Character on a little folded schematic.
  rect(c,753,448,142,5,'#96ac9e');rect(c,764,443,124,5,'#c5d2b2');line(c,784,445,842,445,'#668d88',1);
  glow(c,825,358,140,'#75efce16');robot(c,774,292+Math.sin(t*1.6)*2,6.7,t,false,1,false);
  // Oscilloscope, books, and a living occupant.
  monitor(c,945,332,115,88);rect(c,940,447,130,7,'#2d4d59');rect(c,949,442,111,5,'#6d9198');
  student(c,1128,470,'#b6b0e0',t,1.75);
  plant(c,658,466,1.3,'#77ba92');
  rect(c,580,447,46,16,'#aa7967');rect(c,585,430,41,16,'#bcac80');rect(c,581,414,46,15,'#769d9b');rect(c,585,418,35,2,'#bbd5c4');
  // Hanging PCB and floating repair parts.
  line(c,1030,0,1030,175,'#3a5564',2);rect(c,1010,174,44,68,'#315849');rect(c,1015,180,34,54,'#416d59');rect(c,1024,195,15,18,'#152f32');for(let j=0;j<5;j++)rect(c,1017+j*6,176,3,5,'#c5b984');
  for(let i=0;i<4;i++){const x=728+i*64,y=246+Math.sin(t*.8+i*1.7)*12;star(c,x,y,i===1?5:2,i===1?'#cdeac1':'#749f9b');}
  gear(c,932,280+Math.sin(t)*7,t*.5,'#a5ebc5',1.15);
  c.font='8px monospace';c.fillStyle='#8fc1bc';c.fillText('PICO / UNIT 01',771,430);
  c.fillStyle='#a0b5c4';c.font='10px sans-serif';c.textAlign='center';c.fillText('あと1回だけ測定したら…',1087,310);c.textAlign='left';
  // Scanlines are intentionally faint, not a filter on the whole UI.
  for(let y=0;y<600;y+=4)rect(c,0,y,1200,1,'#050e1912');
}
export function drawThumbnail(canvas,level){
  const c=canvas.getContext('2d');canvas.width=240;canvas.height=84;const P=PALETTES[level.theme];const bg=c.createLinearGradient(0,0,0,84);bg.addColorStop(0,P.sky);bg.addColorStop(1,P.low);c.fillStyle=bg;c.fillRect(0,0,240,84);
  for(let i=0;i<7;i++){rect(c,i*40+5,14,32,45,P.deep);rect(c,i*40+8,17,26,30,P.line+'66');}
  const platforms=[{x:0,y:65,w:58,h:30,type:'ground'},{x:72,y:48,w:52,h:40,type:level.theme==='ice'?'ice':'ground'},{x:144,y:62,w:45,h:30,type:level.theme==='foundry'?'ghost':'ground'},{x:206,y:35,w:34,h:60,type:'ground'}];
  platforms.forEach(p=>platform(c,p,P,1,0));robot(c,89,25,1,0);for(let i=0;i<3;i++)rect(c,153+i*11,40-i%2*7,3,5,'#e9d69b');
  if(level.theme==='garden'){plant(c,25,65,.5,'#86b977');plant(c,223,35,.35,'#86b977');}if(level.theme==='foundry'){rect(c,132,20,2,64,'#f38e78');glow(c,133,45,25,'#ff886333');}if(level.theme==='tower'){rect(c,30,37,14,27,'#6c6090');rect(c,33,40,8,9,'#c4a6ff');}if(level.theme==='ice'){for(let i=0;i<8;i++)star(c,20+i*29,12+(i*17)%40,1,'#a3d5ed66');}
}
