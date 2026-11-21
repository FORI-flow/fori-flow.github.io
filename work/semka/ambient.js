/* One flowing environment, shared by the page and the photo viewer. */
(() => {
 const canvas=document.querySelector('#ambient-canvas'),viewer=document.querySelector('#viewer');
 const reduce=matchMedia('(prefers-reduced-motion:reduce)');
 const palettes={
  hero:[[.024,.014,.020],[.15,.030,.045],[.31,.075,.065]],
  portrait:[[.014,.023,.021],[.045,.091,.069],[.13,.19,.12]],
  about:[[.025,.018,.014],[.115,.069,.035],[.23,.14,.071]],
  contact:[[.024,.015,.030],[.095,.037,.112],[.19,.081,.20]],
  0:[[.017,.027,.021],[.07,.10,.055],[.18,.19,.10]],
  1:[[.015,.023,.031],[.035,.09,.11],[.08,.18,.21]],
  2:[[.022,.025,.014],[.095,.09,.04],[.20,.17,.075]],
  3:[[.011,.026,.025],[.018,.105,.095],[.045,.22,.18]],
  4:[[.016,.020,.033],[.035,.063,.11],[.085,.13,.23]],
  5:[[.030,.020,.020],[.12,.058,.042],[.24,.11,.075]],
  6:[[.016,.025,.032],[.045,.09,.13],[.10,.18,.24]],
  7:[[.026,.015,.025],[.12,.032,.074],[.23,.065,.13]]
 };
 let target=palettes.hero.flat(),current=target.slice(),running=!reduce.matches&&window.portfolioMotionEnabled!==false,raf=0,last=0,time=0,sceneRaf=0,mx=.5,my=.5,px=.5,py=.5;
 const sections=[...document.querySelectorAll('main>section')];
 function choose(){
  sceneRaf=0;let key='hero',scene='hero';
  if(viewer.open){scene='viewer';key=viewer.dataset.photoIndex||document.body.dataset.galleryPhoto||'1'}
  else{
   const line=innerHeight*.52,s=sections.find(el=>{const r=el.getBoundingClientRect();return r.top<=line&&r.bottom>line});
   scene=s?.id||'footer';if(scene==='top')key='hero';else if(scene==='vision')key='portrait';else if(scene==='works')key=document.body.dataset.galleryPhoto||'1';else if(scene==='about')key='about';else if(scene==='contact'){const mood=document.querySelector('.idea.is-selected')?.dataset.mood||'0';key=['about','1','contact'][Number(mood)]}else key='contact';
  }
  target=(palettes[key]||palettes.hero).flat();document.body.dataset.ambientScene=scene;canvas.dataset.palette=String(key);canvas.dataset.scene=scene;
  document.body.style.setProperty('--ambient-fallback',`rgb(${target.slice(3,6).map(v=>Math.round(v*255)).join(',')})`);
  if(!gl)return;if(!running){current=target.slice();draw(0)}
 }
 function requestScene(){if(!sceneRaf)sceneRaf=requestAnimationFrame(choose)}
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});
 if(!gl){canvas.hidden=true;addEventListener('scroll',requestScene,{passive:true});document.addEventListener('portfolio-frame',choose);choose();return}
 const vertex=`precision mediump float;attribute vec2 aPosition;varying vec2 vUv;void main(){vUv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}`;
 const fragment=`precision mediump float;varying vec2 vUv;uniform vec2 uResolution;uniform vec2 uPointer;uniform float uTime;uniform vec3 uBase;uniform vec3 uMid;uniform vec3 uLight;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=mat2(1.6,-1.2,1.2,1.6)*p+1.7;a*=.5;}return v;}void main(){vec2 uv=vUv;vec2 p=(uv-.5)*vec2(uResolution.x/uResolution.y,1.);p+=(uPointer-.5)*.14;float t=uTime*.035;vec2 q=vec2(fbm(p*1.7+vec2(t,0.)),fbm(p*1.7+vec2(3.1,-t*.7)));float n=fbm(p*2.5+q*2.+vec2(t*.45,-t*.3));float wave=.5+.5*sin(p.x*3.2+p.y*2.5+n*7.+t);float folds=pow(wave,3.);float bloom=exp(-length(p-vec2(.15,.08))*.85);vec3 c=mix(uBase,uMid,smoothstep(.1,.85,n)*.95);c=mix(c,uLight,folds*bloom*.63);float edge=1.-smoothstep(.22,.9,length((uv-.5)*vec2(1.,.8)));c*=.65+.35*edge;c+=(hash(gl_FragCoord.xy)-.5)*.009;gl_FragColor=vec4(c,1.);}`;
 function compile(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
 let program;try{program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program))}catch(e){canvas.hidden=true;console.error('Ambient:',e.message);return}
 gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
 const uniforms={};for(const name of ['uResolution','uPointer','uTime','uBase','uMid','uLight'])uniforms[name]=gl.getUniformLocation(program,name);
 function draw(now){
  raf=0;if(gl.isContextLost())return;if(running&&last&&now-last<31){schedule();return}
  const dt=now>0&&last>0?Math.max(0,Math.min((now-last)/1000,.07)):1/30;if(now>0)last=now;if(running&&now>0)time+=dt;
  const scale=innerWidth<600?.85:.7,w=Math.round(innerWidth*scale),h=Math.round(innerHeight*scale);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}
  const ease=running?1-Math.exp(-dt*2.1):1;current=current.map((v,i)=>v+(target[i]-v)*ease);px+=(mx-px)*.035;py+=(my-py)*.035;
  gl.uniform2f(uniforms.uResolution,w,h);gl.uniform2f(uniforms.uPointer,px,py);gl.uniform1f(uniforms.uTime,time);gl.uniform3fv(uniforms.uBase,current.slice(0,3));gl.uniform3fv(uniforms.uMid,current.slice(3,6));gl.uniform3fv(uniforms.uLight,current.slice(6,9));gl.drawArrays(gl.TRIANGLES,0,6);canvas.dataset.time=time.toFixed(2);schedule();
 }
 function schedule(){if(!raf&&running&&!document.hidden&&!window.portfolioIntroActive)raf=requestAnimationFrame(draw)}
 function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0}
 addEventListener('scroll',requestScene,{passive:true});addEventListener('resize',()=>{stop();choose();draw(0)},{passive:true});addEventListener('pointermove',e=>{if(!running||e.pointerType==='touch')return;mx=e.clientX/innerWidth;my=1-e.clientY/innerHeight},{passive:true});
 document.addEventListener('portfolio-frame',choose);document.addEventListener('portfolio-motion',e=>{running=e.detail.enabled&&!reduce.matches;stop();choose();draw(0)});document.addEventListener('portfolio-intro',()=>{stop();if(!window.portfolioIntroActive){choose();draw(0)}});document.addEventListener('visibilitychange',()=>{stop();if(!document.hidden){choose();draw(0)}});
 new MutationObserver(()=>{if(viewer.open)viewer.prepend(canvas);else document.body.prepend(canvas);choose()}).observe(viewer,{attributes:true,attributeFilter:['open']});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stop();canvas.hidden=true});choose();draw(0);
})();
