'use strict';
const {recipes,ingredients}=window.RECIPE_DATA;
const byId=new Map(ingredients.map(i=>[i.id,i]));
const recipeMap=new Map(recipes.map(r=>[r.name,r]));
const state={selected:[],mode:'all',excluded:[],excludeMode:'all',category:'',query:'',sort:'source'};
let ingredientQuery='',kind='all',excludeQuery='',excludeKind='all';
const $=id=>document.getElementById(id);
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const types={VEGGIE:'蔬食',MEAT:'肉類',GOODIES:'好東西',MONSTER:'怪物',GEARS:'特殊',PREPAREDPOOP:'特殊',PREPAREDSOUL:'特殊'};
const colors={VEGGIE:'#a6bc89',MEAT:'#c69587',GOODIES:'#d6bd75',MONSTER:'#b19cc6'};
function ingredientPath(id){return `assets/icons/ingredients/${id.startsWith('tag_')?id:'ingredient_'+id.replace(/^kyno_/,'')}.png`;}
function ingredientName(id){return byId.get(id)?.label||id.replace(/^(kyno_|tag_)/,'').replace(/_/g,' ');}
function image(path,alt='',cls=''){return `<img src="${escapeHTML(path)}" alt="${escapeHTML(alt)}" class="${cls}" loading="lazy">`;}
function signed(n){return n>=0?'+'+n:String(n);}
function stats(r){return ['health','hunger','sanity'].map((k,i)=>`<span class="stat" title="${['生命','飽食','理智'][i]}">${image(`assets/icons/cooking/icon_${k}.png`,['生命','飽食','理智'][i])}${signed(r[k])}</span>`).join('');}
function amount(g){if(g.amount==null)return '';return g.comparator==='lessthan'?' <'+g.amount:g.comparator==='morethan'?' '+g.amount+'+':' ×'+g.amount;}
function groups(r){return r.requires.map(g=>`<span class="req-group ${g.items.some(id=>state.selected.includes(id))?'matched':''}">${g.items.map(id=>`<button class="req-item" data-add="${escapeHTML(id)}" title="以 ${escapeHTML(ingredientName(id))} 篩選" aria-label="加入必要條件：${escapeHTML(ingredientName(id))}">${image(ingredientPath(id),ingredientName(id))}</button>`).join('<span class="or" aria-label="或">/</span>')}<span class="amount">${escapeHTML(amount(g))}</span></span>`).join('');}
function toggle(id){if(!byId.has(id))return;state.selected=state.selected.includes(id)?state.selected.filter(x=>x!==id):[...state.selected,id];render();}
function toggleExcluded(id){if(!byId.get(id)?.roles.includes('excluded'))return;state.excluded=state.excluded.includes(id)?state.excluded.filter(x=>x!==id):[...state.excluded,id];render();}
function renderIngredientList(field){
 const isExclude=field==='excluded', listId=isExclude?'exclude-ingredients':'ingredients';
 const scroll=$(listId).scrollTop,q=(isExclude?excludeQuery:ingredientQuery).toLocaleLowerCase().trim();
 const activeKind=isExclude?excludeKind:kind, key=isExclude?'excluded':'selected';
 const available=ingredients.filter(i=>i.roles.includes(field)&&(activeKind==='all'||activeKind===i.kind)&&(!q||`${i.label} ${i.english} ${i.id}`.toLocaleLowerCase().includes(q)));
 $(listId).innerHTML=available.map(i=>{
  const selected=state[key].includes(i.id);
  const next=selected?state[key]:[...state[key],i.id];
  const count=RecipeEngine.filter(recipes,{...state,[key]:next}).length;
  return `<label class="ingredient-option ${selected?'active':''}"><input type="checkbox" ${isExclude?'data-exclude-ingredient':'data-ingredient'}="${escapeHTML(i.id)}" ${selected?'checked':''}>${image(i.image,'')}<span class="label">${escapeHTML(i.label)}${i.kind==='category'?'<small>食材類別</small>':''}</span><span class="count" title="選取後符合的料理數">${count}</span></label>`;
 }).join('')||'<p class="no-ingredients">找不到這個食材。試試英文名稱或食材類別。</p>';
 $(listId).scrollTop=scroll;
}
function renderIngredients(){renderIngredientList('requires');renderIngredientList('excluded');}
function saveState(){try{history.replaceState(null,'','#'+new URLSearchParams({require:state.selected.join(','),mode:state.mode,exclude:state.excluded.join(','),excludeMode:state.excludeMode,category:state.category,q:state.query,sort:state.sort}));}catch(e){/* Some file viewers disable history; filtering still works. */}}
function render(){
 const rows=RecipeEngine.filter(recipes,state);
 $('selected-count').textContent=state.selected.length;
 $('excluded-count').textContent=state.excluded.length;
 $('result-count').textContent=rows.length;
 $('results-title').firstChild.textContent=(state.selected.length||state.excluded.length)?'符合條件的料理 ':'所有料理 ';
 $('selection').hidden=!(state.selected.length||state.excluded.length);
 $('selection').innerHTML=(state.selected.length?`<span>Require · ${state.mode==='all'?'同時包含':'任一包含'}</span>`+state.selected.map(id=>`<button class="chip" data-remove="${escapeHTML(id)}" aria-label="移除必要條件 ${escapeHTML(ingredientName(id))}">${image(ingredientPath(id),'')}${escapeHTML(ingredientName(id))}<b aria-hidden="true">×</b></button>`).join(''):'')+(state.excluded.length?`<span>Exclude · ${state.excludeMode==='all'?'同時包含':'任一包含'}</span>`+state.excluded.map(id=>`<button class="chip exclude-chip" data-remove-excluded="${escapeHTML(id)}" aria-label="移除排除條件 ${escapeHTML(ingredientName(id))}">${image(ingredientPath(id),'')}${escapeHTML(ingredientName(id))}<b aria-hidden="true">×</b></button>`).join(''):'');
 $('result-status').textContent=`${rows.length} / ${recipes.length} 道料理`+((state.selected.length||state.excluded.length)?` · ${state.selected.length} 個必要條件 / ${state.excluded.length} 個排除欄條件`:' · 可從左側選擇食材，或點選料理上的食材圖示');
 $('cards').innerHTML=rows.map(r=>`<article class="recipe-card" data-recipe="${r.name}" style="--type-color:${colors[r.foodtype]||'#9bb5bf'}"><div class="card-header">${image(`assets/foods_cookpot/${r.name}.png`,r.display_name,'dish-icon')}<div><h3>${escapeHTML(r.display_name)}</h3><span class="type-pill">${types[r.foodtype]||'特殊'} / CROCK POT</span></div></div><div class="stats">${stats(r)}</div><p class="requirements-title">REQUIRE · 必要食材</p><div class="requirements">${groups(r)}</div><div class="card-bottom"><div class="card-meta"><span class="stat" title="優先度">${image('assets/icons/cooking/icon_priority.png','優先度')}${r.priority}</span><span class="stat" title="保存天數">${image('assets/icons/cooking/icon_spoilage.png','保存')}${r.spoilageDays??'—'}${r.spoilageDays==null?'':' 天'}</span></div><button class="details-button" data-detail="${r.name}">詳細條件 ↗</button></div></article>`).join('');
 $('empty').hidden=!!rows.length;
 document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===state.category)));
 document.querySelectorAll('input[name=mode]').forEach(b=>b.checked=b.value===state.mode);
 document.querySelectorAll('input[name=exclude-mode]').forEach(b=>b.checked=b.value===state.excludeMode);
 $('sort').value=state.sort;
 renderIngredients();saveState();
}
function detailItems(items){return items.map(id=>`<span class="detail-ingredient">${image(ingredientPath(id),'')}${escapeHTML(ingredientName(id))}</span>`).join('<span class="or">或</span>');}
function showRecipe(id){
 const r=recipeMap.get(id);if(!r)return;
 $('dialog-content').innerHTML=`<div class="dialog-heading">${image(`assets/foods_cookpot/${r.name}.png`,'')}<div><h2 id="dialog-title">${escapeHTML(r.display_name)}</h2><span class="type-pill">${types[r.foodtype]||'特殊'}</span></div></div><div class="stats">${stats(r)}</div><section class="dialog-section"><h3>必要條件</h3>${r.requires.map(g=>`<div class="detail-row">${detailItems(g.items)}<strong>${escapeHTML(amount(g))}</strong></div>`).join('')}</section><section class="dialog-section"><h3>排除條件</h3>${r.excluded.map(g=>`<div class="detail-row">${detailItems(g.items)}<strong>${escapeHTML(amount(g))}</strong></div>`).join('')||'<p class="dialog-note">無</p>'}</section><a class="dialog-source" href="${escapeHTML(r.source_url)}" target="_blank" rel="noopener noreferrer">在heap-of-foods.com查看這道料理 ↗</a>`;
 $('recipe-dialog').showModal();
}
function reset(){Object.assign(state,{selected:[],mode:'all',excluded:[],excludeMode:'all',category:'',query:'',sort:'source'});ingredientQuery='';kind='all';excludeQuery='';excludeKind='all';$('exclude-search').value='';document.querySelectorAll('[data-exclude-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.excludeKind==='all')));$('ingredient-search').value='';$('recipe-search').value='';document.querySelectorAll('[data-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kind==='all')));render();}
function changedCheckbox(event,excluded){const id=excluded?event.target.dataset.excludeIngredient:event.target.dataset.ingredient;if(!id)return;if(excluded)toggleExcluded(id);else toggle(id);document.querySelector(`[${excluded?'data-exclude-ingredient':'data-ingredient'}="${id}"]`)?.focus({preventScroll:true});}
$('ingredients').addEventListener('change',e=>changedCheckbox(e,false));
$('exclude-ingredients').addEventListener('change',e=>changedCheckbox(e,true));
$('exclude-search').addEventListener('input',e=>{excludeQuery=e.target.value;renderIngredientList('excluded');});
document.querySelectorAll('input[name=exclude-mode]').forEach(el=>el.addEventListener('change',e=>{state.excludeMode=e.target.value;render();}));
document.querySelectorAll('[data-exclude-kind]').forEach(el=>el.addEventListener('click',()=>{excludeKind=el.dataset.excludeKind;document.querySelectorAll('[data-exclude-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b===el)));renderIngredientList('excluded');}));
$('selection').addEventListener('click',e=>{const b=e.target.closest('[data-remove]');if(b)toggle(b.dataset.remove);const ex=e.target.closest('[data-remove-excluded]');if(ex)toggleExcluded(ex.dataset.removeExcluded);});
$('cards').addEventListener('click',e=>{const add=e.target.closest('[data-add]'),detail=e.target.closest('[data-detail]');if(add&&!state.selected.includes(add.dataset.add))toggle(add.dataset.add);if(detail)showRecipe(detail.dataset.detail);});
$('ingredient-search').addEventListener('input',e=>{ingredientQuery=e.target.value;renderIngredients();});
$('recipe-search').addEventListener('input',e=>{state.query=e.target.value;render();});
$('sort').addEventListener('change',e=>{state.sort=e.target.value;render();});
document.querySelectorAll('input[name=mode]').forEach(el=>el.addEventListener('change',e=>{state.mode=e.target.value;render();}));
document.querySelectorAll('[data-category]').forEach(el=>el.addEventListener('click',()=>{state.category=el.dataset.category;render();}));
document.querySelectorAll('[data-kind]').forEach(el=>el.addEventListener('click',()=>{kind=el.dataset.kind;document.querySelectorAll('[data-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b===el)));renderIngredients();}));
$('reset').addEventListener('click',reset);$('empty-reset').addEventListener('click',reset);$('home').addEventListener('click',e=>{e.preventDefault();reset();});
$('close-dialog').addEventListener('click',()=>$('recipe-dialog').close());
$('recipe-dialog').addEventListener('click',e=>{if(e.target===$('recipe-dialog')){const b=e.target.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)e.target.close();}});
function restoreHash(){const p=new URLSearchParams(location.hash.slice(1));state.selected=[...new Set((p.get('require')||'').split(',').filter(id=>byId.get(id)?.roles.includes('requires')))];state.mode=p.get('mode')==='any'?'any':'all';state.excluded=[...new Set((p.get('exclude')||'').split(',').filter(id=>byId.get(id)?.roles.includes('excluded')))];state.excludeMode=p.get('excludeMode')==='any'?'any':'all';state.category=Object.hasOwn(types,p.get('category'))?p.get('category'):'';state.query=p.get('q')||'';state.sort=['source','name','health','hunger','sanity','priority'].includes(p.get('sort'))?p.get('sort'):'source';$('recipe-search').value=state.query;render();}
window.addEventListener('hashchange',restoreHash);
restoreHash();
