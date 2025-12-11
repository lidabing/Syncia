import type { Settings } from '../../config/settings'
import { getScreenshotImage } from '../../lib/getScreenshotImage'
import { contentScriptLog } from '../../logs'
import { compressImage } from '../../lib/pageVision/visionAnalyzer'

contentScriptLog('Sidebar')

// 创建外层容器包装器
const wrapper = document.createElement('div')
wrapper.id = 'syncia_sidebar_wrapper'
wrapper.style.position = 'fixed'
wrapper.style.top = '20px'
wrapper.style.right = '50px'
wrapper.style.width = '450px'
wrapper.style.height = 'calc(100vh - 40px)'
wrapper.style.minWidth = '350px'
wrapper.style.minHeight = '500px'
wrapper.style.zIndex = '9000000000000000000'
wrapper.style.display = 'none'
wrapper.style.flexDirection = 'column'
wrapper.style.boxShadow = '0 10px 40px rgba(0,0,0,0.3)'
wrapper.style.borderRadius = '12px'
wrapper.style.overflow = 'hidden'
wrapper.style.background = '#f5f5f5'
wrapper.style.resize = 'both'

// 创建拖动头部
const dragBar = document.createElement('div')
dragBar.id = 'syncia_drag_bar'
dragBar.style.width = '100%'
dragBar.style.height = '10px'
dragBar.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
dragBar.style.cursor = 'move'
dragBar.style.flexShrink = '0'
dragBar.style.userSelect = 'none'

const iframe = document.createElement('iframe')
iframe.style.background = 'white'
iframe.style.width = '100%'
iframe.style.height = '100%'
iframe.style.border = '0px'
iframe.style.display = 'block'
iframe.style.colorScheme = 'auto'

// Check extension context before accessing chrome.runtime
let isExtensionValid = false
try {
  if (chrome.runtime?.id) {
    iframe.src = chrome.runtime.getURL('/src/pages/sidebar/index.html')
    isExtensionValid = true
  } else {
    console.warn('[Syncia] Extension context invalidated, sidebar cannot initialize')
  }
} catch (error) {
  console.error('[Syncia] Failed to get sidebar URL:', error)
}

// Only proceed if extension is valid
if (!isExtensionValid) {
  // Don't initialize sidebar if extension context is invalid
  throw new Error('Extension context invalid, sidebar not initialized')
}

iframe.id = 'syncia_sidebar'

wrapper.appendChild(dragBar)
wrapper.appendChild(iframe)
document.body.appendChild(wrapper)

// 创建浮动按钮
const floatingButton = document.createElement('div')
floatingButton.id = 'syncia_floating_button'
floatingButton.style.position = 'fixed'
floatingButton.style.bottom = '20px'
floatingButton.style.right = '20px'
floatingButton.style.width = '32px'
floatingButton.style.height = '32px'
floatingButton.style.borderRadius = '50%'
floatingButton.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
floatingButton.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)'
floatingButton.style.cursor = 'pointer'
floatingButton.style.zIndex = '9000000000000000001'
floatingButton.style.display = 'flex'
floatingButton.style.alignItems = 'center'
floatingButton.style.justifyContent = 'center'
floatingButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
floatingButton.style.userSelect = 'none'
floatingButton.style.opacity = '0.7'
floatingButton.innerHTML = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="white"/>
  </svg>
`

// 浮动按钮动画效果
floatingButton.addEventListener('mouseenter', () => {
  floatingButton.style.transform = 'scale(1.15)'
  floatingButton.style.opacity = '1'
  floatingButton.style.boxShadow = '0 3px 12px rgba(102, 126, 234, 0.5)'
})

floatingButton.addEventListener('mouseleave', () => {
  floatingButton.style.transform = 'scale(1)'
  floatingButton.style.opacity = '0.7'
  floatingButton.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)'
})

// 点击浮动按钮切换侧边栏
floatingButton.addEventListener('click', () => {
  if (wrapper.style.display === 'none') {
    wrapper.style.display = 'flex'
    // 添加淡入动画
    wrapper.style.animation = 'syncia-fadeIn 0.3s ease-out'
    // 通知 iframe 侧边栏已打开，需要刷新建议
    setTimeout(() => {
      iframe.contentWindow?.postMessage(
        { action: 'sidebar-opened' },
        '*',
      )
    }, 100)
  } else {
    wrapper.style.display = 'none'
  }
})

document.body.appendChild(floatingButton)

// 添加CSS动画
const style = document.createElement('style')
style.textContent = `
  @keyframes syncia-fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes syncia-pulse {
    0%, 100% {
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }
    50% {
      box-shadow: 0 2px 12px rgba(102, 126, 234, 0.4);
    }
  }
  
  #syncia_floating_button {
    animation: syncia-pulse 2s ease-in-out infinite;
  }
`
document.head.appendChild(style)

// 拖动功能实现
let isDragging = false
let startX = 0
let startY = 0
let startLeft = 0
let startTop = 0

dragBar.addEventListener('mousedown', (e) => {
  isDragging = true
  startX = e.clientX
  startY = e.clientY
  const rect = wrapper.getBoundingClientRect()
  startLeft = rect.left
  startTop = rect.top
  dragBar.style.cursor = 'grabbing'
  e.preventDefault()
})

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return
  
  const deltaX = e.clientX - startX
  const deltaY = e.clientY - startY
  
  let newLeft = startLeft + deltaX
  let newTop = startTop + deltaY
  
  // 限制在窗口内
  newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - wrapper.offsetWidth))
  newTop = Math.max(0, Math.min(newTop, window.innerHeight - wrapper.offsetHeight))
  
  wrapper.style.left = newLeft + 'px'
  wrapper.style.top = newTop + 'px'
  wrapper.style.right = 'auto'
})

document.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false
    dragBar.style.cursor = 'move'
  }
})

/**
 * BG SCRIPT <-> CONTENT SCRIPT
 * Event listener for messages from the background script.
 */
try {
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'open-sidebar') {
      if (wrapper.style.display === 'none') {
        wrapper.style.display = 'flex'
        // 通知 iframe 侧边栏已打开，需要刷新建议
        setTimeout(() => {
          iframe.contentWindow?.postMessage(
            { action: 'sidebar-opened' },
            '*',
          )
        }, 100)
      } else {
        wrapper.style.display = 'none'
      }
    }
  })
} catch (error) {
  console.warn('[Syncia] Failed to add message listener:', error)
}

/**
 * URL Change Detection
 * Monitor page navigation and notify sidebar to refresh suggestions
 */
let lastUrl = window.location.href
const urlObserver = new MutationObserver(() => {
  const currentUrl = window.location.href
  if (currentUrl !== lastUrl) {
    console.log('[Syncia] URL changed from', lastUrl, 'to', currentUrl)
    lastUrl = currentUrl
    // Notify iframe about URL change
    iframe.contentWindow?.postMessage(
      {
        action: 'url-changed',
        payload: { url: currentUrl },
      },
      '*',
    )
  }
})

// Observe URL changes via DOM mutations
urlObserver.observe(document.body, {
  childList: true,
  subtree: true,
})

// Also listen for popstate events (browser back/forward)
window.addEventListener('popstate', () => {
  const currentUrl = window.location.href
  if (currentUrl !== lastUrl) {
    console.log('[Syncia] URL changed via popstate to', currentUrl)
    lastUrl = currentUrl
    iframe.contentWindow?.postMessage(
      {
        action: 'url-changed',
        payload: { url: currentUrl },
      },
      '*',
    )
  }
})

/**
 * SIDEBAR <-> CONTENT SCRIPT
 * Event listener for messages from the sidebar.
 * To get the page content, the sidebar sends a message with the action 'get-page-content'.
 * The page content is sent back to the sidebar by posting a message with the action 'get-page-content'.
 */
window.addEventListener('message', async (event) => {
  const { action, _payload } = event.data as { action: string; _payload: any }

  // ACTION: start-drag ====================================
  if (action === 'start-drag') {
    const { x, y } = event.data
    isDragging = true
    startX = x
    startY = y
    const rect = wrapper.getBoundingClientRect()
    startLeft = rect.left
    startTop = rect.top
  }

  // ACTION: dragging ======================================
  if (action === 'dragging') {
    if (!isDragging) return
    
    const { deltaX, deltaY } = event.data
    
    let newLeft = startLeft + deltaX
    let newTop = startTop + deltaY
    
    // 限制在窗口内
    newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - wrapper.offsetWidth))
    newTop = Math.max(0, Math.min(newTop, window.innerHeight - wrapper.offsetHeight))
    
    wrapper.style.left = `${newLeft}px`
    wrapper.style.top = `${newTop}px`
    wrapper.style.right = 'auto'
  }

  // ACTION: end-drag ======================================
  if (action === 'end-drag') {
    isDragging = false
  }

  // ACTION: get-page-content ==============================
  if (action === 'get-page-content') {
    const pageContent = document.body.innerText
    iframe.contentWindow?.postMessage(
      {
        action: 'get-page-content',
        payload: pageContent,
      },
      '*',
    )
  }

  // ACTION: copy-to-clipboard =============================
  if (action === 'copy-to-clipboard') {
    const { content } = _payload as { content: string }
    navigator.clipboard.writeText(content).catch((err) => {
      console.error('Clipboard write failed', err)
    })
  }

  // ACTION: get-screenshot-image ===========================
  if (action === 'get-screenshot-image') {
    const wasVisible = wrapper.style.display !== 'none'
    wrapper.style.display = 'none'
    
    const image = await getScreenshotImage()
    
    if (wasVisible) {
      wrapper.style.display = 'flex'
    }
    
    iframe.contentWindow?.postMessage(
      {
        action: 'get-screenshot-image',
        payload: image,
      },
      '*',
    )
  }

  // ACTION: get-page-info ===================================
  // 获取完整的页面信息（用于 Page Vision 功能）
  if (action === 'get-page-info') {
    const pageInfo = {
      title: document.title,
      url: window.location.href,
      content: document.body.innerText.slice(0, 5000), // 限制长度
      meta: {
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
        keywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '',
        ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
        ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
      },
    }
    
    iframe.contentWindow?.postMessage(
      {
        action: 'page-info-response',
        payload: pageInfo,
      },
      '*',
    )
  }

  // ACTION: request-screenshot ==============================
  // 为 Page Vision 请求截图
  // 注意：chrome.tabs.captureVisibleTab 不会捕获扩展 UI（iframe），无需隐藏 sidebar
  if (action === 'request-screenshot') {
    // 使用 Promise 包装，避免 async callback 问题
    const handleScreenshotCapture = async () => {
      try {
        console.log('[Syncia] Sending screenshot capture request to background...')
        const response = await chrome.runtime.sendMessage({ action: 'page-vision-capture-screenshot' })
        console.log('[Syncia] Received response from background:', response)
        
        if (!response || response.error) {
          console.error('[Syncia] Screenshot capture failed:', response?.error || 'No response from background')
          iframe.contentWindow?.postMessage(
            {
              action: 'screenshot-response',
              payload: { screenshot: null, error: response?.error || 'Screenshot failed' },
            },
            '*',
          )
          return
        }

        let screenshotData = response?.screenshot

        // 如果是通过 storage 传输的
        if (response?.stored) {
          try {
            console.log('[Syncia] Retrieving screenshot from storage...')
            const data = await chrome.storage.local.get('temp_page_vision_screenshot')
            screenshotData = data.temp_page_vision_screenshot
            console.log('[Syncia] Screenshot retrieved from storage:', screenshotData ? `${screenshotData.length} chars` : 'null')
            // 清理
            await chrome.storage.local.remove('temp_page_vision_screenshot')
          } catch (e) {
            console.error('[Syncia] Failed to retrieve screenshot from storage:', e)
            // 即使存储失败也继续，可能有直接返回的 screenshot
          }
        }

        if (screenshotData) {
          try {
            console.log('[Syncia] Compressing screenshot...')
            // 压缩截图以减少消息大小 (Content Script -> Iframe)
            const compressed = await compressImage(screenshotData, 1024, 0.7)
            console.log('[Syncia] Screenshot compressed:', compressed ? `${compressed.length} chars` : 'failed')
            
            iframe.contentWindow?.postMessage(
              {
                action: 'screenshot-response',
                payload: { screenshot: compressed },
              },
              '*',
            )
          } catch (error) {
            console.error('[Syncia] Failed to compress screenshot, using original:', error)
            // 压缩失败时使用原始截图
            iframe.contentWindow?.postMessage(
              {
                action: 'screenshot-response',
                payload: { screenshot: screenshotData },
              },
              '*',
            )
          }
        } else {
          iframe.contentWindow?.postMessage(
            {
              action: 'screenshot-response',
              payload: { screenshot: null, error: 'No screenshot data' },
            },
            '*',
          )
        }
      } catch (error) {
        console.error('[Syncia] Screenshot capture error:', error)
        iframe.contentWindow?.postMessage(
          {
            action: 'screenshot-response',
            payload: { screenshot: null, error: String(error) },
          },
          '*',
        )
      }
    }
    
    handleScreenshotCapture()
    return
  }

  // ACTION: execute-page-vision-action ======================
  // 执行 Page Vision 推荐的操作
  if (action === 'execute-page-vision-action') {
    // 将操作转发回 sidebar 处理
    iframe.contentWindow?.postMessage(
      {
        action: 'page-vision-action-execute',
        payload: event.data.payload,
      },
      '*',
    )
  }
})
