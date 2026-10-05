import fs from 'node:fs/promises';
const css=await fs.readFile('public/assets/style.css','utf8');
const core=(await fs.readFile('public/assets/core.mjs','utf8')).replace(/export /g,'');
const app=(await fs.readFile('public/assets/app.mjs','utf8')).replace(/^import[^\n]+\n/,'').replace("window.addEventListener('popstate',readUrl);readUrl();","readUrl();").replaceAll('location.origin}/imovel/${record.slug}',"window.parent.location.href}").replaceAll('new URL(location.href)','new URL(window.parent.location.href)').replaceAll("history.replaceState(null,'',u)","window.parent.history.replaceState(null,'',u)");
const icon=Buffer.from(await fs.readFile('public/assets/favicon.svg')).toString('base64');
const docs={};
const files=['index.html','privacidade.html','404.html',...(await fs.readdir('dist/imovel')).map(x=>'imovel/'+x)];
for(const file of files){let html=await fs.readFile('dist/'+file,'utf8');html=html.replace('<link rel="stylesheet" href="/assets/style.css">',`<style>${css}</style>`).replace('href="/assets/favicon.svg"',`href="data:image/svg+xml;base64,${icon}"`).replace('<script type="module" src="/assets/app.mjs"></script>',`<script type="module">${core}\n${app}\n<\/script>`);docs[file]=html;}
const json=JSON.stringify(docs).replace(/</g,'\\u003c');
function previewRouter(pages){
 function route(url,replace=false){
  const u=new URL(url,location.href),q=u.searchParams.get('imovel');
  const key=q?'imovel/'+q+'.html':u.searchParams.has('privacidade')?'privacidade.html':'index.html';
  if(replace)history.replaceState(null,'',u);else history.pushState(null,'',u);
  let html=pages[key]||pages['404.html'];
  html=html.replace(/href="\/imovel\/([^"#?]+)"/g,'href="?imovel=$1"').replace(/href="\/privacidade"/g,'href="?privacidade=1"').replace(/href="\/(\?[^" ]*)"/g,'href="$1"').replace(/href="\/#/g,'href="#').replace(/href="\/"/g,'href="?"');
  const bridge=function(){
   window.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;const h=a.getAttribute('href');if(h.startsWith('?')||h.startsWith('#')){e.preventDefault();window.parent.postMessage({kind:'navigate',href:h},'*');}});
   window.addEventListener('load',()=>{if(window.parent.location.hash){const node=document.getElementById(window.parent.location.hash.slice(1));if(node)node.scrollIntoView();}});
  };
  const script='<script>('+bridge.toString()+')()'+'<'+'/script>';
  document.getElementById('site').srcdoc=html.replace('</body>',script+'</body>');
 }
 window.addEventListener('message',e=>{if(e.source===document.getElementById('site').contentWindow&&e.data?.kind==='navigate')route(e.data.href);});
 window.addEventListener('popstate',()=>route(location.href,true));route(location.href,true);
}
const result=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vértice Imóveis — Prévia completa</title><link rel="icon" href="data:image/svg+xml;base64,${icon}"><style>html,body{margin:0;height:100%;background:#f6f8f6}iframe{border:0;width:100%;height:100dvh;display:block}</style></head><body><iframe id="site" title="Vértice Imóveis — Catálogo de demonstração"></iframe><script>(${previewRouter.toString()})(${json});</script></body></html>`;
await fs.writeFile('../vertice-imoveis-previa.html',result);
console.log('Prévia HTML pronta.');
