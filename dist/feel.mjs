// Presentation tuning only. RULES, collision bounds and reward amounts are unchanged.
export const FEEL=Object.freeze({killStop:.05,hurtStop:.08,poseTime:.18,lead:48,deadZone:45,particles:192,reducedParticles:32});
export function feelState(g){return g.feel??={stop:0,pose:0,kind:'idle',combo:0,comboTime:0,flash:0,lead:0,pending:{}};}
export function holdFrame(g,input,dt){const f=feelState(g);if(f.stop<=0)return false;for(const k of ['jump','pulse','interact','jumpRelease','drink','weapon'])if(input[k])f.pending[k]=true;f.stop=Math.max(0,f.stop-dt);return true;}
export function finishFrame(g,before,events,dt){const f=feelState(g),p=g.player;f.pose=Math.max(0,f.pose-dt);f.flash=Math.max(0,f.flash-dt);f.comboTime=Math.max(0,f.comboTime-dt);if(!f.comboTime)f.combo=0;
 const target=Math.abs(p.vx)>60?Math.sign(p.vx)*FEEL.lead:0;f.lead+=(target-f.lead)*Math.min(1,dt*3);
 const pose=kind=>{f.kind=kind;f.pose=FEEL.poseTime;};
 for(const e of events){if(e.type==='hurt'){f.stop=Math.max(f.stop,FEEL.hurtStop);f.flash=.12;pose('hurt');}if(e.type==='stomp'||e.type==='feverKill'){f.stop=Math.max(f.stop,FEEL.killStop);f.combo++;f.comboTime=2;e.combo=f.combo;}if(e.type==='jump'||e.type==='doublejump')pose(e.type);}
 if(!before.onGround&&p.onGround&&before.vy>80){pose('land');g.events.push({type:'land',x:p.x+14,y:p.y+40});f.combo=0;}
 if(before.onGround&&Math.abs(before.vx)<25&&Math.abs(p.vx)>=25)g.events.push({type:'runStart',x:p.x+14,y:p.y+40});
}
export function poseScale(g,reduced){const f=g.feel;if(reduced||!f?.pose)return [1,1];const v=Math.sin(f.pose/FEEL.poseTime*Math.PI);return ['jump','doublejump'].includes(f.kind)?[1-.12*v,1+.17*v]:f.kind==='land'?[1+.2*v,1-.16*v]:[1,1];}
