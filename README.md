# tcm-bar

macOS 桌面小组件 **岐黄小助手** 🍃 —— 每日养生提醒，中医智慧浮于桌面。

> **声明：纯属自己玩玩，Just for fun。不构成医疗建议。**

![macOS](https://img.shields.io/badge/macOS-only-blue) ![Übersicht](https://img.shields.io/badge/Übersicht-widget-purple) ![License](https://img.shields.io/badge/license-MIT-gray)

## 效果

桌面右上角常驻毛玻璃卡片，显示：

```
🍃 岐黄小助手              2026-02-24 星期二
                            丙午年正月初八

3°C  薄雾  💧93%  🌬4km/h

──────────────────────────────────────
雨水                        春季

   初候 · 獭祭鱼 — 鱼肥而出，獭先祭后食
▸ 二候 · 候雁北 — 自南而北也
   三候 · 草木萌动 — 是为可耕之候

──────────────────────────────────────
《黄帝内经》春季养生

「春三月，此谓发陈，天地俱生，万物以荣...」

😴 夜卧早起，披散头发          😊 保持愉悦，多给予少索取
🏃 庭院散步，舒展身体          🥗 宜甘淡，少酸涩

──────────────────────────────────────
☯ 水运太过 · 少阴君火    ⭐ 觜火猴（西宫白虎）
```

## 数据内容

每天 7:00 自动更新：
- 📅 农历 / 干支纪年
- 🌤 实时天气（西安）
- 🌿 二十四节气 + 七十二物候
- 📜 《黄帝内经》当季养生原文与起居指导
- ☯️ 五运六气分析
- ⭐ 二十八星宿与养生建议

## 适用环境

| 条件 | 要求 |
|------|------|
| 系统 | **macOS** 10.10+ |
| 依赖 | [Übersicht](http://tracesof.net/uebersicht/) 桌面组件引擎 |
| 网络 | SSH 访问数据源服务器（Tailscale 内网） |

⚠️ 需自行搭建后端数据源，或修改 `fetch_tcm.sh` 指向自己的服务器。

## 安装

```bash
# 1. 安装 Übersicht
brew install --cask ubersicht
# 或从官网下载: http://tracesof.net/uebersicht/

# 2. 克隆仓库
git clone https://github.com/shaoguos/tcm-bar.git
cd tcm-bar

# 3. 修改 fetch_tcm.sh 中的 SSH 地址为你自己的服务器
vim fetch_tcm.sh

# 4. 链接组件到 Übersicht
ln -s "$(pwd)/tcm-widget.widget" ~/Library/Application\ Support/Übersicht/widgets/tcm-widget.widget

# 5. 打开 Übersicht，桌面即出现组件
open -a Übersicht
```

## 文件说明

```
tcm-bar/
├── tcm-widget.widget/
│   └── index.jsx          # Übersicht 桌面组件（JSX + CSS）
├── fetch_tcm.sh           # SSH 数据拉取脚本
└── README.md
```

## 技术细节

- **桌面引擎**: [Übersicht](http://tracesof.net/uebersicht/) — HTML/CSS/JS 渲染的 macOS 桌面组件
- **数据传输**: SSH + `cat latest.json`（轻量，无需 HTTP 服务）
- **刷新频率**: 每 30 分钟
- **视觉**: 毛玻璃背景 + 暗色主题，与 macOS 桌面融合

## License

MIT
