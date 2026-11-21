/* A short focus-and-dust opening, with an immediate skip control. */
(() => {
 const overlay=document.querySelector('#entry-intro'),canvas=document.querySelector('#intro-canvas'),ctx=canvas.getContext('2d');
 const skip=document.querySelector('#intro-skip'),status=document.querySelector('#intro-status'),progress=overlay.querySelector('.intro-progress i');
 const reduce=matchMedia('(prefers-reduced-motion:reduce)');
 let active=false,ready=false,raf=0,start=0,points=[],w=0,h=0,dpr=1,cleanupTimer=0;
 const clamp=x=>Math.max(0,Math.min(1,x));const ease=x=>1-Math.pow(1-clamp(x),3);
 const random=n=>{const x=Math.sin(n*91.37+13.4)*43758.5453;return x-Math.floor(x)};
 function build(){
  w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  const sample=document.createElement('canvas');sample.width=w;sample.height=h;const c=sample.getContext('2d',{willReadFrequently:true}),size=Math.min(w*.19,180);
  c.fillStyle='#fff';c.font=`italic ${size}px Georgia`;c.textAlign='center';c.textBaseline='middle';c.fillText('semka.',w/2,h/2-5);
  const data=c.getImageData(0,0,w,h).data;points=[];const step=w<600?3:4;
  for(let y=Math.max(0,Math.floor(h/2-size));y<Math.min(h,h/2+size);y+=step)for(let x=Math.max(0,Math.floor(w/2-size*2));x<Math.min(w,w/2+size*2);x+=step){
   if(data[(y*w+x)*4+3]<70)continue;const n=points.length,a=random(n)*Math.PI*2,r=.3+random(n+14)*.65;
   points.push({x,y,sx:x+Math.cos(a)*w*r,sy:y+Math.sin(a)*h*r,ex:Math.cos(a+.45)*w*(.4+random(n+22)),ey:Math.sin(a+.45)*h*(.3+random(n+47)),size:.65+random(n+7)*1.15,alpha:.45+random(n+9)*.5});
  }
 }
 function prepareImages(){
  const list=window.portfolioPhotos||[];let completed=0;ready=list.length===0;status.textContent=`Подготовка фотографий 0 / ${list.length}`;
  const done=()=>{completed++;progress.style.transform=`scaleX(${completed/Math.max(1,list.length)})`;status.textContent=`Подготовка фотографий ${completed} / ${list.length}`};
  Promise.all(list.map(p=>new Promise(resolve=>{const image=new Image();image.onload=()=>{done();resolve()};image.onerror=()=>{done();resolve()};image.src=window.portfolioImage(p.id)}))).then(()=>{ready=true;status.textContent='Всё начинается со встречи.'});
 }
 function animate(now){
  if(!active)return;if(!start)start=now;const t=clamp((now-start)/2600),gather=ease(t/.46),release=ease((t-.66)/.34);
  ctx.clearRect(0,0,w,h);
  for(const p of points){const x=p.sx+(p.x-p.sx)*gather+p.ex*release,y=p.sy+(p.y-p.sy)*gather+p.ey*release;ctx.globalAlpha=p.alpha*(.25+gather*.75)*(1-release);ctx.fillStyle='#b6997b';ctx.fillRect(x,y,p.size,p.size)}
  const solid=clamp((t-.32)*6)*(1-clamp((t-.62)*7));ctx.globalAlpha=solid*.88;ctx.font=`italic ${Math.min(w*.19,180)}px Georgia`;ctx.fillStyle='#bda38b';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('semka.',w/2,h/2-5);ctx.globalAlpha=1;
  overlay.style.setProperty('--intro-caption',String(clamp((t-.2)*4)*(1-release)));
  if(t>=1&&ready){finish(false);return}raf=requestAnimationFrame(animate);
 }
 function finish(immediate){
  if(!active)return;active=false;if(raf)cancelAnimationFrame(raf);raf=0;
  const end=()=>{overlay.hidden=true;overlay.classList.remove('is-leaving');document.body.classList.remove('intro-active');document.querySelectorAll('header,main,footer,body>.skip').forEach(el=>el.inert=false);window.portfolioIntroActive=false;document.dispatchEvent(new CustomEvent('portfolio-intro'));try{sessionStorage.setItem('semka-entry-v4','seen')}catch{}};
  if(immediate||reduce.matches)end();else{overlay.classList.add('is-leaving');cleanupTimer=setTimeout(end,700)}
 }
 function show(){
  if(active)return;clearTimeout(cleanupTimer);if(reduce.matches)return;
  active=true;ready=false;start=0;overlay.hidden=false;overlay.classList.remove('is-leaving');window.portfolioIntroActive=true;document.body.classList.add('intro-active');document.querySelectorAll('header,main,footer,body>.skip').forEach(el=>el.inert=true);try{history.replaceState(null,'',location.pathname+location.search+'#top')}catch{}window.scrollTo({top:0,behavior:'instant'});document.dispatchEvent(new CustomEvent('portfolio-intro'));build();prepareImages();skip.focus({preventScroll:true});raf=requestAnimationFrame(animate);
 }
 skip.onclick=()=>finish(false);document.addEventListener('keydown',e=>{if(active&&e.key==='Escape'){e.preventDefault();finish(true)}});document.querySelector('#replay-intro').onclick=show;addEventListener('resize',()=>{if(active)build()},{passive:true});reduce.addEventListener('change',()=>{if(reduce.matches&&active)finish(true)});
 let seen=false;try{seen=sessionStorage.getItem('semka-entry-v4')==='seen'}catch{}
 if(!new URLSearchParams(location.search).has('cover')&&!seen&&(!location.hash||location.hash==='#top'))show();
})();
