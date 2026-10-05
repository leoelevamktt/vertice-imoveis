import fs from 'node:fs/promises';
const properties=JSON.parse(await fs.readFile('src/data/properties.json','utf8'));
const template=await fs.readFile('dist/index.html','utf8');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(const route of ['buscar','salvos','conta'])await fs.writeFile(`dist/${route}.html`,template.replace(/<title>.*?<\/title>/,`<title>${{buscar:'Buscar imóveis',salvos:'Imóveis salvos',conta:'Minha conta'}[route]} | Vértice Mobile</title>`));
await fs.mkdir('dist/imovel',{recursive:true});
for(const p of properties){const html=template.replace(/<title>.*?<\/title>/,`<title>${escape(p.title)} · ${p.code} | Vértice</title>`).replace(/name="description" content="[^"]*"/,`name="description" content="${escape(`${p.code}: ${p.type} em ${p.neighborhood}, ${p.city}. ${p.area} m², ${p.bedrooms} quartos.`)}"`);await fs.writeFile(`dist/imovel/${p.slug}.html`,html);}
console.log(`${properties.length + 3} páginas internas + início gerados para publicação estática.`);
