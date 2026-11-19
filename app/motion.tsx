'use client';
import { useEffect,useRef,useId,type CSSProperties,type ReactNode } from 'react';
import { logoPath,formationProgress } from './logo-geometry.mjs';

export function Reveal({children,index=0,className=''}:{children:ReactNode;index?:number;className?:string}) {
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=ref.current;
  if(!el||window.matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
  el.classList.add('reveal-ready');
  const observer=new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting)){el.classList.add('is-visible');observer.disconnect();}
  },{threshold:.08,rootMargin:'0px 0px -20px 0px'});
  observer.observe(el);
  return()=>observer.disconnect();
 },[]);
 return <div ref={ref} className={'reveal '+className} style={{'--entry-x':index%2?'90px':'-90px','--entry-r':index%2?'3deg':'-3deg'} as CSSProperties}>{children}</div>;
}

export function LogoMark({animated=false}:{animated?:boolean}){
 const id=useId().replace(/:/g,'');const root=useRef<SVGSVGElement>(null);const shapes=useRef<(SVGPathElement|null)[]>([]);
 useEffect(()=>{
  if(!animated)return;
  const svg=root.current;if(!svg)return;
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const key='kt-orbit-intro-v3';let seen=false;try{seen=sessionStorage.getItem(key)==='done';}catch{}
  if(seen||media.matches){svg.dataset.stage='logo';svg.dataset.introMode=media.matches?'reduced':'skip';return;}svg.dataset.introMode='play';
  let frame=0;let start:number|undefined;
  function finish(){cancelAnimationFrame(frame);shapes.current.forEach((p,i)=>p?.setAttribute('d',logoPath(i,1)));svg!.dataset.stage='logo';try{sessionStorage.setItem(key,'done');}catch{}}
  function tick(now:number){
   if(start===undefined)start=now;const elapsed=now-start;const progress=formationProgress(elapsed);
   const spin=Math.sin(Math.min(1,elapsed/2800)*Math.PI)*24*(1-progress);
   shapes.current.forEach((p,i)=>p?.setAttribute('d',logoPath(i,progress,spin)));
   svg!.dataset.stage=progress<.05?'orbit':progress<1?'forming':'logo';
   if(elapsed<2850)frame=requestAnimationFrame(tick);else finish();
  }
  shapes.current.forEach((p,i)=>p?.setAttribute('d',logoPath(i,0)));svg.dataset.stage='orbit';
  frame=requestAnimationFrame(tick);
  const onPreference=()=>{if(media.matches)finish();};media.addEventListener('change',onPreference);
  return()=>{cancelAnimationFrame(frame);media.removeEventListener('change',onPreference);};
 },[animated]);
 const pieces=[0,1,2];
 return <svg ref={root} className={animated?'intro-mark':'brand-monogram'} viewBox="0 0 600 524" aria-hidden="true" focusable="false" data-stage="logo" data-intro-mode={animated?'pending':'static'}>
  <defs>
   <linearGradient id={id+'metal'} x1="120" y1="120" x2="470" y2="420" gradientUnits="userSpaceOnUse">
    <stop offset="0" stopColor="#272e37"/><stop offset=".13" stopColor="#f9feff"/><stop offset=".235" stopColor="#8b9da9"/><stop offset=".265" stopColor="#fff"/><stop offset=".29" stopColor="#252c35"/><stop offset=".40" stopColor="#91a5b8"/><stop offset=".425" stopColor="#effbff"/><stop offset=".53" stopColor="#566b80"/><stop offset=".63" stopColor="#f9ffff"/><stop offset=".665" stopColor="#8e9ba8"/><stop offset=".69" stopColor="#131b24"/><stop offset=".80" stopColor="#7d8c9e"/><stop offset=".89" stopColor="#fff"/><stop offset="1" stopColor="#4e6074"/>
   </linearGradient>
   <linearGradient id={id+'rim'} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity=".95"/><stop offset=".4" stopColor="#c3d5e3" stopOpacity=".3"/><stop offset=".6" stopColor="#0e1723"/><stop offset="1" stopColor="#dcecff" stopOpacity=".8"/></linearGradient>
   {pieces.map(i=><path key={i} id={id+'piece'+i} ref={el=>{shapes.current[i]=el;}} d={logoPath(i,1)} fillRule="nonzero"/>)}
  </defs>
  <g className="logo-chroma logo-chroma-red" fill="#ff6c92" transform="translate(-1.4 .3)">{pieces.map(i=><use key={i} href={'#'+id+'piece'+i}/>)}</g>
  <g className="logo-chroma logo-chroma-cyan" fill="#7ef1ff" transform="translate(1.4 -.3)">{pieces.map(i=><use key={i} href={'#'+id+'piece'+i}/>)}</g>
  <g className="logo-metal" fill={'url(#'+id+'metal)'} stroke={'url(#'+id+'rim)'} strokeWidth=".95" strokeLinejoin="round">{pieces.map(i=><use key={i} href={'#'+id+'piece'+i}/>)}</g>
 </svg>;
}
export function VisualSignature(){
 return <div className="visual-signature signature-formation" aria-hidden="true">
  <div className="signature-halo"/>
  <div className="signature-orbit signature-orbit-a"/><div className="signature-orbit signature-orbit-b"/>
  <LogoMark animated/>
  <div className="glass-bubble bubble-a"/><div className="glass-bubble bubble-b"/>
  <div className="signature-cross"/>
  <span className="signature-caption">КТ / КИРИЛЛ ТИТОВ</span>
 </div>;
}

const refractionMap=`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="100"><defs><linearGradient id="l"><stop stop-color="rgb(20,128,128)"/><stop offset="1" stop-color="rgb(128,128,128)"/></linearGradient><linearGradient id="r"><stop stop-color="rgb(128,128,128)"/><stop offset="1" stop-color="rgb(236,128,128)"/></linearGradient><linearGradient id="t" x2="0" y2="1"><stop stop-color="rgb(128,20,128)"/><stop offset="1" stop-color="rgb(128,128,128)"/></linearGradient><linearGradient id="b" x2="0" y2="1"><stop stop-color="rgb(128,128,128)"/><stop offset="1" stop-color="rgb(128,236,128)"/></linearGradient></defs><rect width="240" height="100" fill="rgb(128,128,128)"/><rect width="24" height="100" fill="url(#l)"/><rect x="216" width="24" height="100" fill="url(#r)"/><rect width="240" height="15" fill="url(#t)"/><rect y="85" width="240" height="15" fill="url(#b)"/></svg>`;
export function GlassOptics(){
 useEffect(()=>{
  let frame=0;let active:HTMLElement|null=null;let x=50,y=30;
  const onMove=(event:PointerEvent)=>{
   const target=event.target instanceof Element?event.target.closest<HTMLElement>('.primary,.small-button,.filters button,.project-open'):null;
   if(!target)return;const box=target.getBoundingClientRect();active=target;x=(event.clientX-box.left)/box.width*100;y=(event.clientY-box.top)/box.height*100;
   if(!frame)frame=requestAnimationFrame(()=>{frame=0;active?.style.setProperty('--light-x',x+'%');active?.style.setProperty('--light-y',y+'%');});
  };
  document.addEventListener('pointermove',onMove,{passive:true});
  return()=>{document.removeEventListener('pointermove',onMove);cancelAnimationFrame(frame);};
 },[]);
 return <svg width="0" height="0" className="glass-optics" aria-hidden="true" focusable="false"><defs><filter id="liquid-refraction" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB"><feImage href={'data:image/svg+xml,'+encodeURIComponent(refractionMap)} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="edge-map"/><feGaussianBlur in="edge-map" stdDeviation="1" result="smooth-map"/><feDisplacementMap in="SourceGraphic" in2="smooth-map" scale="16" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg>;
}
