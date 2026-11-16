(function(){
  const navBtn=document.querySelector('.navbtn'), mobile=document.getElementById('mobile-nav');
  if(navBtn && mobile){
    navBtn.addEventListener('click',()=>{const opened=mobile.classList.toggle('open');navBtn.setAttribute('aria-expanded',String(opened));navBtn.textContent=opened?'×':'☰'});
    mobile.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{mobile.classList.remove('open');navBtn.setAttribute('aria-expanded','false');navBtn.textContent='☰'}));
  }
  const book=document.getElementById('booking-dialog'),msg=document.getElementById('booking-message'),status=document.getElementById('dialog-status');
  if(book&&msg&&status){
    document.querySelectorAll('.book').forEach(b=>b.addEventListener('click',()=>{msg.textContent='Здравствуйте! Хочу узнать подробнее о формате: '+b.dataset.service+'. Подскажите, пожалуйста, как можно записаться?';status.textContent='';if(book.showModal)book.showModal();else book.setAttribute('open','')}));
    document.getElementById('book-close')?.addEventListener('click',()=>book.close());
    book.addEventListener('click',e=>{if(e.target===book)book.close()});
    document.getElementById('copy-message')?.addEventListener('click',async()=>{let ok=false;try{await navigator.clipboard.writeText(msg.textContent);ok=true}catch(e){}if(!ok){const t=document.createElement('textarea');t.value=msg.textContent;document.body.appendChild(t);t.select();try{ok=document.execCommand('copy')}catch(e){}t.remove()}status.textContent=ok?'Текст скопирован.':'Выделите текст сообщения и скопируйте его вручную.'});
  }
  // The Atlas has two selectable practices, never two duplicated full sections.

})();
