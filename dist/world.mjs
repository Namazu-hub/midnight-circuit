export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export const approach=(a,b,amount)=>a<b?Math.min(b,a+amount):Math.max(b,a-amount);
