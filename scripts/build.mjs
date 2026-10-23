import fs from 'node:fs/promises';
const site=JSON.parse(await fs.readFile('public/data/site.json','utf8'));
const https=value=>{try{return new URL(value).protocol==='https:';}catch{return false;}};
for(const collection of site.collections){
  if(collection.url!==null&&!https(collection.url))throw Error(`${collection.key}: invalid destination`);
  const feed=JSON.parse(await fs.readFile(`public/data/${collection.key}.json`,'utf8'));
  if(feed.status!=='curated'||!Array.isArray(feed.items))throw Error(`${collection.key}: expected curated collection`);
  if(new Set(feed.items.map(p=>p.id)).size!==feed.items.length)throw Error(`${collection.key}: duplicate items`);
  for(const item of feed.items){
    if(!item.id||!item.title||!https(item.url)||(!item.image&&!item.imagePending))throw Error(`${collection.key}: incomplete content`);
    if(!item.image)continue;
    if(item.image.startsWith('/'))await fs.access(`public${item.image}`);
    else if(!https(item.image))throw Error(`${collection.key}: invalid image`);
  }
  console.log(`${collection.key}: ${feed.items.length} curated items${collection.url?'':'; destination pending'}`);
}
await fs.access('public/assets/viewer-source.png');
console.log('Static site ready in public/. No automatic feeds.');
