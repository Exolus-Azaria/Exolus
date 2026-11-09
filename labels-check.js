
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s),pages=['home','chat','college','files','system','history','settings'];
function go(p){if(!pages.includes(p)||!$('#page-'+p))return;pages.forEach(x=>$('#page-'+x).classList.toggle('hidden',x!==p));$$('.nav').forEach(b=>{let active=b.dataset.page===p;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});window.scrollTo({top:0,behavior:'smooth'});}
$$('[data-page]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));$$('[data-goto]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.goto)));
const palettes={
blue:{accent:'#36c9ff',accent2:'#7668ff',text:'#edf6ff',muted:'#afc1d6',bg:'#06101f',panel:'rgba(7,20,40,.94)',panel2:'rgba(13,31,58,.94)',sidebar:'rgba(3,10,23,.97)',border:'rgba(82,166,255,.42)',input:'#08152a',hero1:'rgba(3,12,29,.95)',hero2:'rgba(12,34,66,.88)'},
purple:{accent:'#bd83ff',accent2:'#ff6ac6',text:'#fbf2ff',muted:'#cbb8d8',bg:'#10091e',panel:'rgba(30,16,48,.95)',panel2:'rgba(46,23,67,.94)',sidebar:'rgba(16,8,28,.98)',border:'rgba(189,131,255,.4)',input:'#1b102b',hero1:'rgba(22,10,38,.96)',hero2:'rgba(55,22,70,.9)'},
green:{accent:'#4bffad',accent2:'#20c9a6',text:'#eafff4',muted:'#b0d6c4',bg:'#061610',panel:'rgba(8,29,22,.95)',panel2:'rgba(13,45,34,.94)',sidebar:'rgba(3,17,12,.98)',border:'rgba(75,255,173,.35)',input:'#092219',hero1:'rgba(4,23,16,.96)',hero2:'rgba(10,54,39,.9)'},
red:{accent:'#ff596e',accent2:'#ff9c65',text:'#fff0f0',muted:'#dfbfc3',bg:'#19090d',panel:'rgba(39,14,20,.95)',panel2:'rgba(58,20,28,.94)',sidebar:'rgba(20,7,11,.98)',border:'rgba(255,89,110,.38)',input:'#260e14',hero1:'rgba(29,8,14,.96)',hero2:'rgba(68,20,30,.9)'},
orange:{accent:'#ffb454',accent2:'#ff6e55',text:'#fff6e9',muted:'#dfc8a9',bg:'#1b1007',panel:'rgba(43,25,11,.95)',panel2:'rgba(62,34,15,.94)',sidebar:'rgba(24,13,5,.98)',border:'rgba(255,180,84,.38)',input:'#2a190b',hero1:'rgba(32,17,6,.96)',hero2:'rgba(72,37,12,.9)'},
white:{accent:'#315fbd',accent2:'#6554bd',text:'#17243a',muted:'#52627a',bg:'#edf2fa',panel:'rgba(255,255,255,.96)',panel2:'rgba(235,241,251,.98)',sidebar:'rgba(248,250,255,.98)',border:'rgba(71,100,151,.25)',input:'#ffffff',hero1:'rgba(255,255,255,.97)',hero2:'rgba(226,235,250,.96)'}
};
function applyTheme(v){let c=palettes[v]||palettes.blue;if(v==='custom'){let accent=$('#customColor').value;c={...palettes.blue,accent,accent2:accent}};const root=document.documentElement;Object.entries(c).forEach(([k,val])=>root.style.setProperty('--'+k,val));root.dataset.theme=v;localStorage.setItem('hermes-theme',v)}
$('#theme').addEventListener('change',e=>applyTheme(e.target.value));$('#customColor').addEventListener('input',()=>{if($('#theme').value==='custom')applyTheme('custom')});
let videoEl=null,activeBgUrl=null;
function clearBg(){if(videoEl){videoEl.pause?.();videoEl.removeAttribute('src');videoEl.load?.();videoEl.remove();videoEl=null}if(activeBgUrl){URL.revokeObjectURL(activeBgUrl);activeBgUrl=null}document.documentElement.style.setProperty('--wallpaper','none');$('#wallpaper').style.backgroundImage='linear-gradient(120deg,rgba(2,8,20,.68),rgba(2,8,20,.70))';$('#wallpaper').style.backgroundColor='transparent'}
function updateBgFields(){let t=$('#bgType').value;$('#bgPhotoField').classList.toggle('hidden',t!=='photo');$('#bgVideoField').classList.toggle('hidden',t!=='video');$('#bgUrlField').classList.toggle('hidden',t!=='url');if(t!=='photo')$('#bgFile').value='';if(t!=='video')$('#videoFile').value='';if(t!=='url')$('#bgUrl').value=''}
$('#bgType').addEventListener('change',updateBgFields);
$('#clearPhoto').addEventListener('click',()=>{$('#bgFile').value='';if($('#bgType').value==='photo')clearBg()});$('#clearVideo').addEventListener('click',()=>{$('#videoFile').value='';if($('#bgType').value==='video')clearBg()});$('#clearUrl').addEventListener('click',()=>{$('#bgUrl').value='';if($('#bgType').value==='url')clearBg()});
function setShade(){let n=Number($('#shade').value)/100;document.documentElement.style.setProperty('--shade',n);$('#shadeLabel').textContent=Math.round(n*100)+'%'}$('#shade').addEventListener('input',setShade);
$('#applyBg').addEventListener('click',()=>{clearBg();let t=$('#bgType').value,f=$('#bgFile').files[0],vf=$('#videoFile').files[0],url=$('#bgUrl').value.trim();if(t==='color'){$('#wallpaper').style.backgroundImage='none';$('#wallpaper').style.backgroundColor=getComputedStyle(document.documentElement).getPropertyValue('--bg')}else if(t==='photo'&&f){activeBgUrl=URL.createObjectURL(f);document.documentElement.style.setProperty('--wallpaper',`url("${activeBgUrl}")`)}else if(t==='video'&&vf){activeBgUrl=URL.createObjectURL(vf);videoEl=document.createElement('video');videoEl.src=activeBgUrl;videoEl.autoplay=true;videoEl.loop=true;videoEl.muted=true;videoEl.playsInline=true;$('#wallpaper').appendChild(videoEl);videoEl.play().catch(()=>{})}else if(t==='url'&&url){if(!/^https?:\/\//i.test(url)){alert('URL harus memakai http:// atau https://');return}if(/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)){videoEl=document.createElement('video');videoEl.src=url;videoEl.autoplay=true;videoEl.loop=true;videoEl.muted=true;videoEl.playsInline=true;$('#wallpaper').appendChild(videoEl);videoEl.play().catch(()=>{})}else document.documentElement.style.setProperty('--wallpaper',`url("${url.replace(/["'()\\]/g,'')}")`)}else if(t==='photo'||t==='video'||t==='url'){alert('Pilih file atau masukkan URL untuk jenis background yang dipilih.');return}setShade()});
$('#resetBg').addEventListener('click',()=>{clearBg();$('#bgType').value='default';$('#bgFile').value='';$('#videoFile').value='';$('#bgUrl').value='';updateBgFields();$('#shade').value=68;setShade()});
function tick(){let tz=$('#tz').value,now=new Date();let parts=new Intl.DateTimeFormat('en-GB',{timeZone:tz,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).formatToParts(now).reduce((o,p)=>(o[p.type]=p.value,o),{});$('#timeMain').textContent=`${parts.hour}:${parts.minute}`;$('#timeSeconds').textContent=parts.second;let hour=Number(parts.hour);$('#timePeriod').textContent=hour>=4&&hour<11?'Pagi':hour>=11&&hour<15?'Siang':hour>=15&&hour<18?'Sore':'Malam';$('#date').textContent=new Intl.DateTimeFormat('id-ID',{timeZone:tz,weekday:'long',day:'2-digit',month:'long',year:'numeric'}).format(now);$('#location').textContent=$('#locLabel').value;$('#zoneBadge').textContent=(tz==='Asia/Pontianak'||tz==='Asia/Jakarta'?'WIB · UTC+7':tz==='Asia/Makassar'?'WITA · UTC+8':'WIT · UTC+9')}
setInterval(tick,1000);$('#saveLocation').addEventListener('click',()=>{localStorage.setItem('hermes-tz',$('#tz').value);localStorage.setItem('hermes-loc',$('#locLabel').value);tick()});
function addFileList(input,output){$(input).addEventListener('change',e=>{let el=$(output);el.innerHTML='';[...e.target.files].forEach(f=>{let d=document.createElement('div');d.className='file-item';d.textContent=f.name+' · '+(f.size/1024/1024).toFixed(2)+' MB';el.appendChild(d)})})}addFileList('#collegeFiles','#collegeFileList');addFileList('#generalFiles','#generalFileList');
let history=JSON.parse(localStorage.getItem('hermes-demo-history')||'[]');history.slice(-30).forEach(m=>{if(m&&typeof m.text==='string')addBubble(m.role==='Minnie'?'MINNIE':'KAMU',m.text,m.role==='Minnie'?'':'user')});function renderHistory(){let el=$('#historyList');el.innerHTML='';if(!history.length){el.innerHTML='<div class="file-item">Belum ada pesan tersimpan.</div>';return}history.slice().reverse().forEach(m=>{let d=document.createElement('div');d.className='file-item';d.textContent=m.role+': '+m.text;el.appendChild(d)})}
function getUiToken(){let t=localStorage.getItem('hermes-ui-token');if(!t){t=prompt('Masukkan token backend Hermes UI (lihat terminal saat server pertama dijalankan):');if(t&&t.trim()){t=t.trim();localStorage.setItem('hermes-ui-token',t)}else return ''}return t}
function addBubble(role,text,kind=''){let b=document.createElement('div');b.className='bubble'+(kind?' '+kind:'');let title=document.createElement('b');title.textContent=role;b.appendChild(title);b.appendChild(document.createElement('br'));b.appendChild(document.createTextNode(text));$('#messages').appendChild(b);$('#messages').scrollTop=$('#messages').scrollHeight;return b}
async function sendToHermes(text){text=text.trim();if(!text)return;$('#chatInput').value='';history.push({role:'Kamu',text});localStorage.setItem('hermes-demo-history',JSON.stringify(history));addBubble('KAMU',text,'user');let waiting=addBubble('MINNIE','Sedang memproses permintaan…');renderHistory();let token=getUiToken();if(!token){waiting.textContent='Token belum dimasukkan. Muat ulang halaman untuk mencoba lagi.';return}try{let r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({message:text,history:history.slice(-12)})});let data=await r.json().catch(()=>({error:'Respons backend bukan JSON.'}));if(r.status===401){localStorage.removeItem('hermes-ui-token');throw new Error('Token salah atau tidak valid. Muat ulang halaman lalu masukkan token yang benar.')}if(!r.ok)throw new Error(data.error||('HTTP '+r.status));waiting.textContent=data.reply||'(Hermes tidak mengembalikan teks.)';history.push({role:'Minnie',text:waiting.textContent});localStorage.setItem('hermes-demo-history',JSON.stringify(history));renderHistory()}catch(err){waiting.textContent='Gagal menghubungi Minnie: '+err.message;}}
$('#chatForm').addEventListener('submit',e=>{e.preventDefault();sendToHermes($('#chatInput').value)});$('#askCollege').addEventListener('click',()=>{let s=$('#subject').value.trim(),q=$('#question').value.trim();if(!q){alert('Isi pertanyaan kuliah dulu.');return}go('chat');sendToHermes('[MODE KULIAH] '+(s?'Mata kuliah: '+s+'. ':'')+q)});$('#clearHistory').addEventListener('click',()=>{history=[];localStorage.setItem('hermes-demo-history','[]');renderHistory()});

function latencyMarkup(ms){
  const n = Number(ms);
  const value = !Number.isFinite(n) || n < 0 ? '—' : n >= 1000 ? '999+' : Math.round(n);
  const level = !Number.isFinite(n) || n < 0 ? 'bad'
    : n <= 30 ? 'good'
    : n <= 50 ? 'average'
    : n <= 100 ? 'low' : 'bad';
  const labels = {good:'Good',average:'Average',low:'Low',bad:'Bad'};
  return `<span class="latency-info"><span class="latency-value latency-${level}">${value} ms</span><span class="latency-quality latency-${level}">${labels[level]}</span></span>`;
}

function setStatusPill(id,ok,label){const el=$(id);if(!el)return;el.className='status-pill '+(ok?'good':'bad');el.textContent=label}

function updateStatusCard(prefix,d){
  const ids=prefix==='home'
    ?{hermes:'#homeHermesPill',router:'#homeRouterPill',model:'#homeModelPill',backend:'#homeBackendPill'}
    :{hermes:'#hermesPill',router:'#routerPill',model:'#modelPill',backend:'#backendPill'};
  const detail=prefix==='home'
    ?{hermes:'#homeHermesDetail',router:'#homeRouterDetail',model:'#homeModelDetail',backend:'#homeBackendDetail'}
    :{hermes:'#hermesDetail',router:'#routerDetail',model:'#modelDetail',backend:'#backendDetail'};

  const slowLimitMs=1500;
  const hermesSlow=!!d.hermes && Number(d.hermesLatencyMs)>slowLimitMs;
  const routerSlow=!!d.router && Number(d.routerLatencyMs)>slowLimitMs;
  const backendSlow=!!d.backend && Number(d.backendLatencyMs)>slowLimitMs;

  function applyStatus(id,available,slow,normalLabel){
    const el=$(id);
    if(!el)return;
    el.className='status-pill '+(!available?'bad':slow?'wait':'good');
    el.textContent=!available?'Disconnected':slow?'High Latency':normalLabel;
  }

  applyStatus(ids.hermes,!!d.hermes,hermesSlow,'Connected');
  applyStatus(ids.router,!!d.router,routerSlow,'Connected');
  applyStatus(ids.model,!!d.modelReady,false,'Running');
  applyStatus(ids.backend,!!d.backend,backendSlow,'Running');

  const mini=(symbol,text)=>`<span class="status-mini"><span class="mini-symbol">${symbol}</span>${text}</span>`;
  const latency=(ms)=>latencyMarkup(ms);

  $(detail.hermes).innerHTML=d.hermes
    ? mini('◉','Pemeriksaan Hermes berhasil')+latency(d.hermesLatencyMs)
    : mini('◉',d.hermesDetail||'Hermes tidak tersedia.');

  $(detail.router).innerHTML=d.router
    ? mini('◈',`API aktif · ${Number(d.modelCount)||0} model terdeteksi · API merespons`)+latency(d.routerLatencyMs)
    : mini('◈',d.routerDetail||'API tidak merespons.');

  $(detail.model).innerHTML=d.modelReady
    ? mini('✧',d.configuredModel||'Model terkonfigurasi')
    : mini('✧','Model AI tidak tersedia.');

  $(detail.backend).innerHTML=d.backend
    ? mini('▣','Server dan API Exolus aktif')+latency(d.backendLatencyMs)
    : mini('▣','Backend tidak dapat dijangkau.');
}

async function refreshBackendStatus(){const btn=$('#refreshStatus');if(btn){btn.disabled=true;btn.textContent='Memeriksa…'}$('#lastChecked').textContent='Sedang memeriksa seluruh komponen…';['#hermesPill','#routerPill','#modelPill','#backendPill','#homeHermesPill','#homeRouterPill','#homeModelPill','#homeBackendPill'].forEach(id=>{const el=$(id);if(el){el.className='status-pill wait';el.textContent='Memeriksa…'}});try{const statusRequestStarted=Date.now();const r=await fetch('/api/status',{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);const d=await r.json();d.backendLatencyMs=Date.now()-statusRequestStarted;updateStatusCard('home',d);updateStatusCard('detail',d);$('#lastChecked').textContent='Pemeriksaan terakhir: '+new Intl.DateTimeFormat('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date(d.checkedAt||Date.now()));}catch(e){const failed={hermes:false,router:false,modelReady:false,backend:false,hermesDetail:'Status tidak dapat dijangkau.',routerDetail:'Status tidak dapat dijangkau.',configuredModel:'Belum tersedia'};updateStatusCard('home',failed);updateStatusCard('detail',failed);$('#homeBackendDetail').textContent='API Exolus tidak dapat dijangkau.';$('#lastChecked').textContent='Pemeriksaan gagal: '+e.message;}finally{if(btn){btn.disabled=false;btn.textContent='⟳ Periksa ulang'}}}
$('#refreshStatus').addEventListener('click',refreshBackendStatus);refreshBackendStatus();
let savedTheme=localStorage.getItem('hermes-theme');if(savedTheme){$('#theme').value=savedTheme;applyTheme(savedTheme)}let tz=localStorage.getItem('hermes-tz');if(tz)$('#tz').value=tz;let loc=localStorage.getItem('hermes-loc');if(loc)$('#locLabel').value=loc;tick();renderHistory();setShade();updateBgFields();
