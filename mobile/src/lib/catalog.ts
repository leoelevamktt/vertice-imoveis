import records from '@/data/properties.json';
import { matches as webMatches,normalized,money as webMoney } from './web-core.mjs';
export type Property = typeof records[number];
export const properties: Property[] = records;
export type Filters = {mode:string;city:string;neighborhood:string;type:string;query:string;priceMin:string;priceMax:string;areaMin:string;areaMax:string;bedrooms:string;suites:string;bathrooms:string;parking:string;features:string[]};
export const emptyFilters:Filters={mode:'',city:'',neighborhood:'',type:'',query:'',priceMin:'',priceMax:'',areaMin:'',areaMax:'',bedrooms:'',suites:'',bathrooms:'',parking:'',features:[]};
export const normalize=normalized;
export const money=webMoney;
export const photo=(p:Property['gallery'][number],width=700)=>`${p.url}?auto=format&fit=crop&w=${width}&q=75`;
export function matches(p:Property,f:Filters){return webMatches(p,{...f,code:''})&&(!f.query||normalize([p.code,p.title,p.city,p.neighborhood,p.type].join(' ')).includes(normalize(f.query)));}
export function readFilters(params:URLSearchParams):Filters{const f={...emptyFilters,features:params.getAll('feature')};for(const key of Object.keys(emptyFilters)){if(key!=='features')(f as unknown as Record<string,unknown>)[key]=params.get(key)||'';}return f;}
export function filterParams(f:Filters){const p=new URLSearchParams();for(const [k,v] of Object.entries(f)){if(k==='features')(v as string[]).forEach(x=>p.append('feature',x));else if(v)p.set(k,String(v));}return p;}
export function filterError(f:Filters){for(const k of ['priceMin','priceMax','areaMin','areaMax'] as const){if(f[k]&&(!Number.isFinite(Number(f[k]))||Number(f[k])<0))return 'Preencha valores positivos válidos.';}if(f.priceMin&&f.priceMax&&Number(f.priceMin)>Number(f.priceMax))return 'O valor máximo deve ser maior ou igual ao mínimo.';if(f.areaMin&&f.areaMax&&Number(f.areaMin)>Number(f.areaMax))return 'A área máxima deve ser maior ou igual à mínima.';return '';}
