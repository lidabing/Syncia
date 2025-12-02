import type { Settings } from '../../config/settings'
import { getScreenshotImage } from '../../lib/getScreenshotImage'
import { contentScriptLog } from '../../logs'

contentScriptLog('Sidebar')

// 创建外层容器包装器
const wrapper = document.createElement('div')
wrapper.id = 'syncia_sidebar_wrapper'
wrapper.style.position = 'fixed'
wrapper.style.top = '80px'
wrapper.style.right = '50px'
wrapper.style.width = '450px'
wrapper.style.height = '650px'
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
iframe.src = chrome.runtime.getURL('/src/pages/sidebar/index.html')
iframe.id = 'syncia_sidebar'

wrapper.appendChild(dragBar)
wrapper.appendChild(iframe)
document.body.appendChild(wrapper)

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
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'open-sidebar') {
    if (wrapper.style.display === 'none') {
      wrapper.style.display = 'flex'
    } else {
      wrapper.style.display = 'none'
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
})
