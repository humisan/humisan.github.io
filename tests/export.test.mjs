import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('out/index.html', root), 'utf8');
const serverHtml = await readFile(new URL('out/servers/index.html', root), 'utf8');
const linksHtml = await readFile(new URL('out/links/index.html', root), 'utf8');

test('the exported page presents the confirmed server names and roles without exposing individual plugins', () => {
  for (const value of ['GankMC', 'Owner / Founder', 'LzPvP', 'Admin', '日ノ本鯖', 'Dev', 'Java']) assert.ok(serverHtml.includes(value) || html.includes(value), `Missing public profile content: ${value}`);
  for (const value of ['HopperLimit', 'TownyDiscord', 'Towny-Discord']) assert.ok(!(html + serverHtml).includes(value), 'Individual plugin names must remain unpublished');
});

test('each same-page navigation destination exists in the static HTML', () => {
  for (const match of html.matchAll(/href="(?:\/)?#([^"\s]+)"/g)) {
    assert.ok(html.includes(`id="${match[1]}"`), `Broken navigation destination: ${match[1]}`);
  }
});

test('external links use HTTPS and protect the opener', () => {
  const links = [...linksHtml.matchAll(/<a\b[^>]*href="(https?:[^"\s]+)"[^>]*>/g)];
  assert.equal(links.length, 3);
  for (const [tag, href] of links) {
    assert.equal(new URL(href).protocol, 'https:');
    assert.match(tag, /rel="noopener noreferrer"/);
    assert.match(tag, /aria-label="[^"\s][^"]+"/);
  }
});

test('Japanese content, canonical URL, and social image exist without JavaScript', () => {
  assert.match(html, /<html[^>]*lang="ja"/);
  assert.match(html, /rel="canonical" href="https:\/\/hanyuu\.lol\/?"/);
  assert.match(html, /property="og:image" content="https:\/\/hanyuu\.lol\/icon\.png"/);
  assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length, 1);
  assert.match(html, /alt="[^"]+"/);
});

test('all exported local scripts, stylesheets, and images exist', async () => {
  const assets = new Set([...html.matchAll(/(?:src|href)="(\/[^"?#]+\.(?:js|css|png))"/g)].map(match => match[1]));
  assert.ok(assets.size > 0);
  for (const asset of assets) await access(new URL(`out/${asset.slice(1)}`, root));
});

test('the static 404 page gives a route back home', async () => {
  const missing = await readFile(new URL('out/404.html', root), 'utf8');
  assert.ok(missing.includes('ページが見つかりません'));
  assert.match(missing, /href="\/"/);
});

test('the deploy workflow retains the domain and runs the regression checks', async () => {
  const cname = await readFile(new URL('CNAME', root), 'utf8');
  assert.equal(cname.trim(), 'hanyuu.lol');
  const workflow = await readFile(new URL('.github/workflows/deploy.yml', root), 'utf8');
  assert.match(workflow, /npm run typecheck/);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /publish_dir: \.\/out/);
  assert.match(workflow, /cname: hanyuu\.lol/);
});


test('every separate page is exported with a matching canonical URL and a single primary heading', async () => {
  for (const page of ['about', 'servers', 'links', 'play']) {
    const content = await readFile(new URL(`out/${page}/index.html`, root), 'utf8');
    assert.ok(content.includes(`href="https://hanyuu.lol/${page}/"`));
    assert.equal([...content.matchAll(/<h1(?:\s|>)/g)].length, 1);
  }
});
