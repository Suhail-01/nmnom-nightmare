const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let currentScreen = 'login';
let cart = 0, items = 0, doubleClickGate = new WeakMap();
let cursorX=0,cursorY=0, lagX=0, lagY=0, cursorEmoji='🍌', cursorRot=0, inverted=false;

const chaosSound = $('#chaosSound'), xpSound = $('#xpSound');
function playSound(kind='click') {
  const s = kind === 'xp' ? xpSound : chaosSound;
  if(!s || !s.src) return;
  try { s.pause(); s.currentTime = 0; s.volume = Math.min(1, Number($('#volume')?.value || .55)); s.play().catch(()=>{}); } catch(e){}
}
function show(id) {
  $$('.screen').forEach(s=>s.classList.remove('active'));
  $('#'+id).classList.add('active');
  currentScreen=id;
  document.body.classList.toggle('menuNightmare', id === 'menu');
  window.scrollTo(0,0);
}
function toast(msg) {
  const el=document.createElement('div'); el.className='toast'; el.textContent=msg; $('#toastZone').appendChild(el);
  setTimeout(()=>el.remove(),4200);
}
function sysError(msg) {
  playSound('xp');
  const el=document.createElement('div'); el.className='sysError'; el.innerHTML='<b>Windows XP-ish Food Error</b><br>'+msg; $('#errorZone').appendChild(el);
  setTimeout(()=>el.remove(),4500);
}
function fakeAd() {
  const ad=document.createElement('div'); ad.className='fake-ad';
  ad.style.left=Math.random()*70+5+'vw'; ad.style.top=Math.random()*65+10+'vh';
  ad.innerHTML='<button class="ad-close">x</button>Single burgers in YOUR AREA<br>Doctors hate this one sauce<br><u>CLICK HERE to remove ads ($49.99/month)</u>';
  ad.querySelector('button').onclick=(e)=>{ e.stopPropagation(); ad.style.left=Math.random()*80+'vw'; ad.style.top=Math.random()*75+'vh'; toast('Ad close button got scared.'); };
  $('#adZone').appendChild(ad); setTimeout(()=>ad.remove(),8000);
}
document.addEventListener('mousemove', e=>{
  let x=e.clientX, y=e.clientY;
  if(inverted) { x = innerWidth - x; y = innerHeight - y; }
  cursorX=x; cursorY=y;
});
function cursorLoop(){
  lagX += (cursorX-lagX)*0.18; lagY += (cursorY-lagY)*0.18;
  cursorRot = (cursorRot + .45) % 90;
  const c=$('#cursor');
  c.style.left=lagX+'px'; c.style.top=lagY+'px'; c.style.rotate=cursorRot+'deg'; c.textContent=cursorEmoji;
  requestAnimationFrame(cursorLoop);
} cursorLoop();
setInterval(()=>{ cursorEmoji = ['🍌','🥄','😱','🖱️'][Math.floor(Math.random()*4)]; },2500);
function cloneCursors() {
  for(let i=0;i<3;i++) {
    const cl=document.createElement('div'); cl.className='cloneCursor'; cl.textContent=['🍌','🥄','😱'][i];
    cl.style.left=(lagX+(i+1)*18)+'px'; cl.style.top=(lagY+(i+1)*14)+'px'; document.body.appendChild(cl);
    setTimeout(()=>cl.remove(),900);
  }
}
setInterval(()=>{
  if(currentScreen !== 'login') return;
  toast('Mouse calibration required.');
  inverted=true;
  document.body.classList.add('chaosMode');
  setTimeout(()=>{ inverted=false; document.body.classList.remove('chaosMode'); },2500);
},15000);

document.addEventListener('click', e=>{
  const btn=e.target.closest('button, [role="button"], input[type=button], input[type=submit], .btnish');
  if(btn) { playSound(); cloneCursors(); }
}, true);

document.addEventListener('click', e=>{
  const btn=e.target.closest('button');
  if(!btn || btn.classList.contains('ad-close')) return;
  const now=Date.now(), prev=doubleClickGate.get(btn)||0;
  if(now-prev>420) {
    doubleClickGate.set(btn,now);
    e.preventDefault(); e.stopImmediatePropagation();
    toast('Double-click required. Obviously.');
  }
}, true);

document.addEventListener('mouseover', e=>{
  if(e.target.closest('button')) {
    const buttons=$$('button').filter(b=>b!==e.target && !b.classList.contains('ad-close'));
    const victim=buttons[Math.floor(Math.random()*buttons.length)];
    if(victim) {
      victim.style.transform=`translate(${Math.random()*80-40}px, ${Math.random()*60-30}px) rotate(${Math.random()*30-15}deg)`;
      setTimeout(()=>victim.style.transform='',600);
    }
  }
});

let lastType=0, fastCount=0;
$('#name').addEventListener('input', e=>{
  e.target.value = e.target.value.replace(/John/gi,'Jhon').replace(/Alex/gi,'ALEX THE DESTROYER');
});
$('#phone').addEventListener('input', e=>{
  e.target.value = e.target.value.toUpperCase().replace(/[^IVXLCDM]/g,'');
  $('#phoneHelp').textContent = e.target.value ? 'Accepted by ancient Rome.' : 'ONLY I V X L C D M may enter.';
});
$('#password').addEventListener('input', e=>{
  const now=Date.now(); if(now-lastType<95) fastCount++; else fastCount=0; lastType=now;
  if(fastCount>8) { $('#loginBox').querySelectorAll('input').forEach(i=>{ if(i.type!=='checkbox') i.value=''; }); $('#typingWarning').textContent='Form reset because you typed with suspicious confidence.'; fastCount=0; }
  const insults=['Weak','Pathetic','Embarrassing','Your ancestors are disappointed'];
  const level=Math.min(3, Math.floor(e.target.value.length/4));
  $('#strengthText').textContent=insults[level];
  $('#strengthFill').style.width=[12,33,62,96][level]+'%';
  const rules=['must contain a Roman numeral','cannot start with a letter','must be exactly 11 characters — wait now 12','must include a condiment emoji','must apologize to the chef'];
  $('#rules').innerHTML = rules.slice(0, 2+level).map(r=>'<li>'+r+'</li>').join('');
});
$('#remember').addEventListener('change', e=>setTimeout(()=>{ e.target.checked=false; toast('Remember Me forgot itself.'); },250));

function fakeLoading(next) {
  const overlay=$('#loading'), fill=$('#loadFill'), msg=$('#loadMsg');
  overlay.classList.add('active');
  const vals=[12,87,3,54,99,99,48,101];
  const msgs=['Microwaving lettuce…','Consulting the burger oracle…','Bribing delivery goblins…','Finding your house on Google Earth…','Getting stuck at 99% for ethical reasons…'];
  let i=0;
  const int=setInterval(()=>{ fill.style.width=vals[i%vals.length]+'%'; msg.textContent=msgs[i%msgs.length]; i++; },450);
  setTimeout(()=>{ clearInterval(int); overlay.classList.remove('active'); show(next); },4600);
}
$('#loginBtn').onclick=()=>{ autoLoginStarted=true; fakeLoading('menu'); };
$('#signupBtn').onclick=()=>{ autoLoginStarted=true; toast('Sign up created a problem, not an account.'); fakeLoading('menu'); };

const foods=[
  ['Burger','🐈','₹199'],['Pizza','👞','$3.99'],['Fries','🧦','🐟🐟'],['Water','🔥','₹999'],['Napkin','💎','$18'],['Taco','🧼','🐟7']
];
function renderFoods(){
  $('#foodGrid').innerHTML=foods.map((f,i)=>`<div class="card food">
    <span class="badge">TRENDING 🔥</span><div class="pic">${f[1]}</div><h2>${f[0]}</h2>
    <p class="price" data-base="${i}">${f[2]}</p>
    <div class="qty"><button class="minus">+</button><strong class="q">10</strong><button class="plus">-</button></div>
    <button class="fakeAdd">Maybe Later</button> <button class="realAdd">Nope</button>
  </div>`).join('');
  $$('.realAdd,.fakeAdd').forEach(b=>b.onclick=()=>{ items++; cart+=Math.floor(Math.random()*240)+40; updateCart(); toast('Interesting choice…'); });
  $$('.minus,.plus').forEach(b=>b.onclick=()=>{ const q=b.parentElement.querySelector('.q'); q.textContent=Math.max(0, Number(q.textContent)-1); });
} renderFoods();
function updateCart(){ $('#cartTotal').textContent=['₹'+cart,'$'+(cart/83).toFixed(2),'🐟'+Math.ceil(cart/70)][Math.floor(Math.random()*3)]; $('#itemCount').textContent=items; }
setInterval(()=>{ if(currentScreen==='menu') { cart+=Math.floor(Math.random()*7); updateCart(); } },2500);
setInterval(()=>{ $$('.price').forEach(p=>p.textContent=['₹'+(99+Math.floor(Math.random()*900)),'$'+(Math.random()*20).toFixed(2),'🐟'+Math.ceil(Math.random()*12)][Math.floor(Math.random()*3)]); },1800);
$('#toCheckout').onclick=()=>show('checkout');

$('#address').addEventListener('input',()=>{ const places=['Atlantis','Antarctica','Gotham City','The Moon','Behind the suspicious fridge']; $('#addressHint').textContent='Detected: '+places[Math.floor(Math.random()*places.length)]; });
setInterval(()=>{ if(currentScreen==='checkout') $('#surpriseFee').textContent=['₹'+Math.floor(Math.random()*999),'$'+(Math.random()*99).toFixed(2),'🐟'+Math.ceil(Math.random()*30)][Math.floor(Math.random()*3)]; },900);
$('#clearHorse').onclick=()=>{ const c=$('#horseCanvas'); c.getContext('2d').clearRect(0,0,c.width,c.height); toast('Horse erased. The horse remembers.'); };
const canvas=$('#horseCanvas'), ctx=canvas.getContext('2d'); let drawing=false;
canvas.onmousedown=()=>drawing=true; canvas.onmouseup=()=>drawing=false; canvas.onmousemove=e=>{ if(!drawing)return; const r=canvas.getBoundingClientRect(); ctx.fillRect((e.clientX-r.left)*canvas.width/r.width,(e.clientY-r.top)*canvas.height/r.height,5,5); };
$('#cancelOrder').onclick=()=>toast('Cancel is the main action. Suspicious.');
$('#darkContinue').onclick=()=>tripleConfirm();
$('#placeOrder').onmouseenter=()=>{ $('#placeOrder').style.right=Math.random()*80+'vw'; $('#placeOrder').style.bottom=Math.random()*70+'vh'; };
$('#placeOrder').onclick=()=>tripleConfirm();

let d=0;
function tripleConfirm(){
  d=0; $('#dialogStack').classList.add('active'); updateDialog();
}
function updateDialog(){
  const titles=['Are you sure?','Are you REALLY sure?','This will use real money. Your therapist has been notified.'];
  const texts=['Yes / No was too generous.','Confirm / Think About It / Scream internally.','Fine / Cancel Everything / Become soup.'];
  $('#dialogTitle').textContent=titles[d]; $('#dialogText').textContent=texts[d];
}
$('#dialogYes').onclick=()=>{ d++; if(d<3) updateDialog(); else finishOrder(); };
$('#dialogNo').onclick=()=>{ toast('Thinking fee added.'); d++; if(d<3) updateDialog(); else finishOrder(); };
function finishOrder(){
  $('#dialogStack').classList.remove('active');

  const overlay = document.getElementById('finalVideoOverlay');
  const vid = document.getElementById('finalMemeVideo');

  overlay.classList.add('active');

  try{
    vid.currentTime = 0;
    const p = vid.play();
    if(p && p.catch){ p.catch(()=>{}); }
  }catch(e){}

  vid.onended = ()=>{
    overlay.classList.remove('active');
    show('success');
    finalSequence();
  };
}
function finalSequence(){
  for(let i=0;i<80;i++) setTimeout(()=>{ const c=document.createElement('div'); c.className='confetti'; c.textContent=['🍔','🍟','💀','🧾','🐟'][Math.floor(Math.random()*5)]; c.style.left=Math.random()*100+'vw'; document.body.appendChild(c); setTimeout(()=>c.remove(),2600); }, i*20);
  document.body.classList.add('chaosMode'); playSound('xp');
  setTimeout(()=>$('#finalCrash').classList.add('active'),1200);
  setTimeout(()=>{ $('#finalCrash').classList.remove('active'); document.body.classList.remove('chaosMode'); },3200);
}
$('#restart').onclick=()=>show('login');

$('#askBot').onclick=()=>{ const replies=['Not my problem.','Skill issue.','Have you tried hunger?','I recommend deleting the app but the app recommends you.']; $('#chatBody').innerHTML += '<br>Bot: '+replies[Math.floor(Math.random()*replies.length)]; };
$('#volume').addEventListener('input',e=>{ e.target.value=Math.min(1, Number(e.target.value)+.08); toast('Volume increased, as requested by nobody.'); });

setInterval(()=>{ if(currentScreen==='login') sysError(['Your burger has emotionally disconnected.','Cheese overflow exception.','ERROR 502: Cow unavailable.','Warning: Fries detected.'][Math.floor(Math.random()*4)]); },9000);
setInterval(()=>toast(['Your food misses you.','The fries are getting anxious.','A raccoon viewed your cart.','Kevin ordered 14 sauces.','Last time you forgot fries.','You again?'][Math.floor(Math.random()*6)]),5000);
setInterval(()=>{ if(currentScreen==='login') fakeAd(); },11000);
setInterval(()=>{ if(Math.random()<.35) { $('#blueScreen').classList.add('active'); setTimeout(()=>$('#blueScreen').classList.remove('active'),2000); } },17000);
setInterval(()=>toast('Downloading burger.exe'),19000);

let scrollTrap=false;
window.addEventListener('wheel',e=>{
  if(scrollTrap) return;
  scrollTrap=true; window.scrollBy(0,-e.deltaY*.6); setTimeout(()=>scrollTrap=false,30);
},{passive:true});

let countdownLeft = 10;
let autoLoginStarted = false;
const countNum = document.getElementById('countNum');
const countdownTimer = setInterval(()=>{
  if (currentScreen !== 'login' || autoLoginStarted) return;
  countdownLeft--;
  if (countNum) countNum.textContent = countdownLeft;
  if (countdownLeft <= 0) {
    autoLoginStarted = true;
    clearInterval(countdownTimer);
    toast('Auto sign-in triggered. The burger signed for you.');
    document.body.classList.add('chaosMode');
    sysError('10-second sign-in bug: burger.exe briefly panicked.');
    setTimeout(()=>document.body.classList.remove('chaosMode'),1600);
    fakeLoading('menu');
  }
},1000);


let wrongOrderClicks = 0;

function spawnOrderButtons(){
  const arena = document.getElementById('orderArena');
  if(!arena || arena.dataset.ready) return;

  arena.dataset.ready = "1";

  const realIndex = Math.floor(Math.random()*9);

  for(let i=0;i<9;i++){
    const btn = document.createElement('button');
    btn.className = 'fakeOrderBtn';
    btn.textContent = 'PLACE ORDER';
    btn.style.left = Math.random()*75 + '%';
    btn.style.top = Math.random()*70 + '%';

    if(i === realIndex){
      btn.classList.add('realOrderBtn');
      btn.innerHTML = 'PLACE ORDER <small style="font-size:8px">maybe</small>';

      btn.addEventListener('dblclick', ()=>{
        toast('Correct button found. Suspicious.');
        tripleConfirm();
      });

      btn.addEventListener('mouseenter', ()=>{
        btn.style.left = Math.random()*70 + '%';
        btn.style.top = Math.random()*65 + '%';
      });

    } else {

      btn.addEventListener('click', ()=>{
        wrongOrderClicks++;

        playSound('xp');

        const msgs = [
          'nice try',
          'bro is struggling',
          'the burger is laughing at you',
          'incorrect burger ritual',
          'that was definitely not it'
        ];

        toast(msgs[Math.min(msgs.length-1, wrongOrderClicks-1)]);

        fakeAd();

        if(wrongOrderClicks >= 5){
          toast('hint: maybe bottom left...');
        }

        btn.style.transform = 'rotate(' + (Math.random()*40-20) + 'deg) scale(1.1)';
        setTimeout(()=>btn.style.transform='',300);
      });

    }

    arena.appendChild(btn);
  }
}

const originalShow = show;
show = function(id){
  originalShow(id);

  if(id === 'checkout'){
    setTimeout(spawnOrderButtons, 500);
  }
}