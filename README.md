# Heap of Food Recipe Search

一個用食材搜尋《Don't Starve Together》**Heap of Foods** 模組料理的繁體中文網站，支援必要食材（Require）與排除食材（Exclude）的多選篩選。**[點此開啟網站](https://jling8208.github.io/Heap-of-Food-Recipe-Search/)**。

## 使用方式

- **Require**：找出需求欄包含所選食材的料理。
- **Exclude**：找出排除欄包含所選食材的料理，包含有數量限制的條件。
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
| `recipes.json` | 料理資料、必要食材與排除條件 |
| `build_data.py` | 將 JSON 轉為網頁使用的資料 |
| `data.js` | 生成的網頁資料，需與 JSON 一起更新 |
| `app.js` / `engine.js` | 介面互動／篩選邏輯 |
| `styles.css` | 配色、字體與版面 |
| `assets/` | 料理、食材與狀態圖示 |

修改 JSON 後，在本資料夾執行：

```powershell
py build_data.py
```

macOS/Linux 使用 `python3 build_data.py`。只需 Python 標準函式庫，不必安裝 pip 套件。完成後重新整理網頁，並將修改過的 JSON 與新生成的 `data.js` 一起提交。

Require 選項取自 `requires[].items`，Exclude 選項取自 `excluded[].items`；名稱表只負責翻譯，不會自行新增篩選條件。新增食材時也要加入對應圖示。

## 資料來源

- 食譜：[Heap of Foods — Crock Pot](https://heap-of-foods.com/recipes_cookpot)，目前收錄 188 道料理。
- [Heap of Foods Steam 工作坊](https://steamcommunity.com/sharedfiles/filedetails/?id=2334209327)。

遊戲/模組版本不同時，食譜條件可能有所差異。本專案為非官方查詢工具；料理與食材圖示等素材的權利屬 Kyno/Heap of Foods、Klei Entertainment 及其他原權利人。
