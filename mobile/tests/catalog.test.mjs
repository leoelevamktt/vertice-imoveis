import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const records = JSON.parse(await readFile(new URL('../src/data/properties.json', import.meta.url), 'utf8'));
let source = await readFile(new URL('../src/lib/catalog.ts', import.meta.url), 'utf8');
source = source.replace("import records from '@/data/properties.json';", `const records = ${JSON.stringify(records)};`)
  .replace("'./web-core.mjs'", JSON.stringify(new URL('../src/lib/web-core.mjs', import.meta.url).href));
const output = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const catalog = await import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`);

test('catálogo web preservado e filtros combinados', () => {
  assert.equal(catalog.properties.length, 30);
  assert.equal(new Set(catalog.properties.map(p => p.code)).size, 30);
  assert.ok(catalog.properties.every(p => p.gallery.length >= 1 && p.description));
  const filters = { ...catalog.emptyFilters, city: 'Barueri', mode: 'venda', bedrooms: '4', features: ['Piscina'] };
  assert.deepEqual(catalog.properties.filter(p => catalog.matches(p, filters)).map(p => p.code), ['VER-1003', 'VER-1020']);
  assert.deepEqual(catalog.readFilters(catalog.filterParams(filters)), filters);
  assert.equal(catalog.properties.filter(p => catalog.matches(p, { ...catalog.emptyFilters, query: 'ver-1003' })).length, 1);
  assert.ok(catalog.properties.filter(p => catalog.matches(p, { ...catalog.emptyFilters, query: 'sao paulo' })).length > 0);
  assert.equal(catalog.properties.filter(p => catalog.matches(p, { ...filters, priceMax: '1000' })).length, 0);
});

test('intervalos invertidos e números inválidos têm mensagens de validação', () => {
  assert.match(catalog.filterError({ ...catalog.emptyFilters, priceMin: '200', priceMax: '100' }), /máximo/);
  assert.match(catalog.filterError({ ...catalog.emptyFilters, areaMin: '200', areaMax: '100' }), /máxima/);
  assert.match(catalog.filterError({ ...catalog.emptyFilters, priceMin: '-1' }), /positivos/);
  assert.match(catalog.filterError({ ...catalog.emptyFilters, priceMax: 'abc' }), /válidos/);
  assert.equal(catalog.filterError({ ...catalog.emptyFilters, priceMin: '100', priceMax: '100' }), '');
});
