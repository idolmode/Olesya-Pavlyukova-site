(function(){
  const section=document.getElementById('atlas');
  const choiceProfile=document.getElementById('choose-profile'),choiceOracle=document.getElementById('choose-oracle');
  const workspaceProfile=document.getElementById('atlas-profile'),workspaceOracle=document.getElementById('atlas-oracle');
  const notice=document.getElementById('atlas-choose-hint');
  function select(type,scroll=true){
    const show=type==='profile'?workspaceProfile:type==='oracle'?workspaceOracle:null;
    workspaceProfile.hidden=show!==workspaceProfile;workspaceOracle.hidden=show!==workspaceOracle;
    choiceProfile.setAttribute('aria-expanded',String(show===workspaceProfile));choiceOracle.setAttribute('aria-expanded',String(show===workspaceOracle));
    notice.textContent=show?'Можно переключиться на другую практику по карточке выше.':'Выберите одну из двух практик на изображениях выше.';
    if(show&&scroll)requestAnimationFrame(()=>show.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}));
  }
  choiceProfile.addEventListener('click',()=>select('profile'));
  choiceOracle.addEventListener('click',()=>select('oracle'));
  section.querySelectorAll('.at3-close').forEach(x=>x.addEventListener('click',()=>{select(null,false);document.querySelector('.at3-choices').scrollIntoView({behavior:'smooth',block:'center'});}));
  const sphereData={life:['Дело жизни','В каких ситуациях вы чувствуете, что наиболее естественно проявляете себя?'],pearl:['Жемчужина','Когда вы замечаете ценность того, чем делитесь с другими?'],vocation:['Призвание','Какие события личного опыта помогли раскрыть ваши сильные стороны?'],culture:['Культура','В какой среде ваши способности проявляются свободнее всего?'],radiance:['Сияние','Какие занятия помогают вам чувствовать жизненность и внутреннюю устойчивость?'],evolution:['Эволюция','Какая сложность повторяется в вашей жизни и что в ней вы уже замечаете?'],iq:['IQ','Какие убеждения о себе вы готовы исследовать заново?'],sq:['SQ','Что помогает вам сохранять бережный контакт со своими чувствами?'],attraction:['Притяжение','Какие сценарии отношений вы замечаете повторяющимися?'],eq:['EQ','Как вы обычно реагируете на сильные чувства и что помогает вам их выдерживать?'],purpose:['Предназначение','Что создаёт для вас ощущение смысла в повседневности?']};
  section.querySelectorAll('.at3-sphere').forEach(node=>{
    const activate=()=>{section.querySelectorAll('.at3-sphere').forEach(n=>n.classList.remove('active'));node.classList.add('active');const pair=sphereData[node.dataset.sphere];document.getElementById('at3-sphere-name').textContent=pair[0];document.getElementById('at3-sphere-question').textContent=pair[1]};
    node.addEventListener('click',activate);node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate()}});
  });
  const coins=[...section.querySelectorAll('.at3-coin')];const lines=document.getElementById('at3-lines'),count=document.getElementById('at3-count'),progress=document.getElementById('at3-progress'),status=document.getElementById('at3-status'),finish=document.getElementById('at3-finish');
  const toss=document.getElementById('at3-toss'),reset=document.getElementById('at3-reset');
  let number=0,busy=false,version=0;const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function randomSide(){let a=new Uint32Array(1);try{crypto.getRandomValues(a);return a[0]&1}catch(e){return Math.random()<.5?0:1}}
  function restart(){version++;number=0;busy=false;count.textContent='0 / 6';progress.style.width='0%';status.textContent='Нажмите «Бросить монеты», чтобы начать.';finish.hidden=true;lines.innerHTML='<span class="at3-empty">Шесть линий появятся здесь,<br>снизу вверх</span>';toss.disabled=false;toss.textContent='Бросить монеты ↗';coins.forEach((coin,i)=>{coin.classList.remove('flipping');coin.querySelector('img').src=i===0?coin.querySelector('img').dataset.a:i===1?coin.querySelector('img').dataset.b:coin.querySelector('img').dataset.a;});}
  toss.addEventListener('click',()=>{
    if(busy||number>=6)return;busy=true;toss.disabled=true;const thisVersion=version;
    const bits=coins.map(()=>randomSide());const yin=bits.reduce((t,n)=>t+n,0)%2===0;
    coins.forEach(c=>{c.classList.remove('flipping');void c.offsetWidth;c.classList.add('flipping')});
    setTimeout(()=>{
      if(thisVersion!==version)return;
      coins.forEach((coin,i)=>{coin.classList.remove('flipping');coin.querySelector('img').src=bits[i]?coin.querySelector('img').dataset.b:coin.querySelector('img').dataset.a});
      lines.querySelector('.at3-empty')?.remove();const div=document.createElement('div');div.className='at3-hex-line '+(yin?'yin':'yang');div.setAttribute('aria-label',yin?'Прерывистая линия инь':'Цельная линия ян');div.innerHTML=yin?'<span></span><span></span>':'<span></span>';lines.appendChild(div);
      number++;count.textContent=number+' / 6';progress.style.width=(number/6*100)+'%';busy=false;
      if(number===6){status.textContent='Шесть линий готовы.';finish.hidden=false;toss.textContent='Гексаграмма готова';}
      else{status.textContent='Линия '+number+' из 6 построена.';toss.disabled=false;toss.textContent='Следующий бросок ↗';}
    },reduce?0:850);
  });reset.addEventListener('click',restart);
  const current=decodeURIComponent(location.hash.slice(1));if(current==='atlas-profile'||current==='atlas-oracle'){select(current==='atlas-profile'?'profile':'oracle',false);requestAnimationFrame(()=>document.getElementById(current)?.scrollIntoView());}
})();
