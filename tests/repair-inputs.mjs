// Test input driver: adjusts the same controls as the DOM. It never flips on,
// reward flags, HP or coordinates. Repair latency/UX is not measured by this.
import {changePuzzle,assessPuzzle,commitRepair} from '../dist/repairs.mjs';
export function solvePuzzle(s){
 if(s.type==='wiring')s.labels.forEach((name,i)=>changePuzzle(s,'wire',s.outputs.indexOf(name),i));
 if(s.type==='gears'){for(const out of [12,24,48])for(let n=0;n<4;n++){changePuzzle(s,'output',out);changePuzzle(s,'idlers',n);if(assessPuzzle(s).rank===2)return;}}
 if(s.type==='titration')changePuzzle(s,'base',s.acidConcentration*(s.acidVolume+s.acidAdded)/s.baseConcentration-s.baseVolume);
 if(s.type==='joints')s.target.forEach((a,i)=>changePuzzle(s,'angle',a,i));
 if(s.type==='signal')for(const key of ['phase','frequency','amplitude'])changePuzzle(s,key,s.target[key]);
 if(s.type==='sensor'){s.thresholds.forEach((_,i)=>changePuzzle(s,'threshold',.5,i));if(s.difficulty>1)changePuzzle(s,'gain',1);}
 if(s.type==='logic')for(const a of ['AND','OR','XOR'])for(const b of ['AND','OR','XOR'])for(const inv of [0,1]){changePuzzle(s,'gate',a,0);changePuzzle(s,'gate',b,1);changePuzzle(s,'invert',inv);if(assessPuzzle(s).rank===2)return;}
}
export function solveSession(g){solvePuzzle(g.repairSession.puzzle);const result=commitRepair(g);if(!result.ok)throw new Error(result.detail);return result;}
