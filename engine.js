(function(root){
  'use strict';
  const characterTypes=new Set(['GEARS','PREPAREDPOOP','PREPAREDSOUL']);
  function categoryFor(recipe){return characterTypes.has(recipe.foodtype)?'CHARACTER':recipe.foodtype;}
  function matches(recipe,selected,mode='all',field='requires') {
    const ids=new Set((recipe[field]||[]).flatMap(group=>group.items));
    return !selected.length || (mode==='any' ? selected.some(id=>ids.has(id)) : selected.every(id=>ids.has(id)));
  }
  function filter(recipes,state) {
    const q=(state.query||'').trim().toLocaleLowerCase();
    const rows=recipes.filter(r=>(!state.station||r.station===state.station)&&(!state.effectOnly||!!r.side_effect)&&matches(r,state.selected||[],state.mode)&&matches(r,state.excluded||[],state.excludeMode||'all','excluded')&&(!state.category||(state.category==='CHARACTER'?categoryFor(r)==='CHARACTER':r.foodtype===state.category))&&(!q||`${r.display_name_zh||''} ${r.display_name} ${r.name} ${r.side_effect?.zh||''} ${r.side_effect?.en||''} ${r.side_effect?.source_en||''}`.toLocaleLowerCase().includes(q)));
    const key=state.sort||'source';
    const name=r=>state.lang==='en'?r.display_name:r.display_name_zh||r.display_name;
    if(key==='name')rows.sort((a,b)=>name(a).localeCompare(name(b),state.lang==='en'?'en':'zh-Hant'));
    else if(['health','hunger','sanity','priority'].includes(key))rows.sort((a,b)=>(b[key]??-Infinity)-(a[key]??-Infinity)||name(a).localeCompare(name(b),state.lang==='en'?'en':'zh-Hant'));
    return rows;
  }
  root.RecipeEngine={matches,filter,categoryFor};
})(globalThis);
