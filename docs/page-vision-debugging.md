# Page Vision 截图功能诊断报告

## 检查清单

### ✅ 已验证项

1. **manifest 权限配置** - 正确
   - ✅ `activeTab` 权限存在
   - ✅ `tabs` 权限存在
   - ✅ `storage` 权限存在

2. **架构设计** - 完整
   - ✅ Content Script 消息监听
   - ✅ Background 截图捕获逻辑
   - ✅ Storage 传输大数据方案
   - ✅ 错误处理和降级

3. **代码实现** - 健壮
   - ✅ 超时处理（15秒）
   - ✅ 截图失败降级到纯文本分析
   - ✅ UI 状态反馈（加载、错误、成功）
   - ✅ 截图预览功能

### ⚠️ 潜在问题点

#### 1. windowId 获取问题

**位置**: `src/pages/background/page-vision/analyzePageVision.ts:93-99`

```typescript
const windowId = sender.tab?.windowId

if (!windowId) {
  console.error('[PageVision] No window ID available, sender:', sender)
  sendResponse({ error: 'No window ID' })
  return true
}
```

**问题**: 当从 iframe (sidebar) 发送消息时，`sender.tab` 可能为空

**解决方案**: 
```typescript
// 修改为主动查询当前活动标签页
const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
const windowId = tabs[0]?.windowId
```

#### 2. 截图时机问题

**位置**: `src/pages/content/sidebar.tsx:377-386`

```typescript
// 暂时隐藏 sidebar 以获取干净的截图
const wasVisible = wrapper.style.display !== 'none'
wrapper.style.display = 'none'
```

**问题**: 隐藏 sidebar 后立即截图，可能需要等待 DOM 重绘

**解决方案**:
```typescript
wrapper.style.display = 'none'
await new Promise(resolve => requestAnimationFrame(resolve))
// 然后再请求截图
```

#### 3. 图片压缩可能失败

**位置**: `src/pages/content/sidebar.tsx:424-430`

```typescript
const compressed = await compressImage(screenshotData, 1024, 0.7)
```

**问题**: 压缩逻辑在 Content Script 中执行，依赖 DOM API

**解决方案**: 添加 try-catch，失败时使用原始图片

## 测试方法

### 方法 1: 控制台日志追踪

1. 打开扩展侧边栏
2. 打开浏览器开发者工具 (F12)
3. 切换到 Console 标签
4. 点击"智能识别页面"按钮
5. 观察控制台输出，查找关键日志：

```
[usePageVision] Requesting screenshot...
[Syncia] Sending screenshot capture request to background...
[PageVision] Received screenshot capture request from tab: xxx
[PageVision] Starting screenshot capture for window: xxx
[PageVision] Screenshot captured successfully, size: xxx chars
[PageVision] Storing screenshot in chrome.storage.local...
[Syncia] Screenshot retrieved from storage: xxx chars
```

### 方法 2: Background Service Worker 日志

1. 打开 `chrome://extensions/`
2. 找到"千羽助手"
3. 点击"Service Worker"链接
4. 在弹出的开发者工具中查看日志

### 方法 3: 添加调试代码

在 `src/hooks/usePageVision.ts:151` 添加：

```typescript
console.log('[usePageVision] Screenshot received:', !!screenshot, screenshot ? `${screenshot.length} chars` : 'null')
console.log('[usePageVision] Screenshot preview:', screenshot?.substring(0, 100))
```

## 常见错误及解决

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `No window ID` | sender.tab 为空 | 使用 chrome.tabs.query 主动查询 |
| `Capture failed` | 权限或标签页问题 | 检查是否在特殊页面（chrome:// 等） |
| `Storage failed` | 数据过大 | 增加图片压缩率 |
| `Screenshot is null` | Background 返回失败 | 查看 Background 日志 |
| `Timeout` | 超过 15 秒未响应 | 检查网络或增加超时时间 |

## 调试建议

### 快速验证截图功能

在 Background Service Worker 控制台执行：

```javascript
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  const screenshot = await chrome.tabs.captureVisibleTab(tabs[0].windowId, {
    format: 'jpeg',
    quality: 50,
  })
  console.log('Screenshot captured:', screenshot.substring(0, 100))
})
```

### 测试完整流程

```javascript
// 在任意网页控制台执行
chrome.runtime.sendMessage({ action: 'page-vision-capture-screenshot' }, (response) => {
  console.log('Response:', response)
})
```

## 已知限制

1. **特殊页面无法截图**: `chrome://`, `edge://`, `file://` 等
2. **跨域 iframe**: 可能影响部分页面内容获取
3. **隐私模式**: 需要额外授权
4. **大尺寸页面**: 截图可能超过 storage 限制

## 下一步优化

1. [ ] 改进 windowId 获取逻辑
2. [ ] 添加截图质量自适应（根据页面大小）
3. [ ] 支持区域截图（而非全页面）
4. [ ] 添加截图缓存机制
5. [ ] 提供截图预览和重新捕获选项
