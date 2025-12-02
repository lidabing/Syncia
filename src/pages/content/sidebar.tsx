import type { Settings } from '../../config/settings'
import { getScreenshotImage } from '../../lib/getScreenshotImage'
import { contentScriptLog } from '../../logs'

contentScriptLog('Sidebar')

// 创建可拖动的容器
const container = document.createElement('div')
container.id = 'syncia_sidebar_container'
container.style.position = 'fixed'
container.style.top = '50px'
container.style.right = '50px'
container.style.width = '0px'
container.style.height = '600px'
container.style.minWidth = '300px'
container.style.minHeight = '400px'
container.style.maxHeight = '80vh'
container.style.zIndex = '9000000000000000000'
container.style.display = 'none'
container.style.flexDirection = 'column'
container.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'
container.style.borderRadius = '8px'
container.style.overflow = 'hidden'
container.style.background = 'white'
container.style.boxSizing = 'border-box'

// 创建拖动手柄
const dragHandle = document.createElement('div')
dragHandle.style.width = '100%'
dragHandle.style.height = '32px'
dragHandle.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
dragHandle.style.cursor = 'move'
dragHandle.style.display = 'flex'
dragHandle.style.alignItems = 'center'
dragHandle.style.justifyContent = 'space-between'
dragHandle.style.padding = '0 12px'
dragHandle.style.boxSizing = 'border-box'
dragHandle.style.userSelect = 'none'

// 添加标题
const title = document.createElement('span')
title.textContent = 'Syncia AI'
title.style.color = 'white'
title.style.fontSize = '13px'
title.style.fontWeight = '600'
title.style.fontFamily = 'system-ui, -apple-system, sans-serif'
dragHandle.appendChild(title)

// 添加关闭按钮
const closeBtn = document.createElement('button')
closeBtn.innerHTML = '✕'
closeBtn.style.background = 'transparent'
closeBtn.style.border = 'none'
closeBtn.style.color = 'white'
closeBtn.style.fontSize = '18px'
closeBtn.style.cursor = 'pointer'
closeBtn.style.padding = '0'
closeBtn.style.width = '20px'
closeBtn.style.height = '20px'
closeBtn.style.display = 'flex'
closeBtn.style.alignItems = 'center'
closeBtn.style.justifyContent = 'center'
closeBtn.style.borderRadius = '3px'
closeBtn.style.transition = 'background 0.2s'
closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(255,255,255,0.2)'
closeBtn.onmouseout = () => closeBtn.style.background = 'transparent'
closeBtn.onclick = () => {
  container.style.display = 'none'
  container.style.width = '0px'
  iframe.style.width = '0px'
}
dragHandle.appendChild(closeBtn)

const iframe = document.createElement('iframe')
iframe.style.background = 'white'
iframe.style.width = '100%'
iframe.style.height = '100%'
iframe.style.border = '0px'
iframe.style.flex = '1 1 auto'
iframe.style.minHeight = '0'
iframe.style.colorScheme = 'auto'
iframe.src = chrome.runtime.getURL('/src/pages/sidebar/index.html')
iframe.id = 'syncia_sidebar'

container.appendChild(dragHandle)
container.appendChild(iframe)

// 创建调整大小的手柄（右下角）
const resizeHandle = document.createElement('div')
resizeHandle.style.position = 'absolute'
resizeHandle.style.bottom = '0'
resizeHandle.style.right = '0'
resizeHandle.style.width = '16px'
resizeHandle.style.height = '16px'
resizeHandle.style.cursor = 'nwse-resize'
resizeHandle.style.background = 'linear-gradient(135deg, transparent 0%, transparent 50%, #667eea 50%, #667eea 100%)'
resizeHandle.style.borderBottomRightRadius = '8px'
resizeHandle.style.zIndex = '10'
container.appendChild(resizeHandle)

document.body.appendChild(container)

// 拖动功能
let isDragging = false
let currentX = 0
let currentY = 0
let initialX = 0
let initialY = 0

// 调整大小功能
let isResizing = false
let currentWidth = 400
let currentHeight = 600
let initialWidth = 0
let initialHeight = 0
let resizeStartX = 0
let resizeStartY = 0

dragHandle.addEventListener('mousedown', (e) => {
  isDragging = true
  initialX = e.clientX - currentX
  initialY = e.clientY - currentY
  container.style.transition = 'none'
})

resizeHandle.addEventListener('mousedown', (e) => {
  e.stopPropagation()
  isResizing = true
  resizeStartX = e.clientX
  resizeStartY = e.clientY
  initialWidth = container.offsetWidth
  initialHeight = container.offsetHeight
  container.style.transition = 'none'
})

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    e.preventDefault()
    currentX = e.clientX - initialX
    currentY = e.clientY - initialY
    
    // 限制在视口内
    const maxX = window.innerWidth - container.offsetWidth
    const maxY = window.innerHeight - container.offsetHeight
    
    currentX = Math.max(0, Math.min(currentX, maxX))
    currentY = Math.max(0, Math.min(currentY, maxY))
    
    container.style.left = currentX + 'px'
    container.style.top = currentY + 'px'
    container.style.right = 'auto'
  } else if (isResizing) {
    e.preventDefault()
    
    const deltaX = e.clientX - resizeStartX
    const deltaY = e.clientY - resizeStartY
    
    currentWidth = Math.max(300, Math.min(initialWidth + deltaX, window.innerWidth - currentX))
    currentHeight = Math.max(400, Math.min(initialHeight + deltaY, window.innerHeight - currentY))
    
    container.style.width = currentWidth + 'px'
    container.style.height = currentHeight + 'px'
  }
})

document.addEventListener('mouseup', () => {
  isDragging = false
  isResizing = false
  container.style.transition = ''
})

/**
 * BG SCRIPT <-> CONTENT SCRIPT
 * Event listener for messages from the background script.
 * To open the sidebar, the background script sends a message with the action 'open-sidebar'.
 */
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'open-sidebar') {
    if (container.style.display === 'none' || container.style.width === '0px') {
      container.style.display = 'flex'
      container.style.width = currentWidth + 'px'
      container.style.height = currentHeight + 'px'
      iframe.style.width = '100%'
      
      // 初始化位置（如果是第一次打开）
      if (!currentX && !currentY) {
        currentX = window.innerWidth - currentWidth - 50
        currentY = 50
        container.style.left = currentX + 'px'
        container.style.top = currentY + 'px'
        container.style.right = 'auto'
      }
    } else {
      container.style.display = 'none'
      container.style.width = '0px'
      iframe.style.width = '0px'
    }
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
    const wasVisible = container.style.display !== 'none'
    container.style.display = 'none'
    
    const image = await getScreenshotImage()
    
    if (wasVisible) {
      container.style.display = 'flex'
    }
    
    iframe.contentWindow?.postMessage(
      {
        action: 'get-screenshot-image',
        payload: image,
      },
      '*',
    )
  }
})
