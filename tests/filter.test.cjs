const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),ctx={window:{}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(root,'engine.js'),'utf8'),ctx);
const {recipes,ingredients,stations}=ctx.window.RECIPE_DATA,{filter}=ctx.RecipeEngine;
const counts={cookpot:188,warly:29,keg:70,jar:95};let checks=0;
assert.equal(recipes.length,382);assert.equal(new Set(recipes.map(r=>r.id)).size,382);
function reference(r,s){
 const m=(items,field,mode)=>!items?.length||(mode==='any'?items.some(i=>r[field].some(g=>g.items.includes(i))):items.every(i=>r[field].some(g=>g.items.includes(i))));
 return (!s.station||r.station===s.station)&&(!s.effectOnly||!!r.side_effect)&&m(s.selected,'requires',s.mode)&&m(s.excluded,'excluded',s.excludeMode);
}
for(const station of stations){
 assert.equal(filter(recipes,{station:station.id}).length,counts[station.id]);
 const ids=ingredients.filter(i=>i.stations.requires.includes(station.id)).map(i=>i.id);
 const excluded=ingredients.filter(i=>i.stations.excluded.includes(station.id)).map(i=>i.id);
 for(const id of ids)for(const mode of ['all','any']){
  const state={station:station.id,selected:[id,ids[(checks+7)%ids.length]],excluded:excluded.length?[excluded[checks%excluded.length]]:[],mode,excludeMode:mode,effectOnly:checks%3===0};
  assert.equal(JSON.stringify(filter(recipes,state).map(r=>r.id)),JSON.stringify(recipes.filter(r=>reference(r,state)).map(r=>r.id)));checks++;
 }
 for(const r of filter(recipes,{station:station.id,effectOnly:true}))assert.ok(r.side_effect.zh&&r.side_effect.en&&r.debuff);
}
assert.equal(filter(recipes,{station:'cookpot',query:'提升移速'}).some(r=>r.name==='coffee'),true);
assert.equal(filter(recipes,{station:'keg',query:'coffee'}).some(r=>r.station==='cookpot'),false);
for(const r of recipes){assert.ok(fs.existsSync(path.join(root,r.image)));assert.equal(!!r.side_effect,!!r.debuff);}
console.log(`Passed ${checks} combined station/require/exclude/effect cases; counts, effect search, all food assets, unique IDs.`);
