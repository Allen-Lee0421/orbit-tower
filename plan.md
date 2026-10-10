# Orbit Tower 晶體化營運升級計畫

## Design Read
- artifact: 3D B2B 數位總部展示與轉化頁
- audience: 尋找 AI 網站、知識庫與營運自動化的 B2B 企業決策者
- visual-language: 博物館級黑曜石展櫃 × 藍白去中心化資料矩陣
- mode: extension / preserve
- visual-variance: 8/10
- motion-intensity: 7/10
- information-density: 6/10
- asset-dependence: 8/10（使用既有 3D 晶體單元與使用者提供的水晶展櫃參考）
- brand-fidelity: 8/10

## Design Decisions
- Color palette: 黑曜石背景 `#050510`、亮藍主色 `#00D4FF`、白色玻璃高光；六個樓層使用不同能量色：冰藍、青綠、琥珀、紫羅蘭、珊瑚、電光藍。
- Typography: 延續現有 Inter / Space Grotesk / JetBrains Mono / Noto Sans TC。
- Spacing: 延續 Tailwind 4 與 4px 基準，桌面 HUD 不遮擋中心展品。
- Radius: 展示與控制介面採中等圓角，3D 晶體維持幾何銳利感。
- Motion: 3D 樓層能量帶低頻呼吸、中心節點與晶體核心持續微動；互動使用短距離 easing，不使用干擾閱讀的高速閃爍。
- Interaction: 點擊樓層或單元即聚焦；認知擴散機器人把產品賣點轉為可複製的邀請文案，支援 Clipboard 與 Web Share。

## Implementation
1. 保留既有 `Scene`、`HexTower`、`AIConcierge`、方案與法律模組。
2. 在 `HexTower` 增加逐層固定色彩、樓層能量環與中心矩陣節點視覺。
3. 新增 `CognitiveGrowthBot`，提供目標受眾選擇、推廣文案生成、複製與原生分享。
4. 以可驗證的本地互動完成 MVP；不偽造外部廣告投放、名單或付款結果。
5. 執行 lint、build 與現站 smoke 檢查後，以短 commit 推送，交由既有 Vercel Git 部署。

## Project Structure
- `app/page.tsx`: 首頁組裝與互動狀態
- `components/HexTower.tsx`: 六層晶體大樓與 3D 動態
- `components/CognitiveGrowthBot.tsx`: 推廣文案/分享機器人
- `app/globals.css`: HUD、晶體動畫與響應式規則
- `public/manus-routes.json`: 公開路由宣告
