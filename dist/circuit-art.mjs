import {RESISTORS} from './circuit-model.mjs?v=4.9d';
import {doorReady} from './rooms.mjs?v=4.9d';
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
const line=(c,points,color,width=3)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
function label(c,text,x,y,color='#d1e7dc',size=15){c.fillStyle=color;c.font=`bold ${size}px monospace`;c.fillText(text,x,y);}
function scope(c,s,x,y){
 rect(c,x,y,270,145,'#081d2a');c.strokeStyle='#60898b';c.lineWidth=2;c.strokeRect(x,y,270,145);
 rect(c,x+8,y+54,252,18,'#174c4544');
 for(let k=1;k<5;k++)line(c,[[x+8,y+25*k],[x+262,y+25*k]],'#27444c',1);
 const samples=s.signal.samples;
 for(let j=0;j<2;j++)line(c,samples.map((v,i)=>[x+8+i*4.2,y+117-v[j]*12]),j?'#7df0d6':'#ecab74',j?3:1.5);
 label(c,'IN ~    OUT '+s.signal.output.toFixed(1)+'V',x+10,y+19,'#bce3da',13);
 label(c,s.signal.stable?'✓ STABLE':'~ '+s.signal.ripple.toFixed(2)+'V ripple',x+10,y+137,s.signal.stable?'#80efd0':'#ffc181',13);
}
function part(c,e,s,t){
 if(e.state==='dead')return;const x=e.x,y=e.y;
 if(e.warning){line(c,[[x-6,y-8],[x+e.w+6,y-8]],'#ffc168',4);label(c,'!',x+e.w/2-4,y-16,'#ffc168',20);}
 if(e.kind==='resistor'){
  line(c,[[x-10,y+18],[x+70,y+18]],'#d3daca',5);rect(c,x,y+3,60,30,'#b48c68');rect(c,x+4,y+4,52,5,'#e4c6a2');
  RESISTORS[s.band].bands.forEach((col,i)=>rect(c,x+12+i*13,y+4,7,28,col));
 }else{rect(c,x,y,42,46,'#6398a6');rect(c,x+3,y+2,36,7,'#bce4dd');rect(c,x+29,y+9,9,31,'#dcead1');label(c,'−',x+28,y+30,'#355066',15);line(c,[[x+8,y+46],[x+8,y+50],[x+34,y+50],[x+34,y+46]],'#d8e6d5',3);}
 if(e.state==='roam'){rect(c,x+9,y+12,6,5,e.stun?'#8affd0':'#fa8ea8');rect(c,x+e.w-16,y+12,6,5,e.stun?'#8affd0':'#fa8ea8');for(const off of [8,e.w-8])line(c,[[x+off,y+e.h-5],[x+off+Math.sin(t*15)*5,y+e.h]],'#d6dfcb',3);}
 if(e.state==='locked'){line(c,[[x-6,y],[x-6,y+e.h],[x+e.w+6,y+e.h],[x+e.w+6,y]],'#7ce8ca',5);label(c,'✓',x+e.w+12,y+20,'#7ce8ca',20);}
}
export function drawCircuitTower(c,g){const s=g.circuit,X=g.level.circuit.origin,t=g.time;
 c.save();c.textAlign='left';
 // Functional conductors connect pads to the scope, lift, diode, base and coil.
 const powered=s.signal.stable&&s.forward,green='#72e6ce',dim='#416573';
 line(c,[[X+190,430],[X+430,430],[X+430,505]],s.parts[0].state==='locked'?green:dim,5);
 line(c,[[X+430,505],[X+570,505],[X+570,590],[X+950,590],[X+950,645]],s.parts[1].state==='locked'?green:dim,5);
 line(c,[[X+950,590],[X+1190,590],[X+1190,130],[X+1380,130],[X+1510,130],[X+1700,130]],s.signal.stable?green:dim,4);
 for(let n=0;n<6;n++){const y=590-((t*95+n*72)%460);rect(c,X+1186,y,8,10,s.signal.stable?green:'#b78362');}
 label(c,'01  MATCH / CLAMP',X+160,390);label(c,'02  FILTER / RIDE',X+670,385);label(c,'03  BASE / DRIVE',X+1350,30);label(c,'04  COIL',X+1630,75);
 for(const e of s.parts){c.setLineDash(e.state==='locked'?[]:[7,5]);c.strokeStyle=e.state==='locked'?green:'#e9c991';c.lineWidth=3;c.strokeRect(e.padX-e.w/2-7,e.padY-e.h-5,e.w+14,e.h+8);c.setLineDash([]);label(c,e.id.toUpperCase(),e.padX-6,e.padY+25,'#e6c88d',19);part(c,e,s,t);}
 scope(c,s,X+660,425);scope(c,s,X+60,175);
 // Color bands have printed digits and a matching reference, not color-only clues.
 const color=g.level.circuit.controls.find(c=>c.id==='ct-color');rect(c,color.x-25,color.y-29,50,58,'#233d50');label(c,'↻',color.x-13,color.y+8,'#efd3a2',26);
 label(c,RESISTORS[s.band].label,X+360,410);for(const [n,def] of RESISTORS.entries()){label(c,def.label,X+310+n*92,345,'#d5c7ac',12);def.bands.forEach((v,i)=>rect(c,X+318+n*92+i*16,360,9,18,v));}
 label(c,'OUT 3.8–5.2V / ~ <0.3V',X+660,410,'#8fd9c2',13);
 for(const id of ['ct-reset','ct-hint']){const o=g.level.circuit.controls.find(c=>c.id===id);rect(c,o.x-22,o.y-22,44,44,'#263e51');c.strokeStyle='#aacac5';c.strokeRect(o.x-22,o.y-22,44,44);label(c,id==='ct-reset'?'↺':'?',o.x-12,o.y+9,'#dcead2',25);}
 const loose=g.level.circuit.controls.find(c=>c.id==='ct-transistor');
 function transistor(x,y,installed){rect(c,x-17,y-20,34,26,installed?'#76b5ac':'#d7ae72');for(let i=-1;i<2;i++)line(c,[[x+i*11,y+6],[x+i*11,y+21]],'#e1dccc',3);label(c,'B',x-4,y-26,'#d6eee0',13);}
 if(!s.transistor&&!s.held)transistor(loose.x,loose.y,false);if(s.held)transistor(g.player.x+14,g.player.y-18,false);
 c.strokeStyle=s.transistor?green:'#e9c991';c.setLineDash(s.transistor?[]:[6,5]);c.strokeRect(X+1484,90,52,55);c.setLineDash([]);if(s.transistor)transistor(X+1510,120,true);
 const d=X+1380;rect(c,d-26,100,52,44,'#243e50');line(c,[[d-20,122],[d+20,122]],powered?green:'#efb78c',3);c.fillStyle=powered?green:'#efb78c';c.beginPath();c.moveTo(d+(s.forward?-13:13),110);c.lineTo(d+(s.forward?-13:13),134);c.lineTo(d+(s.forward?10:-10),122);c.fill();line(c,[[d+(s.forward?12:-12),108],[d+(s.forward?12:-12),136]],'#edebd1',4);label(c,'↻',d-8,85);
 label(c,'24V  LOAD',X+1580,20,powered?green:dim,13);
 label(c,'PULSE',X+1480,65,s.transistor?green:'#8a9b9e',13);
 // Show the entire motion corridor, with non-solid arm dashed until fully lowered.
 line(c,[[X+1100,620],[X+1100,210],[X+1280,210],[X+1280,620]],'#446a76',2);
 const lift=g.level.platforms.find(a=>a.pcbRole==='circuit-lift');rect(c,lift.x,lift.y,180,5,s.signal.stable?green:'#f5b778');label(c,s.signal.stable?'↑   ↓':'~   ~',lift.x+55,lift.y-12,s.signal.stable?green:'#f5b778',18);
 c.setLineDash(s.arm<.99?[7,5]:[]);c.strokeStyle=s.arm<.99?'#eac48e88':green;c.lineWidth=6;c.strokeRect(X+1580,150-(1-s.arm)*110,200,22);c.setLineDash([]);
 for(let i=0;i<4;i++){c.strokeStyle=s.arm>=.99&&powered?'#e7a9ff':'#596581';c.lineWidth=5;c.beginPath();c.ellipse(X+1648+i*32,148-(1-s.arm)*110,12,30,0,0,Math.PI*2);c.stroke();}
 label(c,'JUMP ↑',X+1650,210,'#c9b4ee',15);
 for(let i=0;i<8;i++){const y=90-i*35;line(c,[[X+1710+i*29,y+9],[X+1718+i*29,y],[X+1726+i*29,y+9]],s.launched?'#cc9cf1':'#55627d',2);}
 label(c,s.complete?'✓ CIRCUIT VERIFIED':'TEST EXIT',X+1990,-240,s.complete?green:'#dce9cd',17);
 for(const d of g.level.doors.filter(d=>d.room==='S')){rect(c,d.x-32,d.y-90,64,90,'#183342');c.strokeStyle=doorReady(g,d)?green:'#c8958b';c.lineWidth=3;c.strokeRect(d.x-32,d.y-90,64,90);label(c,d.to,d.x-5,d.y-48);}
 // Local, delayed cue; never cover the screen with an answer arrow.
 if(s.idle>18){const target=s.parts.find(e=>e.state!=='locked');const x=target?.padX??(s.signal.stable?X+1380:X+535),y=target?.padY??(s.signal.stable?120:480);c.strokeStyle='#f4deb1';c.lineWidth=2;c.beginPath();c.arc(x,y-28,45+Math.sin(t*3)*4,0,Math.PI*2);c.stroke();}
 c.restore();
}
