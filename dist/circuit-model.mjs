// Reusable first-order RC node: series resistor, shunt capacitor and 100k load.
// Values are real SI units; machine thresholds and motion below are game rules.
export const RESISTORS=Object.freeze([
 {ohms:1000,label:'1 kΩ',bands:['#8c5037','#202732','#e64c51'],digits:'1 · 0 · ×100'},
 {ohms:10000,label:'10 kΩ',bands:['#8c5037','#202732','#ed9d40'],digits:'1 · 0 · ×1k'},
 {ohms:100000,label:'100 kΩ',bands:['#8c5037','#202732','#f4d75b'],digits:'1 · 0 · ×10k'}
]);
export function createCircuit(){return {time:0,input:0,output:0,ripple:4,stableAge:0,stable:false,samples:[],sampleClock:0};}
export function stepCircuit(s,{resistor=false,capacitor=false,band=0},dt){
 s.time+=dt;s.input=5+2*Math.sin(s.time*Math.PI*8);
 const r=RESISTORS[band].ohms,load=100000,gain=load/(load+r),tau=(r*load/(r+load))*100e-6;
 const target=resistor?s.input*gain:0;
 s.output=capacitor?s.output+(target-s.output)*(1-Math.exp(-dt/(resistor?tau:.2))):target;
 s.sampleClock+=dt;if(s.sampleClock>=1/60){s.sampleClock-=1/60;s.samples.push([s.input,s.output]);if(s.samples.length>60)s.samples.shift();}
 const ys=s.samples.map(v=>v[1]);s.ripple=ys.length?Math.max(...ys)-Math.min(...ys):4;
 const good=resistor&&capacitor&&ys.length===60&&s.output>FILTER_LIMITS.min&&s.output<FILTER_LIMITS.max&&s.ripple<FILTER_LIMITS.ripple;
 s.stableAge=good?s.stableAge+dt:0;s.stable=s.stableAge>.5;return s;
}
export function circuitPower(s,forward){return s.stable&&forward;}

// Four independently reversible ideal diodes in a full-wave bridge.
// Nodes: L/R alternating supply; P positive load; N return. Test both half cycles.
export const BRIDGE_EDGES=Object.freeze([['L','P'],['R','P'],['N','L'],['N','R']]);
export function bridgeState(bits,time=0,source='ac'){
 const edges=BRIDGE_EDGES.map(([a,b],i)=>bits[i]?[a,b]:[b,a]);
 const reaches=(a,b)=>{const seen=new Set([a]),q=[a];while(q.length){const n=q.shift();for(const [u,v] of edges.filter((_,i)=>source!=='dc'||i===0||i===3))if(u===n&&!seen.has(v)){seen.add(v);q.push(v);}}return seen.has(b);};
 const halves=[['L','R'],['R','L']].map(([plus,minus])=>({plus,minus,short:reaches(plus,minus),pass:reaches(plus,'P')&&reaches('N',minus)&&!reaches(plus,minus),reverse:reaches(plus,'N')&&reaches('P',minus)}));
 return {edges,halves,phase:Math.floor(time/.8)%2,ready:halves.every(h=>h.pass)};
}

// Shared readout contract: rendering and the lift use the same measured limits.
export const FILTER_LIMITS=Object.freeze({min:3.8,max:5.2,ripple:.3});
export function filterStatus(signal,parts){
 const r=parts[0]?.state==='locked',c=parts[1]?.state==='locked';
 const voltage=signal.output>FILTER_LIMITS.min&&signal.output<FILTER_LIMITS.max,noise=signal.ripple<FILTER_LIMITS.ripple;
 return {r,c,voltage,noise,ready:signal.stable,reason:!r?'R 未接続':!c?'C 未接続':!voltage?(signal.output<=FILTER_LIMITS.min?'出力電圧不足':'出力電圧過大'):!noise?'ノイズ過大':!signal.stable?'安定を測定中':'安定・昇降中'};
}

export const drivePower=(bits,time,source='ac')=>{const b=bridgeState(bits,time,source);return source==='dc'?b.halves[0].pass:b.ready;};
