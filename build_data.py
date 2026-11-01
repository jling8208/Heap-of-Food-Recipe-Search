"""Rebuild local data.js after editing recipes.json or ingredient-labels.json."""
import json,pathlib
ROOT=pathlib.Path(__file__).resolve().parent

def icon_path(item):return 'assets/icons/ingredients/'+(item if item.startswith('tag_') else 'ingredient_'+item.removeprefix('kyno_'))+'.png'
def main():
 recipes=json.loads((ROOT/'recipes.json').read_text(encoding='utf-8'))
 labels=json.loads((ROOT/'ingredient-labels.json').read_text(encoding='utf-8'))
 roles={k:{i for r in recipes for g in r[k] for i in g['items']} for k in ('requires','excluded')}
 ids=sorted(roles['requires'] | roles['excluded'])
 ingredients=[]
 for i in ids:
  en=i.removeprefix('kyno_').removeprefix('tag_').replace('_',' ').title()
  ingredients.append({'id':i,'english':en,'label':labels.get(i,en),'kind':'category' if i.startswith('tag_') else 'ingredient','image':icon_path(i),'roles':[k for k in roles if i in roles[k]]})
 ingredients.sort(key=lambda i:(i['kind']!='category',i['label']))
 data={'recipes':recipes,'ingredients':ingredients}
 for r in recipes:
  assert (ROOT/'assets/foods_cookpot'/f'{r["name"]}.png').exists(),r['name']
  for k in ('requires','excluded'):
   for g in r[k]:
    for i in g['items']:assert (ROOT/icon_path(i)).exists(),i
 (ROOT/'data.js').write_text('window.RECIPE_DATA = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
 print(f"{len(recipes)} recipes / {len(roles['requires'])} require / {len(roles['excluded'])} exclude options ready")
if __name__=='__main__':main()
