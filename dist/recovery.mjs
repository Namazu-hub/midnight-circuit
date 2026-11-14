// Shared normal-game recovery policy. A zero balance alone does not end a run.
export const RECOVERY_COST=50;
export function payRecovery(g){
 const funds=g.research?.funds||0;
 if(funds<RECOVERY_COST){g.gameOver=true;g.events.push({type:'gameOver',required:RECOVERY_COST,funds});return false;}
 g.research.funds-=RECOVERY_COST;
 g.research.recoveries=(g.research.recoveries||0)+1;
 g.events.push({type:'recoveryPaid',cost:RECOVERY_COST,funds:g.research.funds});
 return true;
}
