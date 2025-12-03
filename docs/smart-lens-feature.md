# Smart Lens - 智能链接预览

> 悬停链接 + 按 Space 键，即时预览任何网页内容

## ✨ 功能特点

- 🎯 **无干扰预览** - 不用打开新标签页，原地预览链接内容
- 🎬 **视频内嵌播放** - YouTube/B站 视频直接在卡片中播放
- 💻 **GitHub 仓库卡片** - 显示 Star 数、编程语言、项目描述
- 📰 **文章智能摘要** - 展示标题、描述、阅读时间，支持 AI 摘要
- 🛒 **商品预览** - 显示价格、评分、商品图片

## 🚀 快速开始

### 触发预览

| 方式 | 操作 | 说明 |
|------|------|------|
| **Space 键** (推荐) | 悬停链接 + 按 Space | 最精准，类似 macOS Quick Look |
| Shift 键 | 悬停链接 + 按 Shift | 备用方式 |

### 关闭预览

- 按 **Escape** 键
- 点击卡片上的 **✕** 按钮
- 鼠标移开链接

## 📦 预览类型

### 🎬 视频

```
┌─────────────────────────────┐
│  ▶ 嵌入式视频播放器          │
│    (YouTube / Bilibili)      │
├─────────────────────────────┤
│ 视频标题                      │
│ ⏱️ 时长  👤 作者              │
└─────────────────────────────┘
```

支持平台：YouTube、Bilibili

### 💻 代码仓库 (GitHub)

```
┌─────────────────────────────┐
│ 📦 [头像] 仓库名             │
│     作者名                   │
├─────────────────────────────┤
│ 项目描述...                  │
├─────────────────────────────┤
│ ⭐ 12.5k  🟡 JavaScript      │
└─────────────────────────────┘
```

### 📰 文章

```
┌─────────────────────────────┐
│  [封面图]                    │
├─────────────────────────────┤
│ 文章标题                      │
├─────────────────────────────┤
│ ✨ AI 摘要                   │
│ 三行精简内容...              │
├─────────────────────────────┤
│ 📖 5 min  ✍️ 作者  📅 日期   │
└─────────────────────────────┘
```

### 🛒 商品

```
┌─────────────────────────────┐
│      [商品图片]              │
├─────────────────────────────┤
│ 商品名称                      │
│ ¥199.00  ⭐⭐⭐⭐☆            │
└─────────────────────────────┘
```

## ⚙️ 设置选项

在扩展设置 → **智能预览透镜** 中配置：

| 选项 | 说明 |
|------|------|
| 启用 Smart Lens | 开关功能 |
| 显示视觉提示 | 悬停时显示小图标 |
| 启用 AI 摘要 | 自动生成文章摘要 (需 API Key) |

## 🏗️ 技术架构

```
用户悬停链接 + 按 Space
        ↓
Content Script (smart-lens/index.tsx)
        ↓ 发送消息
Background Service Worker (fetchPreview.ts)
        ↓ Fetch + 解析 Open Graph
Content Script
        ↓ 渲染
PreviewCard 组件
```

### 目录结构

```
src/
├── config/settings/smartLens.ts     # 类型定义和默认配置
├── components/SmartLens/
│   ├── PreviewCard.tsx              # 预览卡片组件
│   └── VisualCue.tsx                # 链接悬停检测
├── lib/smartLens/
│   └── contentFetcher.ts            # OG 解析 & AI 摘要
├── pages/content/smart-lens/
│   └── index.tsx                    # 主 Content Script
└── pages/background/smart-lens/
    └── fetchPreview.ts              # Background 处理器
```

## 🔧 开发指南

### 添加新的内容类型

1. **定义类型** (`smartLens.ts`)
```typescript
type: 'article' | 'video' | 'code' | 'product' | 'new-type'
```

2. **添加检测逻辑** (`contentFetcher.ts`)
```typescript
if (url.includes('new-domain.com')) {
  return 'new-type'
}
```

3. **添加渲染逻辑** (`PreviewCard.tsx`)
```typescript
const renderNewTypePreview = () => {
  // 自定义渲染...
}
```

### 调试

```bash
# 查看 Content Script 日志
F12 → Console → 过滤 "[Smart Lens]"

# 查看 Background 日志
chrome://extensions/ → 扩展详情 → Service Worker
```

## ⚠️ 已知限制

| 限制 | 原因 | 解决方案 |
|------|------|---------|
| 部分网站无法预览 | X-Frame-Options 限制 | 显示元数据卡片 |
| 信息不完整 | 网站缺少 Open Graph 标签 | 尽量提取可用信息 |
| HTTP 链接警告 | HTTPS 页面请求 HTTP | 使用背景脚本代理 |

## 📋 更新日志

### v1.0 (2025-12-03)
- ✅ 基础预览功能
- ✅ Space/Shift 键触发
- ✅ 视频/代码/文章/商品 四种类型
- ✅ YouTube/Bilibili 嵌入播放
- ✅ GitHub 仓库卡片
- ✅ AI 摘要支持

---

**灵感来源**: macOS Quick Look, Arc Browser Peek
