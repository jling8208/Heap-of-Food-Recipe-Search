"""Build offline data.js while protecting edits to the generated file."""
import datetime,hashlib,json,pathlib
ROOT=pathlib.Path(__file__).resolve().parent
STATIONS=[
 {'id':'cookpot','label':'Crock Pot','zh':'烹飪鍋','file':'recipes.json','folder':'foods_cookpot','icon':'icon_cookpot'},
 {'id':'warly','label':"Chef's Specials",'zh':'主廚特餐','file':'recipes-warly.json','folder':'foods_cookpot_warly','icon':'icon_cookpot_warly'},
 {'id':'keg','label':'Wooden Keg','zh':'精釀桶','file':'recipes-keg.json','folder':'foods_cookpot_keg','icon':'icon_cookpot_keg'},
 {'id':'jar','label':'Preserves Jar','zh':'罐頭瓶','file':'recipes-jar.json','folder':'foods_cookpot_jar','icon':'icon_cookpot_jar'},
]
def read(name):return json.loads((ROOT/name).read_text(encoding='utf-8'))
def icon_path(item):return 'assets/icons/ingredients/'+(item if item.startswith('tag_') else 'ingredient_'+item.removeprefix('kyno_'))+'.png'
def write_protected_data(previous,manifest,backup_dir,new_bytes):
 old_bytes=previous.read_bytes() if previous.exists() else None
 if old_bytes is not None:
  old_hash=hashlib.sha256(old_bytes).hexdigest()
  if manifest.exists() and manifest.read_text(encoding='ascii').strip()!=old_hash:
   raise ValueError('data.js changed since its last build; refusing to overwrite manual edits. Copy them to the source JSON first.')
  if old_bytes!=new_bytes:
   backup_dir.mkdir(exist_ok=True)
   stamp=datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
   backup=backup_dir/f'data-{stamp}-{old_hash[:12]}.js'
   if backup.exists() and backup.read_bytes()!=old_bytes:raise ValueError(f'Backup name collision: {backup}')
   if not backup.exists():backup.write_bytes(old_bytes)
   print(f'Backed up previous data.js to {backup}')
 if old_bytes!=new_bytes:previous.write_bytes(new_bytes)
 manifest.write_text(hashlib.sha256(new_bytes).hexdigest()+'\n',encoding='ascii')
def main():
 labels=read('ingredient-labels.json')
 english_labels=read('ingredient-labels-en.json')
 recipe_names_zh=read('recipe-names-zht.json')
 effects=read('side-effects.json');recipes=[];stations=[]
 for effect_id,effect in effects.items():
  assert all(isinstance(effect.get(k),str) and effect[k].strip() for k in ('zh','en','source_en')),effect_id
 for station in STATIONS:
  rows=read(station['file']);stations.append({**{k:station[k] for k in ['id','label','zh']},'count':len(rows),'image':'assets/icons/misc/'+station['icon']+'.png'})
  for original in rows:
   r=dict(original);r['station']=station['id'];r['id']=station['id']+':'+r['name']
   r['display_name_zh']=recipe_names_zh[r['name']]
   r['image']='assets/'+station['folder']+'/'+r['name']+'.png';r['side_effect']=effects.get(r['id']) if r.get('debuff') else None
   r.setdefault('spoilageDays',r.get('spoilage')/480 if r.get('spoilage') is not None else None)
   if r.get('debuff'):assert r['side_effect'] and r['side_effect']['en'] and r['side_effect']['zh'],r['id']
   recipes.append(r)
 assert len({r['id'] for r in recipes})==len(recipes)
 roles={k:{i for r in recipes for g in r[k] for i in g['items']} for k in ('requires','excluded')}
 ingredients=[]
 for i in sorted(roles['requires']|roles['excluded']):
  en=i.removeprefix('kyno_').removeprefix('tag_').replace('_',' ').title()
  ingredients.append({'id':i,'english':english_labels.get(i,en),'label':labels.get(i,en),'kind':'category' if i.startswith('tag_') else 'ingredient','image':icon_path(i),'roles':[k for k in roles if i in roles[k]],'stations':{k:[s['id'] for s in STATIONS if any(i in g['items'] for r in recipes if r['station']==s['id'] for g in r[k])] for k in ('requires','excluded')}})
 ingredients.sort(key=lambda i:(i['kind']!='category',i['label']))
 data={'recipes':recipes,'ingredients':ingredients,'stations':stations}
 for r in recipes:
  assert (ROOT/r['image']).exists(),r['image']
  for k in ('requires','excluded'):
   for g in r[k]:
    for i in g['items']:assert (ROOT/icon_path(i)).exists(),i
 for s in stations:assert (ROOT/s['image']).exists(),s['image']
 previous=ROOT/'data.js'
 output=('window.RECIPE_DATA = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n').encode('utf-8')
 write_protected_data(previous,ROOT/'.data-build.sha256',ROOT/'data-build-backups',output)
 print(f"{len(recipes)} recipes; "+', '.join(f"{s['id']}={s['count']}" for s in stations)+f"; {sum(bool(r['side_effect']) for r in recipes)} side effects")
if __name__=='__main__':main()
