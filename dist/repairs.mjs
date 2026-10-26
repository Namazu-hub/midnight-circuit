// Pure repair models. No DOM, random input or engine imports.
export const REPAIR_NAMES={wiring:'配線接続',gears:'歯車組み合わせ',titration:'中和滴定',joints:'関節校正',signal:'信号同期',sensor:'センサ校正',logic:'論理回路修復'};
export const REPAIR_GRADES=['故障','応急修理','完全修理'];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const TAU=Math.PI*2;
export function createPuzzle(type,difficulty=1){
 const d=clamp(Math.round(difficulty)||1,1,3),s={type,difficulty:d,attempts:0,hint:false};
 if(type==='wiring'){s.labels=['電源 +','信号 S','接地 G','予備 A','予備 B'].slice(0,d+2);s.outputs=[...s.labels.slice(1),s.labels[0]];s.connections=s.labels.map(()=>-1);}
 else if(type==='gears'){s.input=24;s.output=12;s.idlers=0;s.targetRatio=[-1,.5,2][d-1];s.maxIdlers=d===3?1:2;}
 else if(type==='titration'){s.acidVolume=[20,25,30][d-1];s.acidConcentration=[.01,.02,.025][d-1];s.baseConcentration=.02;s.baseVolume=0;s.acidAdded=0;}
 else if(type==='joints'){s.target=[-45,60,-30,45].slice(0,d+1);s.angles=s.target.map(()=>0);}
 else if(type==='signal'){s.target={phase:90,frequency:d>1?1.5:1,amplitude:d>2?1.2:1};s.phase=0;s.frequency=1;s.amplitude=1;}
 else if(type==='sensor'){s.thresholds=Array(d===3?2:1).fill(.15);s.gain=1;s.samples=Array.from({length:12},(_,i)=>({target:i%2===1,values:Array.from({length:d===3?2:1},(_,j)=>i%2===1?.63+(i%3)*.07-j*.05:.15+(i%3)*.08+j*.04)}));if(d===3)s.samples=Array.from({length:12},(_,i)=>({target:i%3===2,values:i%3===2?[.68+(i%2)*.04,.72]:i%3===0?[.8,.22]:[.21,.79]}));}
 else if(type==='logic'){s.gates=['AND','AND'];s.invert=false;s.target=truthTable({gates:d===1?['XOR','AND']:['OR','AND'],invert:d===3},d);}
 else throw new Error(`Unknown repair type: ${type}`);
 return s;
}
// Ideal external spur gears: each mesh reverses, idlers do not change |ratio|.
export function gearRatio(input,output,idlers){return (idlers%2===0?-1:1)*input/output;}
// Strong monoprotic acid/base, 25°C, ideal volumes and activities. Stable quadratic
// solution of H - Kw/H = excess acid concentration (including water equilibrium).
export function titrationPH(s,baseVolume=s.baseVolume){
 const excess=(s.acidConcentration*(s.acidVolume+s.acidAdded)-s.baseConcentration*baseVolume)/(s.acidVolume+s.acidAdded+baseVolume);
 const root=Math.sqrt(excess*excess+4e-14),h=excess>=0?(excess+root)/2:2e-14/(root-excess);
 return -Math.log10(h);
}
export function jointPoints(angles){let x=0,y=0,a=0;const points=[{x,y}];for(const degrees of angles){a+=degrees*Math.PI/180;x+=Math.cos(a);y+=Math.sin(a);points.push({x,y});}return points;}
export function signalAt(s,x){return s.amplitude*Math.sin(TAU*s.frequency*x+s.phase*Math.PI/180);}
export function gate(op,a,b){if(op==='AND')return a&&b;if(op==='OR')return a||b;if(op==='XOR')return a!==b;return false;}
export function truthTable(s,difficulty){return Array.from({length:difficulty===1?4:8},(_,i)=>{const a=!!(i&1),b=!!(i&2),c=!!(i&4);let out=gate(s.gates[0],a,b);if(difficulty>1)out=gate(s.gates[1],out,c);return Number(s.invert?!out:out);});}
export function sensorResults(s){return s.samples.map(sample=>{const detected=sample.values.every((v,j)=>v*s.gain>=s.thresholds[j]);return {...sample,detected,correct:detected===sample.target};});}
export function assessPuzzle(s){
 let rank=0,detail='';
 if(s.type==='wiring'){const correct=s.connections.filter((out,i)=>s.outputs[out]===s.labels[i]).length;const required=s.labels.slice(0,3).every((label,i)=>s.outputs[s.connections[i]]===label);rank=correct===s.labels.length?2:required?1:0;detail=`一致 ${correct}/${s.labels.length}。電源・信号・接地の3本は必須。`;}
 if(s.type==='gears'){const ratio=gearRatio(s.input,s.output,s.idlers);rank=ratio===s.targetRatio? (s.idlers<=s.maxIdlers?2:1):0;detail=`出力/入力 ${ratio.toFixed(2)} 倍（${ratio>0?'同方向':'逆方向'}）`;}
 if(s.type==='titration'){const ph=titrationPH(s),error=Math.abs(ph-7);rank=error<=.15?2:error<=[2,1.5,1][s.difficulty-1]?1:0;detail=`pH ${ph.toFixed(3)} · 目標7。応急範囲 ±${[2,1.5,1][s.difficulty-1]} / 完全 ±0.15`;}
 if(s.type==='joints'){const error=Math.max(...s.angles.map((a,i)=>Math.abs(a-s.target[i])));rank=error<=2?2:error<=10?1:0;detail=`最大角度誤差 ${error.toFixed(0)}° · 応急10°以下 / 完全2°以下`;}
 if(s.type==='signal'){const error=Math.sqrt(Array.from({length:120},(_,i)=>(signalAt(s,i/60)-signalAt(s.target,i/60))**2).reduce((a,b)=>a+b,0)/120);rank=error<=.035?2:error<=.18?1:0;detail=`波形誤差 ${error.toFixed(3)} · 応急0.18以下 / 完全0.035以下`;}
 if(s.type==='sensor'){const results=sensorResults(s),errors=results.filter(v=>!v.correct).length;rank=errors===0?2:errors<=2?1:0;detail=`誤検知 ${results.filter(v=>v.detected&&!v.target).length} / 見逃し ${results.filter(v=>!v.detected&&v.target).length} · 応急は合計2以下、完全は0`;}
 if(s.type==='logic'){const values=truthTable(s,s.difficulty),correct=values.filter((v,i)=>v===s.target[i]).length;rank=correct===values.length?2:0;detail=`真理値表 ${correct}/${values.length} 一致。すべて一致で安全復旧。`;}
 return {rank,detail,label:REPAIR_GRADES[rank]};
}
export function changePuzzle(s,key,value,index=0){
 const n=Number(value);if(!Number.isFinite(n)&&key!=='gate')return false;
 if(s.type==='wiring'&&key==='wire'&&Number.isInteger(index)&&index>=0&&index<s.connections.length&&Number.isInteger(n)&&n>=-1&&n<s.outputs.length){s.connections=s.connections.map((v,i)=>i!==index&&v===n?-1:v);s.connections[index]=n;return true;}
 if(s.type==='gears'&&key==='output'&&[12,24,48].includes(n)){s.output=n;return true;}
 if(s.type==='gears'&&key==='idlers'){s.idlers=clamp(Math.round(n),0,3);return true;}
 if(s.type==='titration'&&key==='base'){s.baseVolume=Math.round(clamp(s.baseVolume+n,0,100)*1000)/1000;return true;}
 if(s.type==='titration'&&key==='acid'){s.acidAdded=Math.round(clamp(s.acidAdded+n,0,100)*1000)/1000;return true;}
 if(s.type==='joints'&&key==='angle'&&index>=0&&index<s.angles.length){s.angles[index]=clamp(Math.round(n),-120,120);return true;}
 if(s.type==='signal'&&['phase','frequency','amplitude'].includes(key)){const bounds={phase:[0,360],frequency:[.5,2],amplitude:[.5,1.5]}[key];if(key==='frequency'&&s.difficulty<2||key==='amplitude'&&s.difficulty<3)return false;s[key]=clamp(n,...bounds);return true;}
 if(s.type==='sensor'&&key==='threshold'&&index>=0&&index<s.thresholds.length){s.thresholds[index]=clamp(n,0,1.5);return true;}
 if(s.type==='sensor'&&key==='gain'&&s.difficulty>1){s.gain=clamp(n,.5,1.5);return true;}
 if(s.type==='logic'&&key==='gate'&&['AND','OR','XOR'].includes(value)&&index>=0&&index<(s.difficulty===1?1:2)){s.gates[index]=value;return true;}
 if(s.type==='logic'&&key==='invert'){s.invert=!!n;return true;}
 return false;
}
export function puzzleHint(s){
 if(s.type==='wiring')return '左右の名前が同じ端子を接続。まず電源+、信号S、接地G。予備線まで揃えると完全修理。';
 if(s.type==='gears')return `入力24歯 ÷ 出力歯数が速度の大きさ。噛み合いごとに逆回転。中間歯車が奇数なら同方向。目標の出力は${Math.round(24/Math.abs(s.targetRatio))}歯。`;
 if(s.type==='titration')return `当量体積＝酸濃度×酸体積÷塩基濃度。現在は${(s.acidConcentration*(s.acidVolume+s.acidAdded)/s.baseConcentration).toFixed(3)}mLが目安。近づいたら0.01mLずつ。入れすぎたら最初からやり直せます。`;
 if(s.type==='joints')return `点線の目標姿勢に重ねます。基準角度：${s.target.map(v=>v+'°').join(' / ')}。角度は手前の節からの相対角です。`;
 if(s.type==='signal')return `目標：位相${s.target.phase}°、周波数${s.target.frequency}Hz、振幅${s.target.amplitude}。まず山の間隔、次に高さ、最後に横ずれを合わせよう。`;
 if(s.type==='sensor')return '点線より上が検知。灰色の「物体なし」より高く、緑の「物体あり」より低く閾値を設定。複数センサは両方が検知したときON。';
 return 'AND＝両方1、OR＝どちらか1、XOR＝片方だけ1。NOTで最後の出力が反転。各行の赤い出力を目標に合わせよう。';
}
export function nearbyRepair(g,includeRepaired=false){if(!g||g.fever)return null;return g.level.relays.filter(r=>r.puzzleType&&(!r.on||includeRepaired&&(r.repairRank||0)<2)&&Math.hypot(g.player.x+14-r.x,g.player.y+20-r.y)<115).sort((a,b)=>Math.hypot(g.player.x-a.x,g.player.y-a.y)-Math.hypot(g.player.x-b.x,g.player.y-b.y))[0]||null;}
export function beginRepair(g,r=nearbyRepair(g,true)){
 if(!r||g.finished||g.gameOver||!g.level.relays.includes(r)||Math.hypot(g.player.x+14-r.x,g.player.y+20-r.y)>=115)return null;
 r.puzzle??=createPuzzle(r.puzzleType,r.difficulty);g.repairSession={id:r.id,puzzle:r.puzzle};return g.repairSession;
}
export function commitRepair(g){
 const session=g.repairSession,r=session&&g.level.relays.find(r=>r.id===session.id);if(!r)return {ok:false,detail:'修理対象がありません'};
 const result=assessPuzzle(session.puzzle);session.puzzle.attempts++;
 if(!result.rank)return {ok:false,...result};
 r.on=true;r.repairRank=Math.max(r.repairRank||0,result.rank);r.repairResult=REPAIR_GRADES[r.repairRank];r.step=3;r.amount=6;
 if(!r.healPaid){g.player.hp=Math.min(6,g.player.hp+1);r.healPaid=true;}
 g.repairSession=null;g.cooldown=.5;g.player.invul=Math.max(g.player.invul,1.5);
 g.events.push({type:'repairComplete',x:r.x,y:r.y,text:`${r.repairResult}！ ${r.effectText||'装置と足場が復旧した'}`});return {ok:true,...result};
}
