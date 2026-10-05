import {icon,esc,money,photoUrl,card,matches} from './core.mjs';
const {site,properties,record}=JSON.parse(document.getElementById('site-data').textContent);
const $=(selector)=>document.querySelector(selector);
const $$=(selector)=>[...document.querySelectorAll(selector)];
let toastTimer;
function toast(message){const node=$('#toast');node.textContent=message;node.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.hidden=true,3500);}
$('.menu-btn')?.addEventListener('click',()=>{const open=$('.navlinks').classList.toggle('visible');$('.menu-btn').setAttribute('aria-expanded',String(open));$('.menu-btn').setAttribute('aria-label',open?'Fechar menu':'Abrir menu');});
const contactDialog=$('#contactDialog');
function prepareContact(message){
 if(site.whatsapp){const url=`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;window.open(url,'_blank','noopener,noreferrer');toast('Confira e envie sua mensagem no WhatsApp.');return;}
 $('#preparedMessage').value=message;contactDialog.showModal();
}
$$('[data-contact]').forEach(button=>button.addEventListener('click',()=>prepareContact(record?`Olá! Tenho interesse no imóvel ${record.code}: ${record.title}, em ${record.neighborhood}, ${record.city}. Gostaria de mais informações.\n\n${location.origin}/imovel/${record.slug}`:'Olá! Gostaria de conversar com a equipe Vértice sobre um imóvel.')));
$$('[data-close-contact]').forEach(button=>button.addEventListener('click',()=>contactDialog.close()));
contactDialog.addEventListener('click',event=>{if(event.target===contactDialog){const r=contactDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)contactDialog.close();}});
$('#copyMessage').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#preparedMessage').value);toast('Mensagem copiada.');}catch{$('#preparedMessage').select();toast('Selecione e copie a mensagem.');}});
const contactForm=$('#contactForm');
if(contactForm){
 const phone=contactForm.elements.phone;
 phone.addEventListener('input',()=>{phone.setCustomValidity('');let digits=phone.value.replace(/\D/g,'');if(digits.length>11&&digits.startsWith('55'))digits=digits.slice(2);digits=digits.slice(0,11);phone.value=digits.length<3?digits:digits.length<7?`(${digits.slice(0,2)}) ${digits.slice(2)}`:`(${digits.slice(0,2)}) ${digits.slice(2,digits.length===11?7:6)}-${digits.slice(digits.length===11?7:6)}`;});
 contactForm.addEventListener('submit',event=>{event.preventDefault();const digits=phone.value.replace(/\D/g,'');if(digits.length<10||digits.length>11){phone.setCustomValidity('Informe um telefone com DDD e 10 ou 11 números.');phone.reportValidity();return;}phone.setCustomValidity('');const d=new FormData(contactForm);const message=`Olá, equipe Vértice!\n\nImóvel: ${record.code} — ${record.title}\nLocalização: ${record.neighborhood}, ${record.city}\n\nNome: ${String(d.get('name')).trim()}\nWhatsApp: ${d.get('phone')}${d.get('email')?'\nE-mail: '+d.get('email'):''}\n\n${String(d.get('message')).trim()}\n\n${location.origin}/imovel/${record.slug}`;prepareContact(message);});
}
if(record&&$('#lightbox')){
 const box=$('#lightbox');let current=0;
 function renderPhoto(){const p=record.gallery[current];const image=$('#lightboxImage');image.src=photoUrl(p,1800);image.alt=`Fotografia ilustrativa ${current+1}: ${p.alt}`;$('#photoIndex').textContent=`${current+1} de ${record.gallery.length}`;$('#photoCredit').textContent=`Foto: ${p.credit} · Unsplash · Imagem ilustrativa`;}
 $$('[data-gallery]').forEach(button=>button.addEventListener('click',()=>{current=Number(button.dataset.gallery);renderPhoto();box.showModal();}));
 const next=(delta)=>{current=(current+delta+record.gallery.length)%record.gallery.length;renderPhoto();};
 $('#prevPhoto').addEventListener('click',()=>next(-1));$('#nextPhoto').addEventListener('click',()=>next(1));$('#closeGallery').addEventListener('click',()=>box.close());
 box.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();next(1);}if(event.key==='ArrowLeft'){event.preventDefault();next(-1);}});
 box.addEventListener('click',event=>{if(event.target===box){const r=box.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)box.close();}});
}
const filterForm=$('#filterForm');
if(filterForm){
 const dialog=$('#filterDialog'),quick=$('#quickForm'),media=matchMedia('(max-width: 900px)');
 const allowed=['mode','city','neighborhood','type','priceMin','priceMax','areaMin','areaMax','bedrooms','suites','bathrooms','parking','code'];
 let page=1,debounce;
 function responsiveFilters(){if(dialog.open)dialog.close();if(!media.matches)dialog.show();}
 responsiveFilters();media.addEventListener('change',responsiveFilters);
 $('#openFilters').addEventListener('click',()=>{if(!dialog.open)dialog.showModal();});
 $('#closeFilters').addEventListener('click',()=>dialog.close());
 $('#applyFilters').addEventListener('click',()=>{dialog.close();$('#catalogo').scrollIntoView({behavior:'smooth'});});
 function setField(key,value){const control=filterForm.elements.namedItem(key);if(control&&typeof control.value!=='undefined')control.value=value;}
 function state(){const form=new FormData(filterForm),f={};for(const k of allowed)f[k]=String(form.get(k)||'').trim();f.features=form.getAll('features');return f;}
 function refreshNeighborhoods(selected=''){const city=filterForm.elements.city.value;const h=[...new Set(properties.filter(x=>!city||x.city===city).map(x=>x.neighborhood))].sort();filterForm.elements.neighborhood.innerHTML='<option value="">Todos os bairros</option>'+h.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');if(h.includes(selected))filterForm.elements.neighborhood.value=selected;}
 function syncControls(){const f=state();$$('[data-chips]').forEach(group=>group.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.value===f[group.dataset.chips]))));$$('[data-mode]').forEach(button=>button.setAttribute('aria-selected',String(button.dataset.mode===f.mode)));for(const k of ['city','type','bedrooms'])quick.elements[k].value=f[k];const limits=f.mode==='aluguel'?[2500,4000,6000,8000,12000]:[500000,1000000,1500000,2500000,4000000];$('#quickPrice').innerHTML='<option value="">Sem limite</option>'+limits.map(n=>`<option value="${n}">${money(n)}</option>`).join('');if(f.priceMax&&!limits.includes(Number(f.priceMax)))$('#quickPrice').insertAdjacentHTML('beforeend',`<option value="${esc(f.priceMax)}">${money(Number(f.priceMax))}</option>`);quick.elements.priceMax.value=f.priceMax;}
 const labels={city:'Cidade',neighborhood:'Bairro',type:'Tipo',priceMin:'A partir de',priceMax:'Até',areaMin:'Área mínima',areaMax:'Área máxima',bedrooms:'Quartos',suites:'Suítes',bathrooms:'Banheiros',parking:'Vagas',code:'Busca'};
 function updateUrl(f){const u=new URL(location.href);u.search='';for(const key of allowed){if(f[key]&&(key!=='mode'||f.mode!=='venda'))u.searchParams.set(key,f[key]);}if(f.mode==='')u.searchParams.set('mode','todos');for(const feature of f.features)u.searchParams.append('features',feature);if($('#sort').value!=='featured')u.searchParams.set('sort',$('#sort').value);if(page>1)u.searchParams.set('page',page);history.replaceState(null,'',u);}
 function render(updateHistory=true){
  const f=state();syncControls();
  let items=properties.filter(p=>matches(p,f));
  const sort=$('#sort').value;items.sort((a,b)=>sort==='priceAsc'?a.price-b.price:sort==='priceDesc'?b.price-a.price:sort==='areaDesc'?b.area-a.area:sort==='newest'?b.created.localeCompare(a.created):Number(b.featured)-Number(a.featured));
  const pageCount=Math.ceil(items.length/9);page=Math.max(1,Math.min(page,pageCount||1));
  $('#catalogTitle').textContent=f.mode==='venda'?'Imóveis para comprar':f.mode==='aluguel'?'Imóveis para alugar':'Encontre seu próximo imóvel';
  const invalid=(f.priceMin&&f.priceMax&&Number(f.priceMin)>Number(f.priceMax))||(f.areaMin&&f.areaMax&&Number(f.areaMin)>Number(f.areaMax));
  $('#resultCount').textContent=`${items.length} ${items.length===1?'imóvel encontrado':'imóveis encontrados'}`;
  $('#propertyGrid').innerHTML=items.length?items.slice((page-1)*9,page*9).map(card).join(''):`<div class="empty">${icon('search')}<h3>${invalid?'Revise o intervalo dos filtros':'Nenhum imóvel com esses filtros'}</h3><p>${invalid?'O valor mínimo precisa ser menor ou igual ao máximo. Ajuste o intervalo de preço ou área.':'Experimente ampliar a faixa de preço, mudar o bairro ou remover uma característica.'}</p><button class="primary" data-reset>Limpar filtros</button></div>`;
  const tags=Object.entries(labels).filter(([key])=>f[key]).map(([key,label])=>{const text=key.startsWith('price')?money(Number(f[key])):key.startsWith('area')?f[key]+' m²':['bedrooms','suites','bathrooms','parking'].includes(key)?f[key]+'+':f[key];return `<button class="filter-tag" data-remove="${key}" aria-label="Remover filtro ${esc(label)}: ${esc(text)}">${esc(label)}: ${esc(text)}${icon('close')}</button>`;});
  for(const feature of f.features)tags.push(`<button class="filter-tag" data-feature-remove="${esc(feature)}" aria-label="Remover filtro ${esc(feature)}">${esc(feature)}${icon('close')}</button>`);
  $('#activeFilters').innerHTML=tags.join('');$('#filterBadge').textContent=tags.length?`(${tags.length})`:'';
  $('#pagination').innerHTML=pageCount>1?Array.from({length:pageCount},(_,i)=>`<button data-page="${i+1}" ${page===i+1?'aria-current="page"':''} aria-label="Página ${i+1}">${i+1}</button>`).join(''):'';
  if(updateHistory)updateUrl(f);
 }
 function reset(){filterForm.reset();setField('mode','venda');refreshNeighborhoods();$('#sort').value='featured';page=1;render();}
 function readUrl(){const params=new URL(location.href).searchParams;filterForm.reset();for(const k of allowed)if(params.has(k)){const v=params.get(k);setField(k,k==='mode'&&v==='todos'?'':v);}refreshNeighborhoods(params.get('neighborhood')||'');for(const control of filterForm.querySelectorAll('[name="features"]'))control.checked=params.getAll('features').includes(control.value);if([...$('#sort').options].some(o=>o.value===params.get('sort')))$('#sort').value=params.get('sort');page=Math.max(1,Number(params.get('page'))||1);render(false);}
 filterForm.addEventListener('submit',e=>e.preventDefault());
 filterForm.addEventListener('change',event=>{if(event.target.name==='city')refreshNeighborhoods();page=1;render();});
 filterForm.addEventListener('input',event=>{if(event.target.tagName==='INPUT'&&event.target.type!=='checkbox'){clearTimeout(debounce);debounce=setTimeout(()=>{page=1;render();},220);}});
 $$('[data-chips]').forEach(group=>group.addEventListener('click',event=>{const button=event.target.closest('button');if(button){setField(group.dataset.chips,button.dataset.value);page=1;render();}}));
 $$('[data-mode]').forEach(button=>button.addEventListener('click',()=>{setField('mode',button.dataset.mode);setField('priceMin','');setField('priceMax','');page=1;render();}));
 quick.addEventListener('submit',event=>{event.preventDefault();const values=new FormData(quick);for(const key of ['city','type','bedrooms','priceMax'])setField(key,values.get(key));refreshNeighborhoods();page=1;render();$('#catalogo').scrollIntoView({behavior:'smooth'});});
 $('#sort').addEventListener('change',()=>{page=1;render();});
 $('#clearFilters').addEventListener('click',reset);
 $('#propertyGrid').addEventListener('click',event=>{if(event.target.closest('[data-reset]'))reset();});
 $('#activeFilters').addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;if(button.dataset.remove){setField(button.dataset.remove,'');if(button.dataset.remove==='city')refreshNeighborhoods();}else if(button.dataset.featureRemove){for(const control of filterForm.querySelectorAll('[name="features"]'))if(control.value===button.dataset.featureRemove)control.checked=false;}page=1;render();});
 $('#pagination').addEventListener('click',event=>{const button=event.target.closest('[data-page]');if(button){page=Number(button.dataset.page);render();$('#catalogo').scrollIntoView({behavior:'smooth'});}});
 $('#exploreNeighborhoods').addEventListener('click',()=>{$('#catalogo').scrollIntoView({behavior:'smooth'});if(media.matches)dialog.showModal();filterForm.elements.neighborhood.focus({preventScroll:true});});
 window.addEventListener('popstate',readUrl);readUrl();
 // Optional browser agent interface uses exactly the same catalog state.
 if(document.modelContext?.registerTool){
  const lifecycle=new AbortController();
  try{Promise.resolve(document.modelContext.registerTool({name:'filter_properties',title:'Filtrar imóveis',description:'Atualiza os filtros visíveis do catálogo e retorna os imóveis encontrados. Não envia contatos.',inputSchema:{type:'object',properties:{city:{type:'string'},neighborhood:{type:'string'},type:{type:'string'},mode:{type:'string',enum:['venda','aluguel','todos']},priceMax:{type:'number',minimum:0},areaMin:{type:'number',minimum:0},bedrooms:{type:'integer',minimum:0},features:{type:'array',items:{type:'string'}}},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Filtros inválidos');for(const k of Object.keys(input))if(!['city','neighborhood','type','mode','priceMax','areaMin','bedrooms','features'].includes(k))throw Error('Filtro desconhecido');for(const k of ['priceMax','areaMin','bedrooms'])if(k in input&&(typeof input[k]!=='number'||!Number.isFinite(input[k])||input[k]<0))throw Error('Valor numérico inválido');for(const k of ['city','neighborhood','type','mode'])if(k in input&&typeof input[k]!=='string')throw Error('Texto inválido');if(input.mode&&!['venda','aluguel','todos'].includes(input.mode))throw Error('Finalidade inválida');if(input.features&&(!Array.isArray(input.features)||!input.features.every(x=>typeof x==='string'&&properties.some(p=>p.features.includes(x)))))throw Error('Características inválidas');for(const k of ['city','type'])if(input[k]&&!properties.some(p=>p[k]===input[k]))throw Error('Opção inválida');for(const [k,v] of Object.entries(input))if(k!=='features'&&k!=='neighborhood')setField(k,k==='mode'&&v==='todos'?'':String(v));refreshNeighborhoods(input.neighborhood||filterForm.elements.neighborhood.value);if(input.features)for(const box of filterForm.querySelectorAll('[name="features"]'))box.checked=input.features.includes(box.value);page=1;render();const result=properties.filter(p=>matches(p,state()));return {count:result.length,codes:result.map(p=>p.code)};}},{signal:lifecycle.signal})).catch(()=>{});}catch{}window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
 }
}
