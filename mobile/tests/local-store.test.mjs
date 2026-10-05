import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';
import ts from 'typescript';

const values = new Map();
globalThis.localStorage = {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
};
globalThis.window = new EventTarget();
Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
const source = await readFile(new URL('../src/lib/local-store.ts', import.meta.url), 'utf8');
const output = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const store = await import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`);

test('contas locais mantêm sessões, favoritos e pedidos isolados', async () => {
  const first = await store.register('Pessoa Teste', 'primeiro@example.test', 'senha-apenas-teste');
  assert.equal(store.currentUser().userId, first.userId);
  assert.match(first.userId, /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
  await assert.rejects(store.register('Outra Pessoa', 'PRIMEIRO@example.test', 'senha-apenas-teste'), /já tem uma conta/);
  store.setFavorite('VER-1003', true);
  store.setFavorite('VER-1003', true);
  assert.deepEqual(store.favorites(), ['VER-1003']);
  store.addInquiry({ code: 'VER-1003', name: 'Pessoa Teste', phone: '(11) 90000-0000', message: 'Gostaria de visitar este imóvel de teste.' });
  assert.equal(store.inquiries()[0].phone, '11900000000');
  assert.throws(() => store.addInquiry({ code: 'VER-1003', name: 'A', phone: '123', message: 'Oi' }), /Confira/);
  store.logout();
  assert.equal(store.currentUser(), null);
  assert.throws(() => store.favorites(), /Entre na sua conta/);
  await store.register('Segunda Pessoa', 'segundo@example.test', 'outra-senha-teste');
  assert.deepEqual(store.favorites(), []);
  assert.deepEqual(store.inquiries(), []);
  store.setFavorite('VER-1001', true);
  await assert.rejects(store.login('primeiro@example.test', 'incorreta'), /incorretos/);
  await store.login(' PRIMEIRO@example.test ', 'senha-apenas-teste');
  assert.deepEqual(store.favorites(), ['VER-1003']);
  assert.equal(store.inquiries().length, 1);
  store.updateName('Nome Atualizado');
  assert.equal(store.currentUser().fullName, 'Nome Atualizado');
  store.setFavorite('VER-1003', false);
  assert.deepEqual(store.favorites(), []);
  const raw = [...values.values()].join('');
  assert.ok(!raw.includes('senha-apenas-teste'));
  assert.ok(!raw.includes('outra-senha-teste'));
  const saved = JSON.parse(raw);
  assert.equal(saved.accounts[0].passwordHash.length, 64);
  assert.notEqual(saved.accounts[0].salt, saved.accounts[1].salt);
  store.logout();
  const demo = store.enterDemo();
  assert.equal(demo.demo, true);
  store.setFavorite('VER-1006', true);
  store.logout();
  assert.equal(store.enterDemo().userId, demo.userId);
  assert.deepEqual(store.favorites(), ['VER-1006']);
});

test('cadastro rejeita nome, e-mail e senha inválidos', async () => {
  await assert.rejects(store.register('A', 'valido@example.test', 'senha-teste'), /nome/);
  await assert.rejects(store.register('Pessoa', 'inválido', 'senha-teste'), /e-mail/);
  await assert.rejects(store.register('Pessoa', 'valido@example.test', 'curta'), /8 a 128/);
});
