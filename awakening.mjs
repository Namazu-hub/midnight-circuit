// Original mechanical awakening sequence; no borrowed footage or music.
const box=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
function mech(c,t,awake,win,reduced){
 c.save();c.translate(600,278);const open=awake?Math.min(1,(t-1.8)*1.4):0,col=win?'#78ffd3':'#ff4562';
 c.shadowColor=col;c.shadowBlur=reduced?0:22;
 for(const side of [-1,1]){c.save();c.scale(side,1);
 box(c,20,-65,100,154,'#233044');box(c,33,-55,66,145,col);box(c,31+open*16,-64,65,42,'#f1f4ec');box(c,43+open*25,-5,53,83,'#ccd8dc');
 box(c,92+open*10,-72,59,54,'#dfe6e5');box(c,103+open*18,-4,46,91,'#9eb5c1');box(c,113+open*18,3,9,66,col);box(c,102+open*20,91,47,35,'#e6eae5');
 box(c,18,100,57,67,'#edf0e8');box(c,28,112,8,42,col);box(c,20,159,63,16,'#637f91');
 box(c,5,-137,44,58,'#d6e0e1');box(c,34+open*8,-132,18,67,'#f6f6ef');box(c,9,-101,33,8,col);
 c.fillStyle='#f6e1a5';c.beginPath();c.moveTo(3,-126);c.lineTo(12+open*45,-202);c.lineTo(19,-121);c.fill();c.restore();}
 box(c,-29,-70,58,65,'#172638');box(c,-20,-57,40,28,col);box(c,-7,-88,14,15,'#d7dfe0');box(c,-11,-120,22,19,'#293c4e');box(c,-6,-118,12,4,col);
 c.restore();
}
export function drawAwakening(c,state,t,reduced){
 const a=state.age,win=state.won,waiting=a>=5.4&&!state.pulled,awake=a>=1.8;
 const hue=reduced?145:(t*40)%360,accent=win?`hsl(${hue},95%,75%)`:awake?'#ff5974':'#b8cfe7';
 box(c,0,0,1200,600,'#060c1a');
 const g=c.createRadialGradient(600,260,20,600,260,520);g.addColorStop(0,win?'#245855':awake?'#4e1c38':'#1f334b');g.addColorStop(1,'#060c1a');c.fillStyle=g;c.fillRect(0,0,1200,600);
 if(!reduced){for(let i=0;i<30;i++){const angle=i*Math.PI/15+t*.06,rr=180+(a*100+i*71)%500;c.strokeStyle=accent+'55';c.strokeStyle=win?`hsla(${hue+i*12},85%,65%,.3)`:'#e2597035';c.lineWidth=2;c.beginPath();c.moveTo(600+Math.cos(angle)*rr,275+Math.sin(angle)*rr);c.lineTo(600+Math.cos(angle)*(rr+100),275+Math.sin(angle)*(rr+100));c.stroke();}}
 mech(c,a,awake,win,reduced);
 for(const side of [0,1]){const x=side?1040:55;box(c,x,85,105,420,'#132336');for(let i=0;i<12;i++)box(c,x+13,100+i*32,79,13,i%3===Math.floor(a*3)%3?accent:'#284357');}
 c.strokeStyle=accent;c.lineWidth=5;c.strokeRect(20,20,1160,560);c.lineWidth=1;c.strokeRect(31,31,1138,538);
 c.textAlign='center';c.fillStyle=accent;c.font='12px monospace';c.fillText('PICO : AWAKENING PROTOCOL / ORIGINAL REPAIR BONUS',600,64);
 if(a<1.8){c.font='900 48px sans-serif';c.fillStyle='#e3ecff';c.fillText('修理信号、増幅中。',600,147);}
 else if(a<3.6){c.save();c.translate(600,270);c.rotate(-.07);box(c,-600,-57,1200,116,'#280a20d9');c.fillStyle='#fff3f1';c.font='900 92px sans-serif';c.shadowColor='#ff224d';c.shadowBlur=reduced?0:30;c.fillText('覚 醒',0,34);c.restore();}
 else if(!state.pulled){c.fillStyle='#fff2e4';c.font='900 37px sans-serif';c.fillText(waiting?'可能性を、解き放て。':'REPAIR HYPER 起動',600,138);}
 if(state.pulled){
   const elapsed=a-state.pullAge;
   for(let i=0;i<3;i++){const x=430+i*170,locked=elapsed>[.25,.75,1.35][i];box(c,x-70,210,140,160,'#071b2fe8');c.strokeStyle=win?`hsl(${hue+i*70},95%,75%)`:'#fc96aa';c.lineWidth=3;c.strokeRect(x-70,210,140,160);c.fillStyle=locked?'#fff3ca':'#e2b3c4';c.font='italic 900 135px Georgia';c.shadowColor=win?'#ffba3a':'#ff335a';c.shadowBlur=reduced?0:18;c.fillText(locked?'7':String(1+Math.floor(a*20+i*3)%9),x,337);c.shadowBlur=0;}
 }
 c.fillStyle=win?'#fff1be':accent;c.font='900 32px sans-serif';c.fillText(win?'修理大成功  —  覚醒HYPER':waiting?'▼ 下のレバーを引いて最終解放 ▼':awake?'この研究室の可能性は、まだ終わらない。':'白い装甲に、灯が宿る。',600,463);
 c.fillStyle='#9ab9c7';c.font='12px monospace';c.fillText(win?'777 / ALL SYSTEMS RESTORED / THANK YOU, NIGHT SHIFT':'RED CORE → ARMOR OPEN → AWAKENING → HYPER',600,506);
 if(win&&!reduced){for(let i=0;i<55;i++){c.fillStyle=`hsl(${i*41%360},85%,72%)`;const x=(i*173)%1160+20,y=((t*90+i*43)%500)+40;c.fillRect(x,y,3,8);}}
 c.textAlign='left';
}
