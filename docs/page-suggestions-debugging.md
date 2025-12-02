# 调试页面建议功能

## 快速调试步骤

### 1. 打开浏览器控制台

在雪球页面上：
1. 按 F12 打开开发者工具
2. 切换到 Console 标签

### 2. 查看调试日志

打开侧边栏后，您应该看到以下日志：

```
[usePageSuggestions] Init: { hasValidSettings: true, messagesLength: 0, currentChatId: "xxx" }
[usePageSuggestions] Effect triggered: { hasValidSettings: true, messagesLength: 0, ... }
[usePageSuggestions] Page content length: 12345
[usePageSuggestions] Analyzing page content...
[usePageSuggestions] Generated suggestions: ["建议1", "建议2", "建议3"]
[PageSuggestions] State: { suggestions: [...], isLoading: false, hasSuggestions: true }
```

### 3. 常见问题排查

#### 问题 A: 看到 "No valid settings"
**原因**: 未配置 API Key 或模型
**解决**:
1. 点击扩展图标
2. 进入设置
3. 配置 OpenAI API Key 和模型

#### 问题 B: 看到 "Page content length: 0"
**原因**: 无法获取页面内容
**解决**:
1. 检查 content script 是否正确注入
2. 在主窗口控制台运行：`document.body.innerText.length`
3. 如果有值但 hook 获取不到，可能是消息传递问题

#### 问题 C: 看到 "Chat has messages, hiding suggestions"
**原因**: 当前聊天已有消息
**解决**:
1. 点击侧边栏的 "New Chat" 或清空按钮
2. 或者刷新页面重新打开侧边栏

#### 问题 D: 看到 "Page content too short"
**原因**: 页面内容少于 100 字符
**解决**:
1. 访问内容更丰富的页面
2. 或降低最小长度限制（在代码中修改 100 为更小的值）

#### 问题 E: 长时间显示加载动画
**原因**: API 调用超时或失败
**解决**:
1. 检查网络连接
2. 检查 API Key 是否有效
3. 查看控制台是否有错误信息
4. 如果使用 Ollama，确保服务正在运行

### 4. 手动测试页面内容获取

在浏览器控制台运行：

```javascript
// 测试 postMessage 通信
window.addEventListener('message', (e) => {
  console.log('收到消息:', e.data)
})

window.parent.postMessage({ action: 'get-page-content' }, '*')
```

预期结果：应该看到返回的页面内容

### 5. 检查扩展状态

在 `chrome://extensions/` 页面：
1. 确认 Syncia 扩展已启用
2. 点击"详细信息"
3. 检查是否有错误
4. 尝试点击"重新加载"

### 6. 强制刷新

如果代码已更新但未生效：

```powershell
# 停止开发服务器
Ctrl+C

# 清理并重新构建
Remove-Item -Recurse -Force dist/
pnpm dev
```

然后在 `chrome://extensions/` 点击刷新按钮。

### 7. 检查 Settings

确认以下设置已正确配置：

```javascript
// 在侧边栏的控制台运行
chrome.storage.sync.get('SETTINGS', (data) => {
  console.log('Settings:', data.SETTINGS)
})
```

应该看到：
```json
{
  "chat": {
    "openAIKey": "sk-...",
    "model": "gpt-3.5-turbo",
    "mode": 1,
    "openAiBaseUrl": "https://api.openai.com/v1"
  }
}
```

### 8. 测试简化版

如果仍然不工作，尝试在 `PageSuggestions.tsx` 中添加测试数据：

```typescript
const PageSuggestions = ({ onSelectSuggestion }: PageSuggestionsProps) => {
  // 强制显示测试数据
  const testSuggestions = ['测试建议1', '测试建议2', '测试建议3']
  
  return (
    <div className="cdx-px-4 cdx-py-3">
      <h3>💡 测试建议</h3>
      {testSuggestions.map((s, i) => (
        <button key={i} onClick={() => onSelectSuggestion(s)}>
          {s}
        </button>
      ))}
    </div>
  )
}
```

如果能看到测试建议，说明组件渲染正常，问题在数据获取部分。

### 9. 检查 iframe 通信

在雪球页面的主窗口控制台：

```javascript
// 查找 sidebar iframe
const iframe = document.getElementById('syncia_sidebar')
console.log('Iframe:', iframe)
console.log('Iframe src:', iframe?.src)

// 测试向 iframe 发送消息
iframe?.contentWindow?.postMessage({ 
  action: 'get-page-content',
  payload: document.body.innerText 
}, '*')
```

### 10. 完整诊断脚本

在侧边栏控制台运行：

```javascript
console.log('=== Syncia 诊断 ===')
console.log('1. Window location:', window.location.href)
console.log('2. Parent exists:', !!window.parent)
console.log('3. In iframe:', window !== window.parent)

// 测试消息监听
let received = false
window.addEventListener('message', (e) => {
  if (e.data.action === 'get-page-content') {
    received = true
    console.log('✓ 收到页面内容:', e.data.payload?.slice(0, 100))
  }
})

// 发送请求
window.parent.postMessage({ action: 'get-page-content' }, '*')

setTimeout(() => {
  if (!received) {
    console.log('✗ 5秒内未收到响应，可能是 content script 问题')
  }
}, 5000)
```

## 需要提供的调试信息

如果问题仍未解决，请提供：
1. 浏览器控制台的完整日志
2. Chrome 版本
3. 访问的页面 URL
4. Settings 中的配置（隐藏 API Key）
5. `chrome://extensions/` 中的错误信息
