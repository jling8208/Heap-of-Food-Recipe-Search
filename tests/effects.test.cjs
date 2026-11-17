'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const effects=read('side-effects.json');
const audit=read('sources/side-effects-audit-2026-11-11.json');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),ctx);
assert.deepEqual(Object.keys(effects).sort(),Object.keys(audit.entries).sort());
const compiled=ctx.window.RECIPE_DATA.recipes.filter(r=>r.side_effect);
assert.equal(compiled.length,Object.keys(effects).length);
for(const r of compiled){
 const e=effects[r.id],a=audit.entries[r.id];
 assert.equal(r.side_effect.zh,e.zh,`${r.id}: rebuild data.js`);
 assert.equal(r.side_effect.en,e.en,`${r.id}: rebuild English side effect`);
 assert.doesNotMatch(e.en,/[\u3400-\u9fff]/,`${r.id}: English side effect contains Chinese`);
 assert.ok(a.zh,`${r.id}: missing historical audit description`);
 assert.equal(e.source_en,a.website_en,`${r.id}: original English changed`);
 assert.ok(['code_verified','no_numeric_effect_found','code_review_caveat'].includes(a.status));
 const ref=a.recipe_source;
 assert.ok(ref.line>0&&ref.line<=audit.sources[ref.source].lines);
 for(const id of a.implementation_sources)assert.match(audit.sources[id].sha256,/^[a-f0-9]{64}$/);
 for(const c of a.constants){assert.ok(c.line>0&&c.line<=audit.sources[c.source].lines);assert.ok(c.expression);}
}
console.log(`Passed ${compiled.length} effect descriptions: build synchronization, audit coverage, English translations and source references.`);
