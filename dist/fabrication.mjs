// Costs belong to fabrication, not to RULES or the save format.
export const PRINT_COST=Object.freeze({shield:10,stairs:15,ramp:20,bridge:25,dock:30});
export function startFabrication(g,site,state){
 if(state.active||state.progress>=1)return false;
 const cost=PRINT_COST[site.kind]??15;
 if(g.research.funds<cost&&!site.required){g.events.push({type:'printDenied',x:site.x,y:site.y});return false;}
 // Non-refundable, station-bound emergency material covers only the shortfall.
 // It is never cash, cannot be sold, and cannot pay for optional purchases.
 state.assistance=Math.max(0,cost-g.research.funds);state.cost=cost;
 g.research.funds=Math.max(0,g.research.funds-cost);state.charged=true;state.active=true;
 g.events.push({type:'printCharge',cost:cost-state.assistance,assistance:state.assistance,x:site.x,y:site.y});return true;
}
