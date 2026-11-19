# Side Effect 逐項查證紀錄

查證日期：2026-11-11。模組 **7.9-B**，本機遊戲 build **762172**。

逐項追蹤食譜觸發函式、效果 prefab、postinit 與 TUNING；依本機原始碼靜態查證，未宣稱已在遊戲內實測。

原站標示 Side Effect 的 93 道料理；數值為未加香料的預設效果，非所有食物的完整附帶機制清單。

數值與效果已寫入 `side-effects.json` 的 `zh`，原站英文保留供比對。各來源檔案 SHA-256、食譜行號、使用的數值常數與程式差異見 [機器可讀查證紀錄](sources/side-effects-audit-2026-11-11.json)。路徑以模組根目錄或遊戲 `scripts.zip` 為基準。

## 數值適用範圍

- 伺服器可變更咖啡加速與持續時間；舊版速度設定不同。
- 香料、角色技能、裝備、其他模組及世界設定可能影響結果。
- 數值型持續增益通常刷新時間；隨機效果、即時事件與傳送應依各項說明。
- 基礎機率不含玩家運氣修正；機率公式來源另列。
- 來源中的 spoiler 表示加速腐敗，不是保鮮。
- 原站有部分趣味描述，無對應食用增益者明確註明；不自行補數值。

## 食譜數值勘誤（非 Side Effect）

### cookpot:gorge_grilled_cheese（Grilled Cheese／烤奶酪）

這道料理沒有額外副作用（`debuff = false`）。修正前，搜尋網頁的數值與目前安裝的 Heap of Foods 7.9-B 模組食譜不同：

| 數值 | 修正前搜尋網頁 | 模組食譜／修正後搜尋網頁 |
| --- | ---: | ---: |
| 生命值 | +60 | +40 |
| 飽食度 | +56.25 | +32.5 |
| 理智值 | +40 | +15 |

模組的 `scripts/hof_foodrecipes.lua:1038–1053` 明確設定 `health = 40`、`hunger = 32.5`、`sanity = 15`。2026-11-19 已同步修正本專案的 `recipes.json` 與 `data.js`；玩家吃下後回復 40 生命值，與模組設定一致。[原站食譜頁](https://heap-of-foods.com/recipes_cookpot?recipe=gorge_grilled_cheese)的內容不受本專案修改影響。

## 逐項結果

### cookpot:coffee

提升移速 50%，持續 480 秒。同時增加 10 點睡眠抗性。

來源：`mod:scripts/hof_foodrecipes.lua:4`、`mod:postinit/prefabs/foodbuffs.lua`、`mod:scripts/prefabs/k_foodbuff_coffee.lua`、`mod:scripts/hof_util.lua`、`base:scripts/tuning.lua`、`mod:modinfo.lua`。

### cookpot:sharkfinsoup

食用後在附近尋找生成位置並召出 1 隻坎普斯；找不到可生成位置時不會召出。

查證備註：原站寫增加淘氣值；本機 OnFoodNaughtiness 直接生成 krampus，未修改淘氣值。

來源：`mod:scripts/hof_foodrecipes.lua:66`、`mod:scripts/hof_util.lua`。

### cookpot:tropicalbouillabaisse

提升移速 50%，預設持續 480 秒；舊版速度設定為提升 83%，持續時間可由模組設定調整。需啟用咖啡加速選項。同時增加 10 點睡眠抗性。再次食用會刷新持續時間。

來源：`mod:scripts/hof_foodrecipes.lua:89`、`mod:postinit/prefabs/foodbuffs.lua`、`mod:scripts/prefabs/k_foodbuff_coffee.lua`、`mod:scripts/hof_util.lua`、`base:scripts/tuning.lua`、`mod:modinfo.lua`。

### cookpot:snakebonesoup

對蠕蟲及蠕蟲頭目身體節的傷害提高 50%，持續 720 秒。再次食用會刷新持續時間。

來源：`mod:scripts/hof_foodrecipes.lua:248`、`mod:scripts/prefabs/k_foodbuff_mobs.lua`。

### cookpot:gorge_carrot_cake

「蛋糕是個謊言」為趣味描述；本機版本未找到對應的額外食用效果，不填入推測數值。

查證備註：已查食譜及全模組該料理 ID 的引用，沒有對應的額外食用函式。

來源：`mod:scripts/hof_foodrecipes.lua:648`。

### cookpot:gorge_garlicbread

每 10 秒使半徑 10 單位內的蝙蝠放棄攻擊；能恐慌的蝙蝠會恐慌 6 秒。效果持續 480 秒。

來源：`mod:scripts/hof_foodrecipes.lua:686`、`mod:scripts/prefabs/k_foodbuff_panic.lua`。

### cookpot:gorge_candy

加快採集、收穫、取物、拆解與一般製作動作，持續 480 秒；依動作切換為短／中等動作動畫，並非統一工作速度倍率。

來源：`mod:scripts/hof_foodrecipes.lua:941`、`mod:scripts/prefabs/k_foodbuff_haste.lua`、`mod:postinit/stategraphs/SGwilson.lua`。

### cookpot:cucumbersalad

清除潮濕並保持乾燥，持續 300 秒。再次食用會刷新持續時間。

來源：`mod:scripts/hof_foodrecipes.lua:1434`、`base:scripts/prefabs/foodbuffs.lua`、`base:scripts/components/moistureimmunity.lua`、`base:scripts/components/moisture.lua`。

### cookpot:bowlofgears

僅 WX-78：立即補充 100 點電量，受角色電量上限限制。不是永久增加屬性上限。

來源：`mod:scripts/hof_foodrecipes.lua:1478`。

### cookpot:longpigmeal

食用本身扣除 100 點生命與 300 點理智（即卡片列出的數值），沒有另計的持續扣血效果。

查證備註：食譜沒有額外 oneatenfn；不將基礎負值重複算成副作用。

來源：`mod:scripts/hof_foodrecipes.lua:1506`。

### cookpot:duckyouglermz

僅具開花能力的植物角色：增加 3 點開花肥力，並額外恢復 60 點生命；食物治療疲勞期間不會恢復生命。

來源：`mod:scripts/hof_foodrecipes.lua:1527`。

### cookpot:eyeballspaghetti

啟用巨獸召喚設定時，食用後嘗試在約 40 單位外召出 1 隻獨眼巨鹿；當前世界已有獨眼巨鹿或找不到落點時不召出。

來源：`mod:scripts/hof_foodrecipes.lua:1658`、`mod:postinit/prefabs/foodbuffs.lua`、`mod:modinfo.lua`。

### cookpot:soulstew

沃拓克食用：飽食 +150。善良傾向為生命 +30、理智 −25；淘氣傾向為生命 +15、理智 +25；其他傾向為生命 +30、理智 −15。食物治療疲勞期間不執行生命與理智變化。

來源：`mod:scripts/hof_foodrecipes.lua:1676`。

### cookpot:fortunecookie

每次食用有 5% 機率觸發特殊命運：觸發後基礎 33% 機率為好運，生命、飽食與理智各增加 9999（受上限限制）；其餘為厄運，生命設為 20%，飽食與理智各扣 9999。好運分支機率受運氣影響；未觸發時只說出籤文。

來源：`mod:scripts/hof_foodrecipes.lua:1726`、`mod:scripts/hof_util.lua`、`mod:scripts/hof_util_luck.lua`。

### cookpot:honeyjar

蜜蜂不會主動以你為目標，持續 720 秒。一般蜂箱採蜜不驚動蜜蜂，並額外恢復 2 點理智；蜂箱部分受相容模組影響。

來源：`mod:scripts/hof_foodrecipes.lua:1848`、`mod:scripts/prefabs/k_foodbuff_beefriendly.lua`、`mod:postinit/prefabs/bee.lua`、`mod:postinit/prefabs/beebox.lua`、`mod:postinit/prefabs/wasphive.lua`。

### cookpot:watercup

立即移除可清除的增益與減益；不會清除食物治療疲勞或沃拓克的排簫增益。也不會撤銷已發生的直接傷害或召喚。

查證備註：RemoveAllDebuffs 有黑名單，不能寫成無條件清除所有效果。

來源：`mod:scripts/hof_foodrecipes.lua:1871`、`mod:postinit/components/debuffable.lua`。

### cookpot:poisonfrogglebunwich

獲得青蛙仇恨免疫，持續 480 秒。再次食用會刷新持續時間。

來源：`mod:scripts/hof_foodrecipes.lua:1917`、`mod:scripts/prefabs/k_foodbuff_frog.lua`。

### cookpot:gummybeargers

啟用巨獸召喚設定時，食用後嘗試在約 40 單位外召出 1 隻熊獾；當前世界已有熊獾或找不到落點時不召出。

來源：`mod:scripts/hof_foodrecipes.lua:2100`、`mod:postinit/prefabs/foodbuffs.lua`、`mod:modinfo.lua`。

### cookpot:gummyworms

提供夜視 480 秒，並將昏沉程度提高至至少 1.5（這是程度值，不是秒數）。再次食用會刷新持續時間。

來源：`mod:scripts/hof_foodrecipes.lua:2119`、`mod:scripts/prefabs/k_foodbuff_nightvision.lua`。

### cookpot:sea_pudding

釣到魚時額外獲得 1 條同種魚，並有基礎 33% 機率再多 1 條；持續 720 秒。池塘釣魚的額外機率受運氣影響。

查證備註：海釣額外機率呼叫使用未定義的 inst，而非 fisher；因此不宣稱海釣機率能正確讀取玩家運氣。

來源：`mod:scripts/hof_foodrecipes.lua:2354`、`mod:scripts/prefabs/k_foodbuff_fishing.lua`、`mod:postinit/components/fishingrod.lua`、`mod:postinit/components/oceanfishingrod.lua`、`mod:scripts/hof_util_luck.lua`。

### cookpot:parznip_soup

進食改用快速進食動作，持續 720 秒；不提高食物數值，也不改變飢餓消耗速度。

查證備註：效果為 fasteater，並非加速消化或提高飢餓消耗。

來源：`mod:scripts/hof_foodrecipes.lua:2431`、`mod:scripts/prefabs/k_foodbuff_haste.lua`、`mod:postinit/stategraphs/SGwilson.lua`。

### cookpot:livingsandwich

砍倒支援的未燒毀樹木可獲額外木材，依樹種與階段決定；例如常青樹小／中／大階段額外 +1／+2／+3 木頭。持續 480 秒，伍迪為 960 秒；伍迪食用亦指定海狸變身。

查證備註：木材加成不是統一砍伐速度倍率；were_mode 在食物生成器套用。

來源：`mod:scripts/hof_foodrecipes.lua:2661`、`mod:scripts/prefabs/k_foodbuff_woodcutter.lua`、`mod:postinit/prefabs/evergreens.lua`、`mod:scripts/prefabs/k_newfoods.lua`。

### cookpot:lunarsoup

清除昏沉並增加 10 點睡眠抗性；免疫理智光環、黑暗與玩家幽靈造成的理智流失，並免除魔法裝備的理智效果。兩種增益各持續 480 秒。

來源：`mod:scripts/hof_foodrecipes.lua:2695`、`mod:scripts/prefabs/k_foodbuff_fear.lua`、`base:scripts/prefabs/foodbuffs.lua`。

### cookpot:meatwaltz

僅具戰鬥靈感能力的角色（如薇格弗德）：立即增加 40 點靈感，受上限限制。

來源：`mod:scripts/hof_foodrecipes.lua:2980`。

### cookpot:completebreakfast

僅具力量值能力的角色（如沃爾夫岡）：立即增加 50 點力量值，受上限限制。

來源：`mod:scripts/hof_foodrecipes.lua:3003`。

### cookpot:crabkingfeast

對帝王蟹、帝王蟹盟友及具螃蟹標籤生物的傷害提高 50%，持續 720 秒。

來源：`mod:scripts/hof_foodrecipes.lua:3063`、`mod:scripts/prefabs/k_foodbuff_mobs.lua`。

### cookpot:sharksushi

食用後在附近尋找生成位置並召出 1 隻坎普斯；找不到可生成位置時不會召出。

查證備註：原站寫增加淘氣值；本機 OnFoodNaughtiness 直接生成 krampus，未修改淘氣值。

來源：`mod:scripts/hof_foodrecipes.lua:3140`、`mod:scripts/hof_util.lua`。

### cookpot:fltsandwich

位面防禦增加 10 點，持續 480 秒；不是減傷 10%。

來源：`mod:scripts/hof_foodrecipes.lua:3369`、`mod:scripts/prefabs/k_foodbuff_planardefense.lua`。

### cookpot:trufflesgrinder

持續 240 秒：每秒招募半徑 12 單位內尚無主人的普通豬人（總隨從少於 10 時），並為已有豬人隨從增加 3 秒忠誠時間。魚人或怪物角色不生效。

來源：`mod:scripts/hof_foodrecipes.lua:3412`、`mod:scripts/prefabs/k_foodbuff_truffles.lua`。

### cookpot:sporecappie

免疫孢子毒雲，但直接攜帶的易腐食物腐敗速度乘 1.5，持續 480 秒。怪物角色食用時額外補回 20 點生命與 10 點理智；食物治療疲勞期間不補回。

來源：`mod:scripts/hof_foodrecipes.lua:3437`、`mod:scripts/prefabs/k_foodbuff_poisonimmunity.lua`、`base:scripts/components/perishable.lua`。

### cookpot:sporecap_skewers

免疫酸雨，但直接攜帶的易腐食物腐敗速度乘 1.5，持續 480 秒。怪物角色食用時額外補回 30 點生命與 20 點理智；食物治療疲勞期間不補回。

來源：`mod:scripts/hof_foodrecipes.lua:3468`、`mod:scripts/prefabs/k_foodbuff_acidimmunity.lua`、`base:scripts/components/perishable.lua`。

### cookpot:swordfishfeast

「精緻的餐點」為原站描述；本機食譜未設定額外食用增益，沒有可填入的持續時間或倍率。

查證備註：有交易用途與高基礎數值，但不能據此捏造食用 buff。

來源：`mod:scripts/hof_foodrecipes.lua:3499`。

### cookpot:monkeyislandmeal

身上帶有詛咒猴子代幣時，立即移除最多 999 層猴子詛咒。

來源：`mod:scripts/hof_foodrecipes.lua:3518`。

### cookpot:brainmettersoup

製作可放入容器的物品時，基礎 10% 機率額外產生 1 個同款物品，持續 240 秒。機率受運氣影響，上限 50%；商店、交易及寄居蟹交易等配方不適用。

來源：`mod:scripts/hof_foodrecipes.lua:3550`、`mod:scripts/prefabs/k_foodbuff_crafting.lua`、`mod:scripts/hof_util_luck.lua`。

### cookpot:chickenwings

攻擊傷害提高 30%，但受到的一般傷害也提高 35%，持續 480 秒。

來源：`mod:scripts/hof_foodrecipes.lua:3590`、`mod:scripts/prefabs/k_foodbuff_berserker.lua`、`base:scripts/components/health.lua`。

### cookpot:chickenrotisserie

飢餓自然消耗速度降低 25%，持續 480 秒。再次食用會刷新持續時間。

來源：`mod:scripts/hof_foodrecipes.lua:3665`、`mod:scripts/prefabs/k_foodbuff_hunger.lua`。

### cookpot:cavetubertea

採集支援植物時複製一次採集產物（保留堆疊數量）；使用收穫動作則額外取得 1 個產物，持續 480 秒。巨型作物及排除清單中的植物不適用。

來源：`mod:scripts/hof_foodrecipes.lua:3686`、`mod:scripts/prefabs/k_foodbuff_greenthumb.lua`。

### cookpot:mandrakepie

使半徑 20 單位內符合條件的生物進入催眠判定，睡眠時間參數為 10 秒；生物睡意 +7，玩家昏沉 +4。實際入睡受抗性影響，冰凍、被困或石化目標不適用。

來源：`mod:scripts/hof_foodrecipes.lua:3711`、`mod:scripts/hof_util.lua`。

### cookpot:rainparfait

下雨或潮濕度 ≥50 時，每 10 秒恢復 1 點理智；效果持續 480 秒。食物治療疲勞期間不恢復。

來源：`mod:scripts/hof_foodrecipes.lua:3738`、`mod:scripts/prefabs/k_foodbuff_wetness.lua`。

### cookpot:midnightfeast

持續 480 秒：夜間每次命中有 20% 機率立即擊殺合格目標。玩家、頭目、馴化生物及切斯特／哈奇／帕奇姆等指定夥伴不適用。

來源：`mod:scripts/hof_foodrecipes.lua:3762`、`mod:scripts/prefabs/k_foodbuff_nightkill.lua`、`mod:scripts/hof_util.lua`。

### cookpot:opalpreciouscream

基礎 10% 機率造成 2.5 倍傷害（額外 +150%），持續 480 秒。暴擊機率受運氣影響，上限 40%。

查證備註：程式實際為 1 + 150/100，不是總傷害 150%。

來源：`mod:scripts/hof_foodrecipes.lua:3841`、`mod:scripts/prefabs/k_foodbuff_critdamage.lua`、`mod:scripts/hof_util_luck.lua`。

### cookpot:catfishstick

運氣值降低 2 點，持續 480 秒；影響模組中使用運氣判定的事件。再次食用會刷新持續時間。

來源：`mod:scripts/hof_foodrecipes.lua:3867`、`mod:scripts/prefabs/k_foodbuff_luck.lua`、`mod:scripts/hof_util_luck.lua`。

### cookpot:jawsbreaker

可投到海上作為誘餌，吸引附近約 15 單位內的岩石大白鯊；被鯊魚吃下後約 1 秒將其擊殺。物品也有獨角鯨食用致死處理，但本機獨角鯨尋餌條件疑似未啟用，不能保證會主動被吸引。

查證備註：gnarwailbrain 的 WhileNode(function() return end) 不回傳真；保留可疑處而不聲稱完整可用。

狀態：程式碼有可疑條件，尚待遊戲內驗證。

來源：`mod:scripts/hof_foodrecipes_items.lua:4`、`mod:scripts/prefabs/k_jawsbreaker.lua`、`mod:postinit/brains/sharkbrain.lua`、`mod:postinit/brains/gnarwailbrain.lua`、`mod:main/misc/hof_stategraphs.lua`。

### warly:bubbletea

清除當前昏沉，增加 10 點睡眠抗性，持續 480 秒。再次食用會刷新持續時間。

來源：`mod:scripts/hof_foodrecipes_warly.lua:133`、`base:scripts/prefabs/foodbuffs.lua`、`base:scripts/components/grogginess.lua`。

### warly:jellybean_sanity

每 2 秒恢復 2 點理智，持續 120 秒；食物治療疲勞期間不恢復。再次食用會刷新持續時間。

來源：`mod:scripts/hof_foodrecipes_warly.lua:182`、`mod:scripts/prefabs/k_foodbuff_sanity.lua`、`base:scripts/tuning.lua`。

### warly:jellybean_hunger

每 2 秒恢復 2 點飽食，持續 120 秒。再次食用會刷新持續時間。

來源：`mod:scripts/hof_foodrecipes_warly.lua:207`、`mod:scripts/prefabs/k_foodbuff_hunger.lua`、`base:scripts/tuning.lua`。

### warly:jellybean_super

每 2 秒恢復生命、飽食、理智各 2 點，持續 120 秒；食物治療疲勞期間只恢復飽食。再次食用會刷新持續時間。

來源：`mod:scripts/hof_foodrecipes_warly.lua:232`、`mod:scripts/prefabs/k_foodbuff_super.lua`、`base:scripts/tuning.lua`。

### warly:berrysundae

增加 120 點隔熱值，持續 240 秒；延緩升溫，不是完全免疫過熱傷害。

來源：`mod:scripts/hof_foodrecipes_warly.lua:257`、`mod:scripts/prefabs/k_foodbuff_temperature.lua`、`base:scripts/tuning.lua`。

### warly:milkshake_prismatic

身體發出彩色光芒，可照亮周圍，持續 240 秒；再次食用刷新時間，不是持續回血。

來源：`mod:scripts/hof_foodrecipes_warly.lua:300`、`mod:scripts/prefabs/k_jellyfish_rainbow_fx.lua`。

### warly:tom_kha_soup

增加 120 點保暖值，持續 240 秒；延緩降溫，不是完全免疫冰凍傷害。

來源：`mod:scripts/hof_foodrecipes_warly.lua:362`、`mod:scripts/prefabs/k_foodbuff_temperature.lua`、`base:scripts/tuning.lua`。

### warly:warlytea

額外以每秒 0.75 點的速度增加理智，持續 240 秒；最終淨變化仍會受到其他理智來源影響。

查證備註：externalmodifiers 是 additive，故 .75 為 +0.75/秒，並非理智消耗乘 0.75。

來源：`mod:scripts/hof_foodrecipes_warly.lua:447`、`mod:scripts/prefabs/k_foodbuff_sanity.lua`、`base:scripts/components/sanity.lua`。

### warly:lazydessert

交給蟻獅作為貢品，可延後發怒 2880 秒（6 個遊戲日），剩餘安撫時間上限也是 2880 秒；這是交付效果，不是吃下後的增益。

來源：`mod:scripts/hof_foodrecipes_warly.lua:473`、`base:scripts/prefabs/antlion.lua`、`mod:postinit/prefabs/antlion.lua`、`base:scripts/tuning.lua`。

### warly:lavaeeggboiled

火焰傷害倍率降為 0，持續 960 秒；不等於免疫環境過熱。薇洛沿用自身火焰抗性。

來源：`mod:scripts/hof_foodrecipes_warly.lua:492`、`mod:scripts/prefabs/k_foodbuff_fireimmunity.lua`。

### warly:tiramisu

提升移速 50%，預設持續 480 秒；舊版速度設定為提升 83%，持續時間可由模組設定調整。需啟用咖啡加速選項。另清除潮濕並保持乾燥 300 秒；關閉咖啡加速時仍保留乾燥效果。

來源：`mod:scripts/hof_foodrecipes_warly.lua:516`、`mod:postinit/prefabs/foodbuffs.lua`、`mod:scripts/prefabs/k_foodbuff_coffee.lua`、`base:scripts/prefabs/foodbuffs.lua`、`base:scripts/components/moistureimmunity.lua`、`mod:modinfo.lua`。

### warly:mandrakebaobuns

每次符合條件的正向治療額外恢復 15 點生命，持續 480 秒。無來源標記的治療、糖豆持續回血、薇格弗德與暗影槌的吸血不觸發；不是治療量乘倍率。

來源：`mod:scripts/hof_foodrecipes_warly.lua:539`、`mod:scripts/prefabs/k_foodbuff_healing.lua`。

### warly:bbqribs

受到擊退時改為較小的落地擊退動作，持續 480 秒；程式沒有固定減少百分比，也不是完全免疫擊退。

來源：`mod:scripts/hof_foodrecipes_warly.lua:583`、`mod:scripts/prefabs/k_foodbuff_knockback.lua`、`mod:postinit/stategraphs/SGwilson.lua`。

### warly:swordfishbluedinner

持續 480 秒：連續命中同一目標 3 次，觸發半徑約 3 單位的冰晶波，對周圍合格敵人造成基礎 30 點傷害；主目標不受這次波及傷害。超過 4 秒未接續或換目標會重算，觸發冷卻 0.3 秒。

查證備註：原站寫 chilled attacks；本機 shard 只呼叫 GetAttacked，未見 AddColdness 或凍結操作，不聲稱附加冰凍。

來源：`mod:scripts/hof_foodrecipes_warly.lua:607`、`mod:scripts/prefabs/k_foodbuff_chilled.lua`、`mod:scripts/prefabs/k_chilled_shard.lua`。

### warly:opalpreciouslollipop

隨機取得效果清單中的 1 種增益或減益，強度與時間依抽中的效果決定；再次食用會替換上次抽中的效果。另外有基礎 1% 機率立即致死，機率受運氣影響；具有賭博免死標記時不觸發此致死判定。

來源：`mod:scripts/hof_foodrecipes_warly.lua:632`、`mod:scripts/prefabs/k_foodbuff_random.lua`、`mod:scripts/hof_util_luck.lua`。

### keg:beer

攻擊傷害提高 20%，同時移速降低 30%，持續 480 秒；再次食用刷新時間。

來源：`mod:scripts/hof_brewrecipes_keg.lua:1048`、`mod:scripts/prefabs/k_foodbuff_strength.lua`、`mod:scripts/hof_util.lua`。

### keg:paleale

攻擊傷害提高 50%，同時移速降低 30%，持續 520 秒；再次食用刷新時間。

來源：`mod:scripts/hof_brewrecipes_keg.lua:1072`、`mod:scripts/prefabs/k_foodbuff_strength.lua`、`mod:scripts/hof_util.lua`。

### keg:mead

受到的一般傷害降低 1/3（約 33.3%），同時移速降低 30%，持續 480 秒；再次食用刷新時間。

來源：`mod:scripts/hof_brewrecipes_keg.lua:1096`、`mod:scripts/prefabs/k_foodbuff_defense.lua`、`base:scripts/tuning.lua`、`base:scripts/components/health.lua`、`mod:scripts/hof_util.lua`。

### keg:teagreen

每 2 秒恢復 2 點理智，持續 120 秒；食物治療疲勞期間不恢復。再次食用會刷新持續時間。

來源：`mod:scripts/hof_brewrecipes_keg.lua:1121`、`mod:scripts/prefabs/k_foodbuff_sanity.lua`、`base:scripts/tuning.lua`。

### keg:teared

每 2 秒恢復 2 點生命，持續 120 秒。再次食用會刷新持續時間。

來源：`mod:scripts/hof_brewrecipes_keg.lua:1143`、`base:scripts/prefabs/healthregenbuff.lua`、`base:scripts/tuning.lua`。

### keg:piraterum

對具海盜標籤的敵人傷害提高 50%，持續 720 秒。

來源：`mod:scripts/hof_brewrecipes_keg.lua:1165`、`mod:scripts/prefabs/k_foodbuff_mobs.lua`。

### keg:twistedtequila

食用後進入傳送流程，傳送至隨機可用位置；目的地會受小遊戲或指定傳送點覆寫。昏沉程度至少提高至 1.5（不是 1.5 秒）。

來源：`mod:scripts/hof_brewrecipes_keg.lua:1199`、`mod:scripts/hof_util.lua`。

### keg:nukacola_quantum

身體發光並照亮周圍，持續 960 秒；再次食用刷新時間。另有基礎 5% 機率取得 1 個瓶蓋，機率受運氣影響。

來源：`mod:scripts/hof_brewrecipes_keg.lua:1257`、`base:scripts/prefabs/wormlight.lua`、`mod:scripts/hof_util_luck.lua`。

### keg:nukacola_dark

生命上限增加 30，持續 480 秒；套用時保留當前生命比例，結束後撤回上限加成。另有基礎 5% 機率取得 1 個瓶蓋，機率受運氣影響。

來源：`mod:scripts/hof_brewrecipes_keg.lua:1309`、`mod:scripts/prefabs/k_foodbuff_maxstats.lua`、`mod:scripts/hof_util_luck.lua`。

### keg:nukacola_twist

生命、飽食與理智上限各增加 15，持續 480 秒；套用時保留各項當前比例，結束後撤回上限加成。另有基礎 5% 機率取得 1 個瓶蓋，機率受運氣影響。

來源：`mod:scripts/hof_brewrecipes_keg.lua:1343`、`mod:scripts/prefabs/k_foodbuff_maxstats.lua`、`mod:scripts/hof_util_luck.lua`。

### keg:nukacola_bramble

受攻擊時釋放半徑約 3 單位的荊棘波，對合格敵人造成基礎約 22.67 點傷害，觸發冷卻 0.3 秒；持續 480 秒。另有基礎 5% 機率取得瓶蓋，機率受運氣影響。

來源：`mod:scripts/hof_brewrecipes_keg.lua:1623`、`mod:scripts/prefabs/k_foodbuff_thorns.lua`、`mod:scripts/prefabs/k_bramblefx.lua`、`base:scripts/tuning.lua`、`mod:scripts/hof_util_luck.lua`。

### keg:nukashine

提供夜視、攻擊傷害 +50%、移速 −30%，並額外每分鐘流失約 1.33 點理智；持續 520 秒，再次食用重設時間。效果移除時觸發斷片傳送；不是隨機機率才傳送。

查證備註：OnDetached 無機率判定，清除效果也會呼叫傳送；實際落點受傳送覆寫影響。

來源：`mod:scripts/hof_brewrecipes_keg.lua:1377`、`mod:scripts/prefabs/k_foodbuff_nukashine.lua`、`base:scripts/tuning.lua`。

### keg:ricesake

受到的一般傷害降低 1/3（約 33.3%），同時移速降低 30%，持續 480 秒；再次食用刷新時間。

來源：`mod:scripts/hof_brewrecipes_keg.lua:1402`、`mod:scripts/prefabs/k_foodbuff_defense.lua`、`base:scripts/tuning.lua`、`base:scripts/components/health.lua`、`mod:scripts/hof_util.lua`。

### keg:coffee_mocha

提升移速 50%，預設持續 480 秒；舊版速度設定為提升 83%，持續時間可由模組設定調整。需啟用咖啡加速選項。同時飢餓消耗降低 25%，並增加 10 點睡眠抗性；這些效果共用咖啡持續時間。

來源：`mod:scripts/hof_brewrecipes_keg.lua:1427`、`mod:postinit/prefabs/foodbuffs.lua`、`mod:scripts/prefabs/k_foodbuff_coffee.lua`、`mod:modinfo.lua`、`base:scripts/tuning.lua`。

### keg:toadstoolcola

對魚人、青蛙與毒菌蟾蜍的傷害提高 100%（2 倍），持續 960 秒。

來源：`mod:scripts/hof_brewrecipes_keg.lua:1449`、`mod:scripts/prefabs/k_foodbuff_mobs.lua`。

### keg:souljuice

沃拓克食用：飽食 +100；善良傾向生命 +40、理智 −30，淘氣傾向生命 +20、理智 +30，其他傾向生命 +40、理智 +20。另持續 480 秒，沃拓克被判定為靈魂來源時，目標的靈魂產量 +1；殺死背包內生物亦有額外靈魂處理；食物治療疲勞期間不執行生命與理智變化。

來源：`mod:scripts/hof_brewrecipes_keg.lua:1545`、`mod:scripts/prefabs/k_foodbuff_soul.lua`、`mod:postinit/prefabs/characters.lua`、`mod:postinit/prefabs/wortox_soul_common.lua`。

### keg:lunartequila

強制進入啟蒙狀態，持續 480 秒；此效果本身不是定時回復理智。

來源：`mod:scripts/hof_brewrecipes_keg.lua:1492`、`mod:scripts/prefabs/k_foodbuff_enlightenment.lua`。

### keg:mimicmosa

隱匿存在，持續 480 秒；攻擊或投擲會暫時解除隱匿，10 秒後恢復。亦有不觸發陷阱及不驚嚇獵物的標記；不是無敵。

來源：`mod:scripts/hof_brewrecipes_keg.lua:1519`、`mod:scripts/prefabs/k_foodbuff_stealth.lua`。

### keg:wine_glowberry

身體發光並照亮周圍，持續 960 秒；再次食用刷新時間。此效果不會持續回血。

來源：`mod:scripts/hof_brewrecipes_keg.lua:178`、`base:scripts/prefabs/wormlight.lua`。

### keg:wine_nightberry

提供夜視 480 秒，並將昏沉程度提高至至少 1.5（這是程度值，不是秒數）。再次食用會刷新持續時間。

來源：`mod:scripts/hof_brewrecipes_keg.lua:284`、`mod:scripts/prefabs/k_foodbuff_nightvision.lua`。

### keg:juice_mooncap

清除當前昏沉，增加 10 點睡眠抗性，持續 480 秒。再次食用會刷新持續時間。

來源：`mod:scripts/hof_brewrecipes_keg.lua:615`、`base:scripts/prefabs/foodbuffs.lua`、`base:scripts/components/grogginess.lua`。

### jar:mayonnaise

每 2 秒恢復 2 點飽食，持續 120 秒。再次食用會刷新持續時間。

來源：`mod:scripts/hof_brewrecipes_jar.lua:992`、`mod:scripts/prefabs/k_foodbuff_hunger.lua`、`base:scripts/tuning.lua`。

### jar:mayonnaise_chicken

每 2 秒恢復 2 點飽食，持續 120 秒。再次食用會刷新持續時間。

來源：`mod:scripts/hof_brewrecipes_jar.lua:1017`、`mod:scripts/prefabs/k_foodbuff_hunger.lua`、`base:scripts/tuning.lua`。

### jar:mayonnaise_tallbird

每 2 秒恢復 2 點飽食，持續 120 秒。再次食用會刷新持續時間。

來源：`mod:scripts/hof_brewrecipes_jar.lua:1040`、`mod:scripts/prefabs/k_foodbuff_hunger.lua`、`base:scripts/tuning.lua`。

### jar:mayonnaise_nightmare

每 2 秒失去 10 點理智，持續 120 秒。再次食用會刷新持續時間。

來源：`mod:scripts/hof_brewrecipes_jar.lua:1064`、`mod:scripts/prefabs/k_foodbuff_insanity.lua`、`base:scripts/tuning.lua`。

### jar:tartarsauce

每 2 秒恢復 2 點飽食，持續 120 秒。再次食用會刷新持續時間。

來源：`mod:scripts/hof_brewrecipes_jar.lua:1088`、`mod:scripts/prefabs/k_foodbuff_hunger.lua`、`base:scripts/tuning.lua`。

### jar:agedroe_oceanfish_sturgeon

「精緻的餐點」為原站描述；本機食譜未設定額外食用增益，沒有可填入的持續時間或倍率。

查證備註：有交易用途與高基礎數值，但不能據此捏造食用 buff。

來源：`mod:scripts/hof_brewrecipes_jar.lua:1853`。

### jar:jelly_glowberry

身體發光並照亮周圍，持續 960 秒；再次食用刷新時間。此效果不會持續回血。

來源：`mod:scripts/hof_brewrecipes_jar.lua:170`、`base:scripts/prefabs/wormlight.lua`。

### jar:jelly_nightberry

提供夜視 480 秒，並將昏沉程度提高至至少 1.5（這是程度值，不是秒數）。再次食用會刷新持續時間。

來源：`mod:scripts/hof_brewrecipes_jar.lua:270`、`mod:scripts/prefabs/k_foodbuff_nightvision.lua`。

### jar:pickles_mooncap

清除當前昏沉，增加 10 點睡眠抗性，持續 480 秒。再次食用會刷新持續時間。

來源：`mod:scripts/hof_brewrecipes_jar.lua:571`、`base:scripts/prefabs/foodbuffs.lua`、`base:scripts/components/grogginess.lua`。

### jar:pickles_sporecap

免疫孢子毒雲，持續 720 秒。怪物角色食用時額外補回 20 點生命與 20 點理智；食物治療疲勞期間不補回。

來源：`mod:scripts/hof_brewrecipes_jar.lua:891`、`mod:scripts/prefabs/k_foodbuff_poisonimmunity.lua`、`base:scripts/components/perishable.lua`。

### jar:pickles_sporecap_dark

免疫酸雨，持續 720 秒。怪物角色食用時額外補回 30 點生命與 30 點理智；食物治療疲勞期間不補回。

來源：`mod:scripts/hof_brewrecipes_jar.lua:922`、`mod:scripts/prefabs/k_foodbuff_acidimmunity.lua`、`base:scripts/components/perishable.lua`。

### jar:agedroe_oceanfish_pufferfish

每次食用有基礎 33% 機率立即致死（扣除當前全部生命）；機率受運氣影響，不是固定時間的中毒扣血。

來源：`mod:scripts/hof_brewrecipes_jar.lua:1825`、`mod:scripts/hof_util_luck.lua`。

### jar:agedroe_oceanfish_midnight_carp

免疫黑暗中的查理攻擊，並免除光照不足造成的理智流失，持續 480 秒；不提供照明或夜視。

來源：`mod:scripts/hof_brewrecipes_jar.lua:1802`、`mod:scripts/prefabs/k_foodbuff_darkness.lua`。

### jar:agedroe_jellyfish_rainbow

身體發出彩色光芒，可照亮周圍，持續 240 秒；再次食用刷新時間，不是持續回血。

來源：`mod:scripts/hof_brewrecipes_jar.lua:1358`、`mod:scripts/prefabs/k_jellyfish_rainbow_fx.lua`。
