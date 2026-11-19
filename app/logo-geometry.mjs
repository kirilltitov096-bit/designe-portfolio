/** Geometry shared by the SVG logo and its one-shot formation. */
export const logoPolygons = [
 [[128,140],[172,140],[172,384],[128,384]],
 [[166,247],[260,140],[316,140],[223,260],[320,384],[265,384],[166,278]],
 [[294,140],[480,140],[480,183],[408,183],[408,384],[362,384],[362,183],[294,183]]
];
// Retain every hard corner in the final logo; extra vertices lie on its edges.
const targets=logoPolygons.map(polygon=>{
 const extras=96-polygon.length;
 const counts=polygon.map((_,i)=>1+Math.floor(extras/polygon.length)+(i<extras%polygon.length?1:0));
 const outer=polygon.flatMap((a,i)=>Array.from({length:counts[i]},(_,j)=>{const b=polygon[(i+1)%polygon.length],t=j/counts[i];return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];}));
 const center=polygon.reduce((a,p)=>[a[0]+p[0]/polygon.length,a[1]+p[1]/polygon.length],[0,0]);
 return [...outer,...Array.from({length:96},()=>center)];
});
/** @param {number} index @param {number} spin */
function orbit(index,spin){
 const [a,b,angle]=[[242,100,-35],[215,92,39],[110,208,12]][index];const rotation=(angle+spin)*Math.PI/180;
 function point(t,inner){const x=(a-(inner?25:0))*Math.cos(t),y=(b-(inner?25:0))*Math.sin(t);return [300+x*Math.cos(rotation)-y*Math.sin(rotation),262+x*Math.sin(rotation)+y*Math.cos(rotation)];}
 return [...Array.from({length:96},(_,i)=>point(i/96*Math.PI*2,false)),...Array.from({length:96},(_,i)=>point((31-i)/96*Math.PI*2,true))];
}
/** @param {number[][]} points */
const path=points=>'M'+points.map(p=>p.map(v=>v.toFixed(3)).join(',')).join('L')+'Z';
/** @param {number} index @param {number} progress @param {number} [spin] */
export function logoPath(index,progress,spin=0){const p=Math.max(0,Math.min(1,progress));if(p===1)return path(logoPolygons[index]);const start=orbit(index,spin);const points=start.map((a,i)=>[a[0]+(targets[index][i][0]-a[0])*p,a[1]+(targets[index][i][1]-a[1])*p]);return path(points.slice(0,96))+path(points.slice(96));}
/** @param {number} elapsed */
export function formationProgress(elapsed){const t=Math.max(0,Math.min(1,(elapsed-450)/2200));return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
