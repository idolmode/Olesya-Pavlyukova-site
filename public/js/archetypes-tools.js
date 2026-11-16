/* Navigation for the four visual method cards. Works as a disclosure, not a duplicate section. */
(function(){
 const cards=Array.from(document.querySelectorAll('#tools .visual-tool[data-method]'));
 const sections=Array.from(document.querySelectorAll('#tools .method-detail'));
 const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function openMethod(slug,shouldScroll){
   const target=document.getElementById('method-'+slug);
   if(!target)return;
   sections.forEach(d=>d.open=(d===target));
   cards.forEach(c=>c.setAttribute('aria-expanded',String(c.dataset.method===slug)));
   if(shouldScroll){
      if(location.hash!=='#method-'+slug)history.replaceState(null,'','#method-'+slug);
      requestAnimationFrame(()=>target.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'}));
   }
 }
 cards.forEach(card=>card.addEventListener('click',ev=>{ev.preventDefault();openMethod(card.dataset.method,true);}));
 sections.forEach(d=>d.addEventListener('toggle',()=>{
   const matching=cards.find(c=>c.dataset.method===d.id.slice(7));
   if(matching)matching.setAttribute('aria-expanded',String(d.open));
 }));
 function fromHash(){const match=location.hash.match(/^#method-(jung|genes|dreams|myth)$/);if(match)openMethod(match[1],true);}
 window.addEventListener('hashchange',fromHash);
 if(location.hash.startsWith('#method-'))requestAnimationFrame(fromHash);
})();
