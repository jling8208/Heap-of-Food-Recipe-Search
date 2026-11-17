# Heap of Food Recipe Search

一個用食材搜尋《Don't Starve Together》**Heap of Foods** 模組料理的繁中／英文網站，支援必要食材（Require）與排除食材（Exclude）的多選篩選。**[點此開啟網站](https://jling8208.github.io/Heap-of-Food-Recipe-Search/)**。

## 食譜分類與 Side Effect

| 分類 | 料理數 |
| --- | ---: |
| Crock Pot（烹飪鍋） | 188 |
| Chef’s Specials（主廚特餐） | 29 |
| Wooden Keg（精釀桶） | 70 |
| Preserves Jar（罐頭瓶） | 95 |

點上方設備分頁可切換，切換時清除上一分類的篩選。每類都有獨立的 Require／Exclude 選項、搜尋、排序與結果數，網址會保留設備及篩選狀態。

93 道料理有原站標記的 Side Effect。卡片與「詳細條件」會依介面語言顯示詳細中文效果或對應的完整英文翻譯；原站的簡短英文仍保留在資料檔供查證與搜尋。可勾選「有 Side Effect」或搜尋中英文效果文字。額外效果包含增益與負面作用，不一定都是負面效果。未標記的料理顯示「原站未標示額外效果」，不推定它一定沒有任何作用。

## 使用方式

- **Require**：找出需求欄包含所選食材的料理。
- **Exclude**：找出排除欄包含所選食材的料理，包含有數量限制的條件。
- 右上角「語言」可切換繁體中文／English；繁中料理名稱取自模組的繁中名稱表，兩種語言都能搜尋料理名稱。
- 兩區各可選「同時包含」或「任一包含」；兩區之間取交集。
- 支援食材中文、英文與 ID 搜尋，以及料理名稱搜尋、分類和數值排序。
- 點料理卡上的食材可加入篩選；點已選標籤的 × 可移除，或按「全部重設」清除。
- 「詳細條件」可查看完整需求、排除條件與原站連結；網址會保留目前的篩選條件。

例如：Require 選「蔬菜」，Exclude 選「不可食用」，即可列出需求欄含蔬菜、且排除欄含不可食用材料的料理。

篩選以食譜列出的條件為準：食材類別與具體食材分開比對，同組的替代食材皆可命中。這個網站不計算四格烹飪結果；排除欄有數量門檻時，請查看詳細條件。

## 離線使用

下載並解壓縮完整專案，用 Chrome、Edge 或 Firefox 開啟 `index.html` 即可，無須安裝套件或啟動伺服器。請保留其他檔案與 `assets/` 的相對位置。

## 修改與維護

| 檔案 | 用途 |
| --- | --- |
| `ingredient-labels.json` | 已校正的食材與類別中文名稱 |
| `recipe-names-zht.json` | 從模組匯入的繁中料理名稱，覆蓋四種設備的全部食譜 |
| `ingredient-labels-en.json` | 從模組匯入的英文食材名稱 |
| `import_mod_names.py` | 從本機 Heap of Foods 模組更新上述名稱表 |
| `recipes.json` | 原有烹飪鍋資料（保留人工修改） |
| `recipes-warly.json` / `recipes-keg.json` / `recipes-jar.json` | 三個新增設備的食譜 |
| `side-effects.json` | 以「設備 ID:料理 ID」索引的詳細中英文效果、原站簡短英文與來源 |
| `ingredient-labels-extra.json` | 新食材的補充翻譯；同名項目以原有名稱表為準 |
| `build_data.py` | 將 JSON 轉為網頁使用的資料 |
| `data.js` | 生成的網頁資料，需與 JSON 一起更新 |
| `app.js` / `engine.js` | 介面互動／篩選邏輯 |
| `styles.css` | 配色、字體與版面 |
| `assets/` | 料理、食材與狀態圖示 |

模組更新名稱後，可先執行 `python import_mod_names.py --mod-root "D:\SteamLibrary\steamapps\workshop\content\322330\2334209327" --game-scripts "D:\SteamLibrary\steamapps\common\Don't Starve Together\data\databundles\scripts.zip"`，再執行 `python build_data.py` 更新 `data.js`。`--game-scripts` 用來補齊遊戲本體食材的正式英文名稱；不提供時仍可匯入模組名稱。匯入時會檢查每道料理是否有繁中名稱。

修改 JSON 後，在本資料夾執行：

```powershell
py build_data.py
```

macOS/Linux 使用 `python3 build_data.py`。只需 Python 標準函式庫，不必安裝 pip 套件。完成後重新整理網頁，並將修改過的 JSON 與新生成的 `data.js` 一起提交。

Require 選項取自 `requires[].items`，Exclude 選項取自 `excluded[].items`；名稱表只負責翻譯，不會自行新增篩選條件。新增食材時也要加入對應圖示。

## 資料來源

- 食譜：[Heap of Foods — Crock Pot](https://heap-of-foods.com/recipes_cookpot)，Crock Pot 保留原有 188 道；加上以下三個分類，共 382 道。
- [Heap of Foods Steam 工作坊](https://steamcommunity.com/sharedfiles/filedetails/?id=2334209327)。

遊戲/模組版本不同時，食譜條件可能有所差異。本專案為非官方查詢工具；料理與食材圖示等素材的權利屬 Kyno/Heap of Foods、Klei Entertainment 及其他原權利人。

## 新分類資料備註

新增食譜來自原站 [Chef’s Specials](https://heap-of-foods.com/recipes_warly)、[Wooden Keg](https://heap-of-foods.com/recipes_keg)、[Preserves Jar](https://heap-of-foods.com/recipes_jar)。效果英文保留原站 `recipes_debuff` 供比對；中文效果已於 2026-11-11 依本機模組 7.9-B 與遊戲 build 762172 程式逐項查證，補入時間、數量、倍率及例外條件。這是原始碼靜態查證，並非遊戲內實測；未找到額外機制的趣味描述不補猜測數值。

`build_data.py` 將四份食譜與效果資料合併為 `data.js`，不回寫任何食譜 JSON 或名稱表。新增來源未列 `spoilageDays` 時，以原站使用的 480 秒／遊戲天換算。圖片路徑按設備分開，料理以設備與名稱的複合 ID 識別，避免不同設備同名衝突。資料匯入紀錄見 `sources/expansion-2026-11-10.json`。

## 檢查篩選邏輯

有安裝 Node.js 時可執行 `node tests/filter.test.cjs`，檢查四分類的數量、Require／Exclude 交集、效果篩選與搜尋、料理 ID 和圖片檔案。

## 詳細效果與來源查證

已檢查原站標記 Side Effect 的全部 93 道料理：89 項有程式依據、3 項未找到額外食用機制、1 項（Jawsbreaker 的獨角鯨尋餌條件）有疑似程式問題，已明確註記。說明顯示未加香料、預設設定的效果；咖啡設定、角色能力、運氣與其他模組可能改變實際結果。

- [逐項中文查證紀錄](SIDE-EFFECTS-AUDIT.md)：說明、差異與來源路徑。
- [來源行號與 SHA-256](sources/side-effects-audit-2026-11-11.json)：記錄版本、常數與 80 個來源檔案的指紋。
- 修改效果時，編輯 `side-effects.json` 對應項目的 `zh`（詳細中文）或 `en`（完整英文翻譯），再執行 `python build_data.py`。`source_en` 保留原網站的簡短英文標籤，供查證與搜尋。建置程式會用 `.data-build.sha256` 檢查整份 `data.js` 是否在上次建置後被手動修改；若有，會停止，不會覆蓋。正常重建前也會把舊版存進 `data-build-backups/`。若修正了查證結論，也需同步更新查證紀錄。
- 執行 `node tests/effects.test.cjs` 可檢查效果資料、生成結果與查證紀錄是否同步。

模組或遊戲更新後，可用 Python 標準函式庫確認來源是否變動：

```powershell
py verify_effect_sources.py --mod-root "D:\SteamLibrary\steamapps\workshop\content\322330\2334209327" --game-scripts "D:\SteamLibrary\steamapps\common\Don't Starve Together\data\databundles\scripts.zip"
```

若來源改變，程式會列出需要重新檢查的檔案，不會自動覆寫中文翻譯或效果說明。
