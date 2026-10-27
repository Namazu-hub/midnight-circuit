import {createGame,updateGame} from '../dist/engine.mjs';
export function traversePrinter(){
 const g=createGame(3),s=g.printer;
 const step=(input={})=>{updateGame(g,input,1/120);g.events=[];if(g.gameOver)throw Error('printer game over');};
 const wait=n=>{for(let f=0;f<n*120;f++)step();};
 function go(x,y,{pulse=true}={}){for(let f=0;f<2400;f++){if(g.finished)return;const p=g.player,dy=y-p.y-40;let dx=x-p.x-14;if(p.onGround&&dy>40){const a=g.level.platforms[p.standing];dx=(x<a.x+a.w/2?a.x-30:a.x+a.w+30)-p.x-14;}if(Math.abs(x-p.x-14)<14&&Math.abs(dy)<(g.level.platforms[p.standing]?.arenaBed?32:4)&&p.onGround)return;step({left:dx<-6,right:dx>6,jump:p.onGround&&(dy<-35||Math.abs(dx)>100&&p.standing!==null&&g.level.platforms[p.standing].x+g.level.platforms[p.standing].w-p.x<90)||p.jumps===1&&p.vy>-60&&(dy<-20||Math.abs(dx)>100),pulse:pulse&&g.cooldown<=0});}throw Error(`stuck target ${x},${y} at ${g.player.x},${g.player.y} HP${g.player.hp}`);}
 const use=()=>step({interact:true});
 go(430,400);go(950,510);use();
 go(1370,400);go(1570,290);go(1790,180);use();go(1880,510);use();
 go(2210,460);go(2500,510);go(2700,400);use();go(2890,290);go(3100,180);use();wait(3.1);use();wait(3.1);
 go(3530,430);go(3710,350);go(4050,400);go(4280,290);use();go(4480,180);use();go(4790,370);use();
 go(5230,510);go(5360,510);use();wait(9.1);
 const b=s.boss;
 for(let f=0;f<120*100&&b.phase<3;f++){
 const p=g.player,dx=b.x-p.x-14;step({right:dx>100,left:dx<-100,jump:p.onGround&&b.warning?.includes("尻尾"),pulse:g.cooldown<=0&&Math.hypot(dx,g.player.y+20-400)<235});
 }
 if(b.phase!==3)throw Error(`boss not phase3 hp${b.hp} life${g.lives} age${b.age} active${b.active} pos${g.player.x},${g.player.y} deaths${g.deaths} relays${g.level.relays.map(r=>r.on)} gear${s.gear} fans${s.fans} parts${g.level.printerParts.map(p=>p.state)}`);
 go(5590,400);go(5760,290);go(5610,180);use();
 go(6000,510);for(let i=0;i<1200&&!b.centerLatch;i++)step({pulse:g.cooldown<=0});go(5590,400);go(5760,290);use();
 if(!b.route)throw Error(`frame not started ${b.x}`);
 wait(6.1);go(6270,400);go(6450,290);go(6290,180);use();go(6450,290);use();go(6810,510);
 return {g,maxY:-100};
}
if(process.argv[1]?.endsWith('/printer-route.mjs')){const {g}=traversePrinter();console.log({finish:g.finished,hp:g.player.hp,lives:g.lives,time:g.time,repairs:g.level.relays.map(r=>r.on)});}
