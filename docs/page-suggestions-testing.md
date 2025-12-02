# 页面智能建议功能 - 测试指南

## 开发环境测试步骤

### 1. 启动开发服务器

```powershell
pnpm dev
```

### 2. 加载扩展

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 启用"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目的 `dist/` 目录

### 3. 配置 API

1. 点击扩展图标打开侧边栏
2. 进入设置页面
3. 配置：
   - OpenAI API Key（或 Ollama URL）
   - 选择模型（推荐: gpt-3.5-turbo 或 gpt-4）
   - 设置温度模式（建议: Balanced）

### 4. 测试场景

#### 场景 1: 新闻文章页面
**测试页面**: https://news.ycombinator.com/ 或任意新闻网站

**预期行为**:
1. 打开侧边栏
2. 看到 3 个骨架屏加载动画
3. 1-3 秒后显示 3 条建议
4. 建议应与文章内容相关
5. 点击任意建议，自动开始对话

#### 场景 2: GitHub 仓库页面
**测试页面**: https://github.com/microsoft/vscode

**预期行为**:
1. 建议可能包括：
   - "解释这个项目的主要功能"
   - "分析项目的技术栈"
   - "总结项目的贡献指南"

#### 场景 3: 技术文档页面
**测试页面**: https://react.dev/

**预期行为**:
1. 建议应与技术内容相关
2. 可能包含概念解释、示例代码等建议

#### 场景 4: 空白/简短页面
**测试页面**: about:blank 或 chrome://extensions/

**预期行为**:
1. 不显示建议（内容不足）
2. 或显示非常通用的建议

### 5. 边界条件测试

#### 测试 A: 同一页面多次打开
1. 打开页面，看到建议
2. 关闭侧边栏
3. 重新打开侧边栏
4. **预期**: 不重新生成建议（使用缓存）

#### 测试 B: 切换页面
1. 在页面 A 看到建议
2. 导航到页面 B
3. **预期**: 自动生成新建议

#### 测试 C: 开始对话后
1. 看到建议
2. 点击一条建议或手动输入消息
3. **预期**: 建议区域隐藏

#### 测试 D: 未配置 API
1. 清除 API Key 设置
2. 打开侧边栏
3. **预期**: 不显示建议区域

### 6. 性能测试

#### 测试网络延迟
1. 打开浏览器开发者工具
2. Network 标签 → 设置慢速网络（Slow 3G）
3. 打开侧边栏
4. **预期**: 
   - 骨架屏持续显示
   - 最终成功加载建议
   - 不阻塞其他操作

#### 测试 API 错误
1. 设置错误的 API Key
2. 打开侧边栏
3. **预期**:
   - 静默失败
   - 不显示建议
   - 控制台有错误日志
   - 其他功能正常工作

### 7. UI/UX 检查

#### 深色模式
1. 切换系统到深色主题
2. 检查建议卡片的颜色对比度
3. **预期**: 清晰可读，无色彩冲突

#### 浅色模式
1. 切换系统到浅色主题
2. 检查建议卡片的颜色对比度
3. **预期**: 清晰可读，无色彩冲突

#### Hover 效果
1. 鼠标悬停在建议卡片上
2. **预期**: 
   - 背景色变化
   - 边框显示
   - 过渡动画流畅

#### 点击反馈
1. 点击建议
2. **预期**:
   - 建议立即消失
   - 消息出现在输入框或聊天列表
   - AI 开始响应

### 8. 控制台日志检查

打开浏览器控制台，查看：
- `[useChatCompletion]` - 聊天完成状态
- `Failed to generate suggestions:` - 建议生成错误
- `Failed to analyze page:` - 页面分析错误

### 9. Chrome Storage 检查

打开 Chrome DevTools → Application → Storage → Extension Storage

查看是否有：
- 缓存的页面 URL
- 生成的建议数据（如果启用持久化）

## 调试技巧

### 强制重新生成建议
修改 `usePageSuggestions.ts` 中的依赖数组，添加一个随机值触发更新：

```typescript
useEffect(() => {
  // ... existing code
}, [currentChatId, messages.length, hasValidSettings, pageUrl, Math.random()])
```

### 查看页面内容提取
在 `usePageSuggestions.ts` 的 `getPageContent` 后添加：

```typescript
const content = await getPageContent()
console.log('Page content:', content.slice(0, 500)) // 查看前 500 字符
```

### 查看 AI 响应
在 `useChatCompletion.ts` 的 `analyzePage` 方法中添加：

```typescript
console.log('AI raw response:', fullResponse)
console.log('Parsed suggestions:', suggestions)
```

## 已知限制

1. **Chrome 扩展特殊页面**: chrome://, about:, edge:// 等页面无法注入内容脚本，无法获取页面内容
2. **大型页面**: 仅提取前 3000 字符，超长内容会被截断
3. **动态加载内容**: 依赖 `document.body.innerText`，SPA 动态加载的内容可能延迟提取
4. **API 限流**: 频繁切换页面可能触发 OpenAI API 限流

## 回归测试清单

测试完成后，确认以下功能未受影响：
- [ ] 正常聊天对话功能
- [ ] 快速菜单（选中文本）
- [ ] 右键上下文菜单
- [ ] 设置页面
- [ ] 聊天历史记录
- [ ] 网页内容注入（原有功能）
- [ ] 截图功能（如果有）

---

**测试完成后**: 如发现问题，请在 GitHub Issues 中报告，包含：
- 浏览器版本
- 测试页面 URL
- 控制台错误信息
- 预期 vs 实际行为
