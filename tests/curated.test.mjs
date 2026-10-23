import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
test('personalized site has exactly the three curated reels and no inherited photographs',async()=>{
 const config=JSON.parse(await fs.readFile('public/data/site.json','utf8'));
 assert.equal(config.brand,'THE GLOW UP FOUND');
 assert.deepEqual(config.collections.map(c=>c.key),['instagram','substack','newsstand']);
 for(const c of config.collections){const data=JSON.parse(await fs.readFile(`public/data/${c.key}.json`,'utf8'));assert.equal(data.status,'curated');assert.ok(Array.isArray(data.items));}
 const assets=await fs.readdir('public/assets');assert.ok(!assets.some(name=>/^(instagram-|substack-|homebody-|annas-)/.test(name)));
 const app=await fs.readFile('public/app.js','utf8');assert.ok(!app.includes("fetch('/api/feed')"));
});
