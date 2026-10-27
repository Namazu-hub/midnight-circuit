// State-level fixture only. Real movement reachability is tested separately.
import {tickActionRepairs} from '../dist/action-repairs.mjs';
export function completeHand(g,r){
 for(let i=0;i<3;i++){
 const a=r.actionRepair,p=a.parts[i],n=a.nodes[i];Object.assign(g.player,{x:p.x-14,y:p.y-20});tickActionRepairs(g,{},false,0);
 Object.assign(g.player,{x:n.x-14,y:n.y-20});tickActionRepairs(g,{interact:true},false,0);
 g.time=(1+.5-i*.23)*3.2;tickActionRepairs(g,{},true,0);tickActionRepairs(g,{},false,1);
 }
}
