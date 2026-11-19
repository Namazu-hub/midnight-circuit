// Receipts live on the stage's cloned terminal or door, alongside its state.
export function feeLabel(device){
 return device.feePaid?device.purpose+' 支払済':device.purpose+' ¥'+device.fee;
}
export function payFacility(g,device){
 if(device.feePaid)return true;
 const shortfall=device.fee-g.research.funds;
 if(shortfall>0){
  g.events.push({type:'facilityNotice',text:'あと¥'+shortfall+'必要。周囲の部品敵を倒して科研費を集めよう'});
  return false;
 }
 g.research.funds-=device.fee;
 device.feePaid=true;
 g.events.push({type:'facilityNotice',text:device.purpose+' −¥'+device.fee+'（残高 ¥'+g.research.funds+'）'});
 return true;
}
