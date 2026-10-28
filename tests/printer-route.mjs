import {dragonBoxes} from '../dist/dragon.mjs';
import {createGame,updateGame} from '../dist/engine.mjs';
export function traversePrinter({record=false}={}){
 const inputs=[];
 const g=createGame(3),s=g.printer;
 const step=(input={})=>{if(record)inputs.push(input);updateGame(g,input,1/120);g.events=[];if(g.gameOver)throw Error('printer game over');};
 const wait=n=>{for(let f=0;f<n*120;f++)step();};
 function go(x,y,{pulse=true}={}){for(let f=0;f<2400;f++){if(g.finished)return;const p=g.player,dy=y-p.y-40;let dx=x-p.x-14;if(p.onGround&&dy>40){const a=g.level.platforms[p.standing];dx=(x<a.x+a.w/2?a.x-30:a.x+a.w+30)-p.x-14;}if(Math.abs(x-p.x-14)<14&&Math.abs(dy)<(g.level.platforms[p.standing]?.arenaBed?32:4)&&p.onGround)return;step({left:dx<-6,right:dx>6,jump:p.onGround&&(dy<-35||Math.abs(dx)>100&&p.standing!==null&&g.level.platforms[p.standing].x+g.level.platforms[p.standing].w-p.x<90)||p.jumps===1&&p.vy>-60&&(dy<-20||Math.abs(dx)>100),pulse:pulse&&g.cooldown<=0});}throw Error(`stuck target ${x},${y} at ${g.player.x},${g.player.y} HP${g.player.hp} room${g.rooms.active} pattern${s.pattern} built${s.patterns} safe${s.safety} parts${s.carried}`);}
 const use=()=>step({interact:true});
 const door=id=>{const d=g.level.doors.find(d=>d.id===id);go(d.x,d.y);use();wait(d.boss?1.7:1.3);if(g.rooms.active!==d.to)throw Error('door '+id+' failed in '+g.rooms.active);};
 const annex=(start,end)=>{for(const [off,y] of [[300,400],[520,290],[740,180],[1140,300],[1430,190],[1730,80],[2010,180],[2260,290]])if(start+off<end)go(start+off,y);};
 go(430,400);go(950,510);use();door('ab');
 go(1370,400);go(1490,290);door('duct');annex(9600,11800);go(11960,180);go(12050,180);door('duct-exit');go(1790,180);use();go(1880,510);use();go(2210,460);door('bc');
 go(2700,400);go(2890,290);go(3010,180);door('gallery');annex(12600,14950);go(15050,180);go(15150,180);use();door('gallery-exit');go(3100,180);use();go(3180,180);use();wait(3.1);
 go(3530,430);go(3710,350);door('cd');go(4050,400);go(4280,290);use();go(4480,180);door('tower');annex(15800,18100);go(18150,180);use();door('tower-exit');go(4790,370);use();go(5230,510);door('arena');wait(9.1);
 const b=s.boss;
 for(let f=0;f<120*100&&b.phase<2;f++){
 const p=g.player,head=dragonBoxes(b)[0],dx=head.x+head.w/2-p.x-14;step({right:dx>85,left:dx<-85,jump:p.onGround&&b.attack===1&&b.clock%4.2<1.2,pulse:g.cooldown<=0&&b.vulnerable&&Math.hypot(dx,p.y+20-head.y-head.h/2)<185});
 }
 go(5480,510);use();go(5590,400);go(5760,290);go(5610,180);use();go(5830,510);
 for(let f=0;f<120*100&&b.phase<3;f++){
 const p=g.player,head=dragonBoxes(b)[0],dx=head.x+head.w/2-p.x-14;step({right:dx>85,left:dx<-85,jump:p.onGround&&((b.attack===1&&b.clock%4.2<1.2)||(b.attack===2&&b.clock%4.2>.8&&b.clock%4.2<2.1)),pulse:g.cooldown<=0&&b.vulnerable&&Math.hypot(dx,p.y+20-head.y-head.h/2)<185});
 }
 if(b.phase!==3)throw Error(`boss not phase3 hp${b.hp} life${g.lives} age${b.age} active${b.active} pos${g.player.x},${g.player.y} deaths${g.deaths} relays${g.level.relays.map(r=>r.on)} gear${s.gear} fans${s.fans} parts${g.level.printerParts.map(p=>p.state)}`);
 go(5590,400);go(5760,290);go(5610,180);use();
 go(6000,510);for(let i=0;i<1200&&!b.centerLatch;i++)step({pulse:g.cooldown<=0});go(5590,400);go(5760,290);use();
 if(!b.route)throw Error(`frame not started ${b.x}`);
 wait(6.1);go(6270,400);go(6450,290);go(6290,180);use();go(6450,290);use();go(6810,510);
 return {g,maxY:-100,inputs};
}
if(process.argv[1]?.endsWith('/printer-route.mjs')){const {g}=traversePrinter();console.log({finish:g.finished,hp:g.player.hp,lives:g.lives,time:g.time,repairs:g.level.relays.map(r=>r.on)});}
