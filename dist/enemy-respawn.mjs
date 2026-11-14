export const ENEMY_RESPAWN_DELAY=18;
// Remember only placed combat enemies. Puzzle weights, converted terrain,
// tool dispensers, factory jobs and bosses retain their own lifecycle.
export function setupEnemyRespawns(g){
 const candidates=[...g.level.enemies,
  ...(g.printer?.foes||[]).filter(e=>['benchy','badBenchy','cube','head'].includes(e.kind)&&e.room!=='A2'),
  ...(g.pcb?.foes||[]).filter(e=>['ball','whisker','drone'].includes(e.kind)),
  ...(g.circuit?.guards||[])];
 g.enemyStocks=candidates.map(enemy=>({enemy,initial:JSON.parse(JSON.stringify(enemy)),defeatedAt:null}));
}
export function recycleEnemies(g,view){
 if(g.fever||g.gameOver)return;
 for(const stock of g.enemyStocks||[]){
  const e=stock.enemy,s=stock.initial;
  if(e.alive){stock.defeatedAt=null;continue;}
  stock.defeatedAt??=g.time;
  if(g.time-stock.defeatedAt<ENEMY_RESPAWN_DELAY||e.converted||e.captured)continue;
  const sameRoom=!s.room||s.room===g.rooms?.active;
  const visible=sameRoom&&s.x+s.w>=g.camera-80&&s.x<=g.camera+view.w+80&&s.y+s.h>=g.cameraY-80&&s.y<=g.cameraY+view.h+80;
  if(visible||sameRoom&&Math.hypot(g.player.x-s.x,g.player.y-s.y)<300)continue;
  Object.assign(e,s,{alive:true,rewardPaid:false,paid:false,aim:null,deathTime:undefined,detached:false});
  stock.defeatedAt=null;
 }
}
