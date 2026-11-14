import {RESISTORS,bridgeState,filterStatus} from './circuit-model.mjs?v=4.10.0';
import {relayYard} from './circuit-challenge.mjs?v=4.10.0';
import {doorReady} from './rooms.mjs?v=4.10.0';
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
  RESISTORS[e.band??s.band].bands.forEach((col,i)=>rect(c,x+12+i*13,y+4,7,28,col));
 }else if(e.kind==='switch'){rect(c,x,y+6,46,30,'#b58652');rect(c,x+7,y,32,9,e.state==='locked'?'#81f0c8':'#e8d6a3');label(c,'SW',x+8,y+27,'#182e3e',15);
 }else{
  // Aluminium electrolytic can: elliptical lid, scored vent, sleeve and negative stripe.
  c.fillStyle='#214d72';c.beginPath();c.ellipse(x+21,y+40,21,7,0,0,Math.PI*2);c.fill();
  rect(c,x,y+7,42,34,'#24537b');rect(c,x+5,y+8,6,31,'#397da3');rect(c,x+30,y+7,9,34,'#d4e7de');
  c.fillStyle='#c8d5d0';c.beginPath();c.ellipse(x+21,y+7,21,7,0,0,Math.PI*2);c.fill();line(c,[[x+12,y+4],[x+29,y+10]],'#596e77',2);line(c,[[x+12,y+10],[x+29,y+4]],'#596e77',2);
  label(c,'−',x+30,y+23,'#34556b',13);label(c,'−',x+30,y+37,'#34556b',13);if(e.state==='locked'){c.globalAlpha=.3+.3*Math.min(1,s.signal.output/5);rect(c,x+1,y+8,4,31,'#adffe1');c.globalAlpha=1;}
  label(c,'100',x+3,y+26,'#e1f1ec',10);label(c,'µF',x+7,y+38,'#e1f1ec',10);
  line(c,[[x+10,y+45],[x+10,y+50]],'#d7d5b4',3);line(c,[[x+31,y+45],[x+31,y+50]],'#d7d5b4',3);
 }
 if(e.flash){c.strokeStyle='#fcf3ab';c.lineWidth=3;c.strokeRect(x-8,y-8,e.w+16,e.h+16);}
 if(e.state==='roam'){rect(c,x+9,y+12,6,5,e.stun?'#8affd0':'#fa8ea8');rect(c,x+e.w-16,y+12,6,5,e.stun?'#8affd0':'#fa8ea8');for(const off of [8,e.w-8])line(c,[[x+off,y+e.h-5],[x+off+Math.sin(t*15)*5,y+e.h]],'#d6dfcb',3);}
 if(e.state==='locked'){const spread=6+(e.flash||0)*14;line(c,[[x-spread,y],[x-spread,y+e.h],[x+e.w+spread,y+e.h],[x+e.w+spread,y]],'#7ce8ca',5);label(c,'✓',x+e.w+12,y+20,'#7ce8ca',20);}
}
export function drawCircuitTower(c,g,reduced=false){const s=g.circuit,X=g.level.circuit.origin,t=g.time;
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
 label(c,'TARGET 3.8–5.2V',X+340,270,'#f5df9a',18);label(c,'RIPPLE <0.3V',X+340,291,'#f5df9a',18);label(c,'踏む → 帯が変わる',X+340,310,'#d7e5d7',15);
 label(c,RESISTORS[s.band].label,X+360,410);for(const [n,def] of RESISTORS.entries()){label(c,def.label,X+310+n*92,345,'#d5c7ac',12);def.bands.forEach((v,i)=>rect(c,X+318+n*92+i*16,360,9,18,v));}
 label(c,'OUT 3.8–5.2V / ~ <0.3V',X+660,410,'#8fd9c2',13);
 for(const id of ['ct-reset','ct-hint','ct-yard-reset']){const o=g.level.circuit.controls.find(c=>c.id===id);rect(c,o.x-22,o.y-22,44,44,'#263e51');c.strokeStyle='#aacac5';c.strokeRect(o.x-22,o.y-22,44,44);label(c,id==='ct-hint'?'?':'↺',o.x-12,o.y+9,'#dcead2',25);}
 const loose=g.level.circuit.controls.find(c=>c.id==='ct-transistor');
 function transistor(x,y,installed){rect(c,x-17,y-20,34,26,installed?'#76b5ac':'#d7ae72');for(let i=-1;i<2;i++)line(c,[[x+i*11,y+6],[x+i*11,y+21]],'#e1dccc',3);label(c,'B',x-4,y-26,'#d6eee0',13);}
 if(!s.transistor&&!s.held)transistor(loose.x,loose.y,false);if(s.held)transistor(g.player.x+14,g.player.y-18,false);
 c.strokeStyle=s.transistor?green:'#e9c991';c.setLineDash(s.transistor?[]:[6,5]);c.strokeRect(X+1484,90,52,55);c.setLineDash([]);if(s.transistor)transistor(X+1510,120,true);
 label(c,'SOURCE '+s.source.toUpperCase(),X+1625,292,'#f2da9e',16);rect(c,X+1670,310,40,40,'#567287');label(c,'↔',X+1674,337,'#f3dfae',25);
 const bridge=bridgeState(s.diodes,t,s.source);
 for(let i=0;i<4;i++){const o=g.level.circuit.controls.find(v=>v.id===(i?'ct-diode-'+i:'ct-diode'));rect(c,o.x-25,o.y-22,50,44,'#203e55');label(c,'D'+(i+1),o.x-13,o.y-30,'#e6ddb3',15);label(c,s.diodes[i]?'A ▷| K':'K |◁ A',o.x-32,o.y+5,'#efcfa4',13);}
 // A live full-wave bridge; both alternating half cycles must preserve P+/N−.
 const bx=X+1120,by=-160,nodes={L:[bx+15,by+110],P:[bx+135,by+20],R:[bx+255,by+110],N:[bx+135,by+200]};
 rect(c,bx-12,by-20,300,260,'#081e2c');label(c,'整流：出力 P＋ / N−',bx,by-2,'#e6e5b5',16);
 bridge.edges.forEach(([a,b],i)=>{const u=nodes[a],v=nodes[b],mx=(u[0]+v[0])/2,my=(u[1]+v[1])/2,ang=Math.atan2(v[1]-u[1],v[0]-u[0]);const h=bridge.halves[bridge.phase],col=s.source==='dc'&&(i===1||i===2)?'#35434d':(a===h.plus||b===h.minus)?'#ffd173':'#6a8b94';line(c,[u,v],col,3);c.save();c.translate(mx,my);c.rotate(ang);c.fillStyle=col;c.beginPath();c.moveTo(-8,-7);c.lineTo(7,0);c.lineTo(-8,7);c.fill();rect(c,8,-9,3,18,col);c.restore();label(c,'D'+(i+1),mx+8,my-10,'#d9e4d4',12);});
 for(const [n,[x,y]] of Object.entries(nodes)){rect(c,x-7,y-7,14,14,'#a2d5c0');label(c,n+(n==='P'?'+':n==='N'?'−':n===bridge.halves[bridge.phase].plus?'+':'−'),x-12,y-13,'#e2eee0',14);}
 label(c,'L＋ '+(bridge.halves[0].pass?'✓':'×')+'   R＋ '+(s.source==='dc'?'OFF':bridge.halves[1].pass?'✓':'×'),bx+40,by+228,bridge.ready?green:'#ffc28b',17);
 for(const e of s.guards){if(!e.alive)continue;rect(c,e.x,e.y,30,27,'#603b67');rect(c,e.x+4,e.y+4,22,8,e.warning?'#ffe59a':'#e878b8');for(let k=0;k<3;k++){rect(c,e.x-5,e.y+5+k*8,5,3,'#9aafa8');rect(c,e.x+30,e.y+5+k*8,5,3,'#9aafa8');}if(e.warning)label(c,'!',e.x+12,e.y-10,'#ffc986',19);}
 for(const [x,w] of [[440,170],[1300,1100]]){for(let i=0;i<w;i+=35)line(c,[[X+x+i,715],[X+x+i+12,728],[X+x+i+24,715]],'#dba273',2);}
 if(s.dash>0&&!reduced){for(let i=0;i<s.trail.length;i+=2){const q=s.trail[i];line(c,[[q.x-55,q.y],[q.x-10,q.y]],'#d69af0',3);}}
 const status=filterStatus(s.signal,s.parts);rect(c,X+950,390,310,145,'#0b2532');
 label(c,'FILTER LIFT',X+960,412,'#e7e8bf',18);
 label(c,'R '+(status.r?'✓':'×')+'   C '+(status.c?'✓':'×'),X+960,437,green,16);
 label(c,'OUT '+s.signal.output.toFixed(1)+'V / 3.8–5.2V',X+960,460,'#e2e4c4',15);
 label(c,'RIPPLE '+s.signal.ripple.toFixed(2)+'V / <0.3V',X+960,483,'#e2e4c4',15);
 label(c,status.reason,X+960,513,status.ready?green:'#ffc28b',16);
 for(const e of s.parts.filter(e=>e.state==='locked')){for(let i=0;i<3;i++){const u=(t*1.2+i/3)%1;rect(c,e.padX+u*90,e.padY-5,9,5,green);}rect(c,e.padX-e.w/2-8,e.padY-8,8,8,green);rect(c,e.padX+e.w/2,e.padY-8,8,8,green);}
 for(const [x,y] of [[440,650],[610,650],[1300,650],[1780,150]]){for(let i=0;i<4;i++)line(c,[[X+x-25+i*8,y-6],[X+x-21+i*8,y]],'#ffd28b',4);}
 label(c,'24V  LOAD',X+1580,20,powered?green:dim,13);
 label(c,'PULSE',X+1480,65,s.transistor?green:'#8a9b9e',13);
 // Show the entire motion corridor, with non-solid arm dashed until fully lowered.
 line(c,[[X+1100,620],[X+1100,210],[X+1280,210],[X+1280,620]],'#446a76',2);
 const lift=g.level.platforms.find(a=>a.pcbRole==='circuit-lift');rect(c,lift.x,lift.y,180,5,s.signal.stable?green:'#f5b778');label(c,s.signal.stable?'RC ✓  ↑ ↓':s.parts.slice(0,2).some(e=>e.state!=='locked')?'R / C 未接続':filterStatus(s.signal,s.parts).reason,lift.x-25,lift.y-12,s.signal.stable?green:'#f5b778',16);
 c.setLineDash(s.arm<.99?[7,5]:[]);c.strokeStyle=s.arm<.99?'#eac48e88':green;c.lineWidth=6;c.strokeRect(X+1580,150-(1-s.arm)*110,200,22);c.setLineDash([]);
 for(let i=0;i<4;i++){c.strokeStyle=s.arm>=.99&&powered?'#e7a9ff':'#596581';c.lineWidth=5;c.beginPath();c.ellipse(X+1648+i*32,148-(1-s.arm)*110,12,30,0,0,Math.PI*2);c.stroke();}
 label(c,'JUMP ↑',X+1650,210,'#c9b4ee',15);
 for(let i=0;i<8;i++){const y=90-i*35;line(c,[[X+1710+i*29,y+9],[X+1718+i*29,y],[X+1726+i*29,y+9]],s.launched?'#cc9cf1':'#55627d',2);}
 label(c,s.complete?'✓ CIRCUIT VERIFIED':'RELAY EXIT',X+4360,-530,s.complete?green:'#dce9cd',17);
 const yard=relayYard(s);
 for(const [a,b,on] of [[[19450,-190],[19550,-190],yard.power],[[19750,-330],[20000,-470],yard.store],[[20170,-470],[20290,-470],yard.switch]]){line(c,[a,[b[0],a[1]],b],on?green:dim,5);if(on){const u=(t*.7)%1;rect(c,a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u-4,9,9,green);}}
 rect(c,19230,-430,290,130,'#0b2532');label(c,'RELAY YARD',19245,-405,'#e9d7a3',20);
 label(c,'R → 搬送 '+(yard.power?'✓':'×'),19245,-378,green,16);label(c,'C → 上層 '+(yard.store?'✓':'×'),19245,-353,green,16);label(c,'SW → 出口 '+(yard.switch?'✓':'×'),19245,-328,green,16);
 label(c,'C：搬送台に乗る部品',19520,-450,'#c4dbd6',15);label(c,'SW：Cの電源で歩く',19980,-570,'#c4dbd6',15);
 for(let i=0;i<4;i++){c.strokeStyle=s.forward&&s.signal.stable?'#edabff':'#6d697b';c.lineWidth=5;c.beginPath();c.ellipse(18270+i*25,-192,10,27,0,0,7);c.stroke();}label(c,'JUMP → 860',18235,-245,'#e4b7ff',18);
 line(c,[[18370,-190],[18410,-230],[18450,-230]],'#d4a9ee',3);label(c,'奈落',18700,20,'#e4b89a',18);
 const shutter=g.level.platforms.find(a=>a.pcbRole==='circuit-shutter');if(!yard.ready){rect(c,shutter.x,shutter.y,shutter.w,shutter.h,'#744e64');for(let y=shutter.y;y<shutter.y+shutter.h;y+=22)line(c,[[shutter.x,y],[shutter.x+40,y+15]],'#dfa5a0',3);}else label(c,'OPEN ✓',20230,-520,green,20);
 for(const d of g.level.doors.filter(d=>d.room==='S')){rect(c,d.x-32,d.y-90,64,90,'#183342');c.strokeStyle=doorReady(g,d)?green:'#c8958b';c.lineWidth=3;c.strokeRect(d.x-32,d.y-90,64,90);label(c,d.to,d.x-5,d.y-48);}
 // Local, delayed cue; never cover the screen with an answer arrow.
 if(s.idle>18){const target=s.parts.find(e=>e.state!=='locked');const x=target?.padX??(s.signal.stable?X+1380:X+535),y=target?.padY??(s.signal.stable?120:480);c.strokeStyle='#f4deb1';c.lineWidth=2;c.beginPath();c.arc(x,y-28,45+Math.sin(t*3)*4,0,Math.PI*2);c.stroke();}
 c.restore();
}
