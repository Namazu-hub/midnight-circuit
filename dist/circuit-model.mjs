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
 const good=resistor&&capacitor&&ys.length===60&&s.output>3.8&&s.output<5.2&&s.ripple<.3;
 s.stableAge=good?s.stableAge+dt:0;s.stable=s.stableAge>.5;return s;
}
export function circuitPower(s,forward){return s.stable&&forward;}
