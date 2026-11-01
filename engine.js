(function(root){
  'use strict';
  function matches(recipe,selected,mode='all',field='requires') {
    const ids=new Set((recipe[field]||[]).flatMap(group=>group.items));
    return !selected.length || (mode==='any' ? selected.some(id=>ids.has(id)) : selected.every(id=>ids.has(id)));
  }
  function filter(recipes,state) {
    const q=(state.query||'').trim().toLocaleLowerCase();
    const rows=recipes.filter(r=>matches(r,state.selected||[],state.mode)&&matches(r,state.excluded||[],state.excludeMode||'all','excluded')&&(!state.category||r.foodtype===state.category)&&(!q||`${r.display_name} ${r.name}`.toLocaleLowerCase().includes(q)));
    const key=state.sort||'source';
    if(key==='name')rows.sort((a,b)=>a.display_name.localeCompare(b.display_name));
    else if(['health','hunger','sanity','priority'].includes(key))rows.sort((a,b)=>(b[key]??-Infinity)-(a[key]??-Infinity)||a.display_name.localeCompare(b.display_name));
    return rows;
  }
  root.RecipeEngine={matches,filter};
})(globalThis);
