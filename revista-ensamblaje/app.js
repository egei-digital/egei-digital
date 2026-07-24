
const pages = ["assets/pages/page-01.webp", "assets/pages/page-02.webp", "assets/pages/page-03.webp", "assets/pages/page-04.webp", "assets/pages/page-05.webp", "assets/pages/page-06.webp", "assets/pages/page-07.webp", "assets/pages/page-08.webp", "assets/pages/page-09.webp", "assets/pages/page-10.webp", "assets/pages/page-11.webp"];
let current = 0;
let animating = false;
const isMobile = () => matchMedia('(max-width: 760px)').matches;

const leftImg = document.getElementById('leftPage');
const rightImg = document.getElementById('rightPage');
const turnSheet = document.getElementById('turnSheet');
const turnImage = document.getElementById('turnImage');
const counter = document.getElementById('counter');
const progress = document.getElementById('progress');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

function spreadStart(index){
  if(isMobile()) return index;
  return Math.floor(index/2)*2;
}

function render(index=current){
  current = Math.max(0, Math.min(pages.length-1,index));
  if(isMobile()){
    rightImg.src = pages[current];
    rightImg.alt = `Página ${current+1}`;
  } else {
    const s = spreadStart(current);
    leftImg.src = pages[s] || '';
    rightImg.src = pages[s+1] || pages[s];
    leftImg.alt = `Página ${s+1}`;
    rightImg.alt = pages[s+1] ? `Página ${s+2}` : '';
  }
  counter.textContent = `${current+1} / ${pages.length}`;
  progress.value = current+1;
  prevBtn.disabled = current <= 0;
  nextBtn.disabled = current >= pages.length-1;
}

function go(delta){
  if(animating) return;
  const step = isMobile()?1:2;
  const base = isMobile()?current:spreadStart(current);
  const target = Math.max(0, Math.min(pages.length-1, base + delta*step));
  if(target===current || (!isMobile() && spreadStart(target)===spreadStart(current))) return;

  animating = true;
  const book = document.getElementById('book');
  const cls = delta>0 ? 'page-forward' : 'page-backward';

  const preloadTargets = isMobile()
    ? [pages[target]]
    : [pages[spreadStart(target)], pages[spreadStart(target)+1]].filter(Boolean);

  Promise.all(preloadTargets.map(src => new Promise(resolve=>{
    const img = new Image();
    img.onload = img.onerror = resolve;
    img.src = src;
  }))).then(()=>{
    book.classList.remove('page-forward','page-backward');
    void book.offsetWidth;
    book.classList.add(cls);

    setTimeout(()=>{
      current = target;
      resetZoom();
      render(current);
    }, isMobile()?95:120);

    setTimeout(()=>{
      book.classList.remove(cls);
      animating = false;
    }, isMobile()?235:295);
  });
}

prevBtn.onclick=()=>go(-1);
nextBtn.onclick=()=>go(1);
progress.oninput=e=>{ current=Number(e.target.value)-1; render(current); };
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'||e.key==='PageDown') go(1);
  if(e.key==='ArrowLeft'||e.key==='PageUp') go(-1);
});


const bookEl = document.getElementById('book');
let zoom = 1;
let panX = 0;
let panY = 0;
let touchStartX = 0;
let touchStartY = 0;
let panStartX = 0;
let panStartY = 0;
let pinchStartDistance = 0;
let pinchStartZoom = 1;
let lastTap = 0;
let moved = false;

function clamp(value,min,max){ return Math.max(min,Math.min(max,value)); }

function panLimits(){
  const rect = rightImg.getBoundingClientRect();
  return {
    x: Math.max(0,(rect.width * zoom - rect.width)/2),
    y: Math.max(0,(rect.height * zoom - rect.height)/2)
  };
}

function applyZoom(animate=true){
  zoom = clamp(zoom,1,4);
  const lim = panLimits();
  panX = clamp(panX,-lim.x,lim.x);
  panY = clamp(panY,-lim.y,lim.y);
  rightImg.classList.toggle('zoom-dragging',!animate);
  rightImg.style.transform = `translate(${panX}px,${panY}px) scale(${zoom})`;
  const reset = document.getElementById('zoomReset');
  if(reset) reset.textContent = `${Math.round(zoom*100)}%`;
}

function resetZoom(){
  zoom=1; panX=0; panY=0; applyZoom(true);
}

function setZoom(next){
  zoom=clamp(next,1,4);
  if(zoom===1){panX=0;panY=0;}
  applyZoom(true);
}

document.getElementById('zoomIn')?.addEventListener('click',()=>setZoom(zoom+.5));
document.getElementById('zoomOut')?.addEventListener('click',()=>setZoom(zoom-.5));
document.getElementById('zoomReset')?.addEventListener('click',resetZoom);

bookEl.addEventListener('touchstart',e=>{
  if(!isMobile()) return;
  moved=false;
  rightImg.classList.add('zoom-dragging');
  if(e.touches.length===2){
    const a=e.touches[0], b=e.touches[1];
    pinchStartDistance=Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY);
    pinchStartZoom=zoom;
    e.preventDefault();
    return;
  }
  const t=e.touches[0];
  touchStartX=t.clientX; touchStartY=t.clientY;
  panStartX=panX; panStartY=panY;
},{passive:false});

bookEl.addEventListener('touchmove',e=>{
  if(!isMobile()) return;
  if(e.touches.length===2){
    const a=e.touches[0], b=e.touches[1];
    const distance=Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY);
    zoom=clamp(pinchStartZoom*(distance/pinchStartDistance),1,4);
    applyZoom(false);
    moved=true;
    e.preventDefault();
    return;
  }
  if(e.touches.length===1 && zoom>1){
    const t=e.touches[0];
    panX=panStartX+(t.clientX-touchStartX);
    panY=panStartY+(t.clientY-touchStartY);
    applyZoom(false);
    moved=true;
    e.preventDefault();
  }
},{passive:false});

bookEl.addEventListener('touchend',e=>{
  if(!isMobile()) return;
  rightImg.classList.remove('zoom-dragging');
  applyZoom(true);

  if(e.touches.length>0) return;
  const changed=e.changedTouches[0];
  const dx=changed.clientX-touchStartX;
  const dy=changed.clientY-touchStartY;

  // Cambio de página solo con zoom normal
  if(zoom===1 && Math.abs(dx)>55 && Math.abs(dx)>Math.abs(dy)){
    go(dx<0?1:-1);
    return;
  }

  // Doble toque: 200% / volver a 100%
  const now=Date.now();
  if(!moved && Math.abs(dx)<12 && Math.abs(dy)<12 && now-lastTap<320){
    if(zoom>1) resetZoom();
    else {
      zoom=2.2;
      const rect=rightImg.getBoundingClientRect();
      panX=(rect.left+rect.width/2-changed.clientX)*(zoom-1);
      panY=(rect.top+rect.height/2-changed.clientY)*(zoom-1);
      applyZoom(true);
    }
    lastTap=0;
  }else{
    lastTap=now;
  }
},{passive:false});


document.getElementById('fullBtn').onclick=()=>{
  if(!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
};

document.getElementById('shareBtn').onclick=async()=>{
  const data={title:'Curso de Ensamblaje de Computadoras | EGEI Digital',text:'Conoce el contenido del Curso de Ensamblaje de Computadoras de EGEI Digital',url:location.href};
  if(navigator.share) await navigator.share(data);
  else window.open('https://wa.me/?text='+encodeURIComponent(data.text+' '+data.url),'_blank');
};

window.addEventListener('resize',()=>{resetZoom();render(current);});
pages.forEach(src=>{const im=new Image();im.src=src;});
render(0);
