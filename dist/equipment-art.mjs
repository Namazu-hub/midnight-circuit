// Tool-specific hand anchors and silhouettes. Heat has independently moving hitboxes.
export function drawEquipment(c,g,reduced=false){const e=g.equipment,p=g.player;if(!e)return;const s=e.strike,w=e.weapon,id=s?.id||w?.id,air=!p.onGround;
 if(id){const u=s?Math.sin(Math.min(1,s.age/.22)*Math.PI):0;c.save();c.translate(p.x+14,p.y+(id==='scraper'?30:18)+(air?-2:Math.sin(p.walk*.03)*1.5));c.scale(p.face,1);
 c.strokeStyle='#bddcda';c.lineWidth=5;c.beginPath();c.moveTo(-3,-2);c.lineTo(10,2);c.stroke();
 if(id==='iron'){c.translate(10,1);c.rotate(-.75+u*1.65);c.fillStyle='#3b5367';c.fillRect(0,-4,21,8);c.fillStyle='#bfd0ca';c.fillRect(19,-2,18,4);c.fillStyle='#ff9871';c.fillRect(36,-2,6+(w?.uses||0)*2,4);if(s&&!reduced){c.strokeStyle='#ffc19d';c.lineWidth=3;c.beginPath();c.arc(-10,0,85,-.5,.8);c.stroke();}}
 if(id==='scraper'){c.translate(8+u*16,6-u*10);c.rotate(-u*.28);c.fillStyle='#68536a';c.fillRect(0,-4,20,8);c.fillStyle='#bdd2d2';c.beginPath();c.moveTo(19,-3);c.lineTo(57,-7);c.lineTo(63,6);c.lineTo(19,4);c.closePath();c.fill();c.fillStyle='#f1f5de';c.fillRect(52,3,11,3);if(s){c.strokeStyle='#f5d7a7';c.beginPath();c.moveTo(40,9);c.lineTo(65,9-u*25);c.stroke();}}
 if(id==='heatgun'){c.strokeStyle='#bddcda';c.beginPath();c.moveTo(-6,3);c.lineTo(15,10);c.stroke();c.fillStyle='#ba8067';c.fillRect(7,-8,29,16);c.fillStyle='#263f52';c.fillRect(12,8,7,12);c.fillStyle='#b4c8c5';c.fillRect(34,-5,13,10);for(let i=0;i<3;i++){c.fillStyle='#553d47';c.fillRect(12+i*6,-5,3,9);}}
 c.restore();}
 for(const q of e.shots||[]){if(q.life<=0)continue;c.save();c.fillStyle='#f5b17c88';c.beginPath();c.ellipse(q.x+18,q.y+13,20,14,0,0,7);c.fill();c.strokeStyle='#ffe3a9';c.lineWidth=3;for(let i=0;i<3;i++){c.beginPath();c.moveTo(q.x+(q.vx>0?0:36),q.y+5+i*8);c.lineTo(q.x+(q.vx>0?36:0),q.y+2+i*8);c.stroke();}c.restore();}
 if(e.overload>0){c.fillStyle='#ffcb94';c.font='bold 13px monospace';c.textAlign='center';c.fillText('OVERLOAD',p.x+14,p.y-65);}
}
