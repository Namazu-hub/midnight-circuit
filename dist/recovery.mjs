// Shared normal-game recovery policy. A zero balance alone does not end a run.
export const RECOVERY_COST=50;
export const FALL_RECOVERY_COST=500;
export function payRecovery(g,cause){
 const cost=cause==='fall'?FALL_RECOVERY_COST:RECOVERY_COST;
 const funds=g.research?.funds||0;
 if(funds<cost){g.gameOver=true;g.events.push({type:'gameOver',required:cost,funds});return false;}
 g.research.funds-=cost;
 g.research.recoveries=(g.research.recoveries||0)+1;
 g.events.push({type:'recoveryPaid',cost,funds:g.research.funds});
 return true;
}
