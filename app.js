'use strict';
const {recipes,ingredients,stations}=window.RECIPE_DATA;
const byId=new Map(ingredients.map(i=>[i.id,i]));
const recipeMap=new Map(recipes.map(r=>[r.id,r]));
const state={station:'cookpot',effectOnly:false,selected:[],mode:'all',excluded:[],excludeMode:'all',category:'',query:'',sort:'source',lang:'zh-Hant'};
let ingredientQuery='',kind='all',excludeQuery='',excludeKind='all';
const $=id=>document.getElementById(id);
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const L=(zh,en)=>state.lang==='en'?en:zh;
const types={VEGGIE:['蔬食','Vegetable'],MEAT:['肉類','Meat'],GOODIES:['好東西','Goodies'],MONSTER:['怪物','Monster'],GEARS:['特殊','Special'],PREPAREDPOOP:['特殊','Special'],PREPAREDSOUL:['特殊','Special'],ALCOHOLIC:['酒類','Alcoholic'],ALCOHOLICMONSTER:['怪物酒類','Monster Alcoholic'],ELEMENTAL:['元素','Elemental'],GENERIC:['通用食物','Generic Food'],CHARACTER:['角色專屬','Character Only']};
const exclusiveCharacters={GEARS:['WX-78','WX-78'],PREPAREDPOOP:['沃姆伍德','Wormwood'],PREPAREDSOUL:['沃托克斯','Wortox']};
const typeName=type=>types[type]?L(...types[type]):type;
function recipeTypeLabel(r){return exclusiveCharacters[r.foodtype]?`${L('角色專屬','Character Only')} · ${L(...exclusiveCharacters[r.foodtype])}`:typeName(r.foodtype)||L('特殊','Special');}
function recipeName(r){return state.lang==='en'?r.display_name:r.display_name_zh||r.display_name;}
function stationName(s){return state.lang==='en'?s.label:s.zh;}
function setStaticLanguage(){
 document.documentElement.lang=state.lang;document.title=L('食材找料理｜Heap of Foods','Recipe Search | Heap of Foods');$('language').value=state.lang;
 const content=[['.brand small','HEAP OF FOODS · 食譜筆記','HEAP OF FOODS · RECIPE NOTES'],['.edition span','／ 食譜集','/ COLLECTION'],['.intro .eyebrow','INGREDIENTS → RECIPES','INGREDIENTS → RECIPES'],['.intro h1','從食材，找到下一道料理。','Find your next dish by ingredient.'],['.intro p:last-child','勾選必要食材，讓食譜自己浮現。你的食材清單，就是搜尋的起點。','Choose ingredients to find the recipes that require them.'],['.filter-title h2 span','篩選','Filters'],['#reset','全部重設','Reset all'],['.require-section summary small','必要食材','Required ingredients'],['.require-section .help','搜尋食譜的需求條件','Find recipes that require these ingredients.'],['.exclude-section summary small','排除食材','Excluded ingredients'],['.exclude-section .help','查找排除欄含此食材的料理，包含限量條件。','Find recipes that exclude these ingredients, including threshold rules.'],['.sidebar-note p','點料理卡上的食材，也可以直接加入篩選。','Click an ingredient on a recipe card to add it to the filter.'],['.results-top .eyebrow','RECIPE COLLECTION','RECIPE COLLECTION'],['.effect-toggle','有 Side Effect','Has a side effect'],['#empty h3','沒有符合這組條件的料理','No recipes match these filters'],['#empty p','試著移除一個食材、改為「任一包含」，或清除料理名稱與分類。','Remove an ingredient, choose “Match any”, or clear the recipe search and category.'],['#empty-reset','清除全部條件','Clear all filters'],['.dialog-top span','RECIPE NOTES','RECIPE NOTES'],['footer a','原站 ↗','Source site ↗'],['#language-label','語言','Language']];
 for(const [selector,zh,en] of content){const el=document.querySelector(selector);if(el&&selector!=='.effect-toggle')el.textContent=L(zh,en);else if(el)el.lastChild.textContent=L(zh,en);}
 const radioLabels=[['input[name="mode"][value="all"]','同時包含','Match all'],['input[name="mode"][value="any"]','任一包含','Match any'],['input[name="exclude-mode"][value="all"]','同時包含','Match all'],['input[name="exclude-mode"][value="any"]','任一包含','Match any']];
 for(const [selector,zh,en] of radioLabels)document.querySelector(selector).parentElement.lastChild.textContent=L(zh,en);
 const tabs=[['[data-kind="all"]','全部','All'],['[data-kind="category"]','類別','Categories'],['[data-kind="ingredient"]','食材','Ingredients'],['[data-exclude-kind="all"]','全部','All'],['[data-exclude-kind="category"]','類別','Categories'],['[data-exclude-kind="ingredient"]','食材','Ingredients']];
 for(const [selector,zh,en] of tabs)document.querySelector(selector).textContent=L(zh,en);
 const placeholders=[['ingredient-search','搜尋食材／類別…','Search ingredients/categories…'],['exclude-search','搜尋排除食材／類別…','Search excluded ingredients/categories…'],['recipe-search','搜尋料理或效果…','Search recipes or effects…']];
 for(const [id,zh,en] of placeholders){$(id).placeholder=L(zh,en);$(id).setAttribute('aria-label',L(zh,en));}
 const sorts=[['source','原站順序','Source order'],['name','料理名稱','Recipe name'],['health','生命最高','Most health'],['hunger','飽食最高','Most hunger'],['sanity','理智最高','Most sanity'],['priority','優先度最高','Highest priority']];
 document.querySelector('.sort-label').firstChild.textContent=L('排序 ','Sort ');
 for(const [value,zh,en] of sorts)document.querySelector(`#sort option[value="${value}"]`).textContent=L(zh,en);
 for(const [selector,zh,en] of [['#station-tabs','烹調設備','Cooking stations'],['.filters','食材篩選','Ingredient filters'],['.category-tabs','料理分類','Recipe categories'],['#close-dialog','關閉料理詳細資料','Close recipe details']])document.querySelector(selector).setAttribute('aria-label',L(zh,en));
}
const colors={VEGGIE:'#a6bc89',MEAT:'#c69587',GOODIES:'#d6bd75',MONSTER:'#b19cc6'};
function activeStation(){return stations.find(s=>s.id===state.station)||stations[0];}
function effectText(r){return L(r.side_effect?.zh,r.side_effect?.detail_en);}
function effectSummary(r){return r.side_effect?`<div class="effect-summary" title="${escapeHTML(effectText(r))}">${image('assets/icons/cooking/icon_debuff.png','Side Effect')}<span>${escapeHTML(effectText(r))}</span></div>`:'';}
function ingredientPath(id){return `assets/icons/ingredients/${id.startsWith('tag_')?id:'ingredient_'+id.replace(/^kyno_/,'')}.png`;}
function ingredientName(id){const item=byId.get(id);return item?(state.lang==='en'?item.english:item.label):id.replace(/^(kyno_|tag_)/,'').replace(/_/g,' ');}
function image(path,alt='',cls=''){return `<img src="${escapeHTML(path)}" alt="${escapeHTML(alt)}" class="${cls}" loading="lazy">`;}
function signed(n){return n>=0?'+'+n:String(n);}
function stats(r){return ['health','hunger','sanity'].map((k,i)=>`<span class="stat" title="${L(['生命','飽食','理智'][i],['Health','Hunger','Sanity'][i])}">${image(`assets/icons/cooking/icon_${k}.png`,L(['生命','飽食','理智'][i],['Health','Hunger','Sanity'][i]))}${signed(r[k])}</span>`).join('');}
function amount(g){if(g.amount==null)return '';return g.comparator==='lessthan'?' <'+g.amount:g.comparator==='morethan'?' '+g.amount+'+':' ×'+g.amount;}
function groups(r){return r.requires.map(g=>`<span class="req-group ${g.items.some(id=>state.selected.includes(id))?'matched':''}">${g.items.map(id=>`<button class="req-item" data-add="${escapeHTML(id)}" title="${escapeHTML(L('以 ','Filter by ')+ingredientName(id))}" aria-label="${escapeHTML(L('加入必要條件：','Add required ingredient: ')+ingredientName(id))}">${image(ingredientPath(id),ingredientName(id))}</button>`).join(`<span class="or" aria-label="${L('或','or')}">/</span>`)}<span class="amount">${escapeHTML(amount(g))}</span></span>`).join('');}
function toggle(id){if(!byId.has(id))return;state.selected=state.selected.includes(id)?state.selected.filter(x=>x!==id):[...state.selected,id];render();}
function toggleExcluded(id){if(!byId.get(id)?.stations.excluded.includes(state.station))return;state.excluded=state.excluded.includes(id)?state.excluded.filter(x=>x!==id):[...state.excluded,id];render();}
function renderIngredientList(field){
 const isExclude=field==='excluded', listId=isExclude?'exclude-ingredients':'ingredients';
 const scroll=$(listId).scrollTop,q=(isExclude?excludeQuery:ingredientQuery).toLocaleLowerCase().trim();
 const activeKind=isExclude?excludeKind:kind, key=isExclude?'excluded':'selected';
 const available=ingredients.filter(i=>i.stations[field].includes(state.station)&&(activeKind==='all'||activeKind===i.kind)&&(!q||`${i.label} ${i.english} ${i.id}`.toLocaleLowerCase().includes(q)));
 $(listId).innerHTML=available.map(i=>{
  const selected=state[key].includes(i.id);
  const next=selected?state[key]:[...state[key],i.id];
  const count=RecipeEngine.filter(recipes,{...state,[key]:next}).length;
  return `<label class="ingredient-option ${selected?'active':''}"><input type="checkbox" ${isExclude?'data-exclude-ingredient':'data-ingredient'}="${escapeHTML(i.id)}" ${selected?'checked':''}>${image(i.image,'')}<span class="label">${escapeHTML(ingredientName(i.id))}${i.kind==='category'?`<small>${L('食材類別','Ingredient category')}</small>`:''}</span><span class="count" title="${L('選取後符合的料理數','Recipes matching after selection')}">${count}</span></label>`;
 }).join('')||`<p class="no-ingredients">${L('找不到這個食材。試試英文名稱或食材類別。','No ingredients found. Try another name or category.')}</p>`;
 $(listId).scrollTop=scroll;
}
function renderIngredients(){renderIngredientList('requires');renderIngredientList('excluded');}
function saveState(){try{history.replaceState(null,'','#'+new URLSearchParams({station:state.station,effect:state.effectOnly?'1':'0',require:state.selected.join(','),mode:state.mode,exclude:state.excluded.join(','),excludeMode:state.excludeMode,category:state.category,q:state.query,sort:state.sort,lang:state.lang}));}catch(e){/* Some file viewers disable history; filtering still works. */}}
function render(){
 setStaticLanguage();
 const rows=RecipeEngine.filter(recipes,state);
 const station=activeStation();
 $('dataset-summary').textContent=L(`${recipes.length} 道料理 · 4 種設備 · 新分類／效果資料 2026-11-10`,`${recipes.length} recipes · 4 stations · category/effect data 2026-11-10`);
 $('station-tabs').innerHTML=stations.map(s=>`<button class="station-tab" data-station="${s.id}" aria-pressed="${String(s.id===state.station)}">${image(s.image,'')}<span><strong>${escapeHTML(stationName(s))}</strong><small>${state.lang==='en'?'':escapeHTML(s.label)+' · '}${s.count} ${L('道','recipes')}</small></span></button>`).join('');
 document.querySelectorAll('[data-station]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.station===state.station)));
 const categories=[...new Set(recipes.filter(r=>r.station===state.station).map(r=>RecipeEngine.categoryFor(r)))];
 document.querySelector('.category-tabs').innerHTML=['',...categories].map(c=>`<button data-category="${c}" aria-pressed="${String(state.category===c)}">${c?typeName(c):L('全部','All')}</button>`).join('');
 $('effect-only').checked=state.effectOnly;
 $('selected-count').textContent=state.selected.length;
 $('excluded-count').textContent=state.excluded.length;
 $('result-count').textContent=rows.length;
 $('results-title').firstChild.textContent=(state.selected.length||state.excluded.length)?L('符合條件的料理 ','Matching recipes '):stationName(station)+' ';
 $('selection').hidden=!(state.selected.length||state.excluded.length);
 $('selection').innerHTML=(state.selected.length?`<span>Require · ${state.mode==='all'?L('同時包含','Match all'):L('任一包含','Match any')}</span>`+state.selected.map(id=>`<button class="chip" data-remove="${escapeHTML(id)}" aria-label="${escapeHTML(L('移除必要條件 ','Remove required ingredient ')+ingredientName(id))}">${image(ingredientPath(id),'')}${escapeHTML(ingredientName(id))}<b aria-hidden="true">×</b></button>`).join(''):'')+(state.excluded.length?`<span>Exclude · ${state.excludeMode==='all'?L('同時包含','Match all'):L('任一包含','Match any')}</span>`+state.excluded.map(id=>`<button class="chip exclude-chip" data-remove-excluded="${escapeHTML(id)}" aria-label="${escapeHTML(L('移除排除條件 ','Remove excluded ingredient ')+ingredientName(id))}">${image(ingredientPath(id),'')}${escapeHTML(ingredientName(id))}<b aria-hidden="true">×</b></button>`).join(''):'');
 $('result-status').textContent=`${rows.length} / ${station.count} ${L('道料理','recipes')}`+((state.selected.length||state.excluded.length)?` · ${state.selected.length} ${L('個必要條件','required')} / ${state.excluded.length} ${L('個排除欄條件','excluded')}`:L(' · 可從左側選擇食材，或點選料理上的食材圖示',' · Choose ingredients on the left or click an icon on a recipe card'));
 $('cards').innerHTML=rows.map(r=>`<article class="recipe-card" data-recipe="${r.name}" data-station-id="${r.station}" style="--type-color:${colors[r.foodtype]||'#9bb5bf'}"><div class="card-header">${image(r.image,recipeName(r),'dish-icon')}<div><h3>${escapeHTML(recipeName(r))}</h3><span class="type-pill">${recipeTypeLabel(r)} / ${escapeHTML(stationName(station))}</span></div></div><div class="stats">${stats(r)}</div>${effectSummary(r)}<p class="requirements-title">${L('REQUIRE · 必要食材','REQUIRE · INGREDIENTS')}</p><div class="requirements">${groups(r)}</div><div class="card-bottom"><div class="card-meta"><span class="stat" title="${L('優先度','Priority')}">${image('assets/icons/cooking/icon_priority.png',L('優先度','Priority'))}${r.priority}</span><span class="stat" title="${L('保存天數','Shelf life')}">${image('assets/icons/cooking/icon_spoilage.png',L('保存','Shelf life'))}${r.spoilageDays??'—'}${r.spoilageDays==null?'':L(' 天',' days')}</span></div><button class="details-button" data-detail="${r.id}">${L('詳細條件 ↗','Details ↗')}</button></div></article>`).join('');
 $('empty').hidden=!!rows.length;
 document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===state.category)));
 document.querySelectorAll('input[name=mode]').forEach(b=>b.checked=b.value===state.mode);
 document.querySelectorAll('input[name=exclude-mode]').forEach(b=>b.checked=b.value===state.excludeMode);
 $('sort').value=state.sort;
 renderIngredients();saveState();
}
function detailItems(items){return items.map(id=>`<span class="detail-ingredient">${image(ingredientPath(id),'')}${escapeHTML(ingredientName(id))}</span>`).join(`<span class="or">${L('或','or')}</span>`);}
function showRecipe(id){
 const r=recipeMap.get(id);if(!r)return;
 $('dialog-content').innerHTML=`<div class="dialog-heading">${image(r.image,'')}<div><h2 id="dialog-title">${escapeHTML(recipeName(r))}</h2><span class="type-pill">${recipeTypeLabel(r)}</span></div></div><div class="stats">${stats(r)}</div><section class="dialog-section effect-detail"><h3>${L('Side Effect · 額外效果／副作用','Side Effect')}</h3>${r.side_effect?`<p class="effect-description">${escapeHTML(effectText(r))}</p>`:`<p class="dialog-note">${L('無','None')}</p>`}</section><section class="dialog-section"><h3>${L('必要條件','Required ingredients')}</h3>${r.requires.map(g=>`<div class="detail-row">${detailItems(g.items)}<strong>${escapeHTML(amount(g))}</strong></div>`).join('')}</section><section class="dialog-section"><h3>${L('排除條件','Excluded ingredients')}</h3>${r.excluded.map(g=>`<div class="detail-row">${detailItems(g.items)}<strong>${escapeHTML(amount(g))}</strong></div>`).join('')||`<p class="dialog-note">${L('無','None')}</p>`}</section><a class="dialog-source" href="${escapeHTML(r.source_url)}" target="_blank" rel="noopener noreferrer">${L('在heap-of-foods.com查看這道料理 ↗','View this recipe on heap-of-foods.com ↗')}</a>`;
 $('recipe-dialog').showModal();
}
function reset(){Object.assign(state,{effectOnly:false,selected:[],mode:'all',excluded:[],excludeMode:'all',category:'',query:'',sort:'source'});ingredientQuery='';kind='all';excludeQuery='';excludeKind='all';$('exclude-search').value='';document.querySelectorAll('[data-exclude-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.excludeKind==='all')));$('ingredient-search').value='';$('recipe-search').value='';document.querySelectorAll('[data-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kind==='all')));render();}
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
document.querySelector('.category-tabs').addEventListener('click',e=>{const el=e.target.closest('[data-category]');if(el){state.category=el.dataset.category;render();}});
document.querySelectorAll('[data-kind]').forEach(el=>el.addEventListener('click',()=>{kind=el.dataset.kind;document.querySelectorAll('[data-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b===el)));renderIngredients();}));
$('reset').addEventListener('click',reset);$('empty-reset').addEventListener('click',reset);$('home').addEventListener('click',e=>{e.preventDefault();state.station='cookpot';reset();});
$('close-dialog').addEventListener('click',()=>$('recipe-dialog').close());
$('recipe-dialog').addEventListener('click',e=>{if(e.target===$('recipe-dialog')){const b=e.target.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)e.target.close();}});
function restoreHash(){const p=new URLSearchParams(location.hash.slice(1));let saved='';try{saved=localStorage.getItem('hof-language')||'';}catch(e){}state.lang=(p.get('lang')||saved)==='en'?'en':'zh-Hant';state.station=stations.some(s=>s.id===p.get('station'))?p.get('station'):'cookpot';state.effectOnly=p.get('effect')==='1';state.selected=[...new Set((p.get('require')||'').split(',').filter(id=>byId.get(id)?.stations.requires.includes(state.station)))];state.mode=p.get('mode')==='any'?'any':'all';state.excluded=[...new Set((p.get('exclude')||'').split(',').filter(id=>byId.get(id)?.stations.excluded.includes(state.station)))];state.excludeMode=p.get('excludeMode')==='any'?'any':'all';state.category=Object.hasOwn(types,p.get('category'))?RecipeEngine.categoryFor({foodtype:p.get('category')}):'';state.query=p.get('q')||'';state.sort=['source','name','health','hunger','sanity','priority'].includes(p.get('sort'))?p.get('sort'):'source';$('recipe-search').value=state.query;render();}
$('total-recipes').textContent=recipes.length;
$('language').addEventListener('change',e=>{state.lang=e.target.value==='en'?'en':'zh-Hant';try{localStorage.setItem('hof-language',state.lang);}catch(err){}render();});
$('station-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-station]');if(!b||b.dataset.station===state.station)return;state.station=b.dataset.station;reset();});
$('effect-only').addEventListener('change',e=>{state.effectOnly=e.target.checked;render();});
window.addEventListener('hashchange',restoreHash);
restoreHash();
