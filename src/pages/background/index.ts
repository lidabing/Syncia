import { backgroundLog } from '../../logs'
import {
  createContextMenu,
  createContextMenuOnStorageChange,
} from './quick-menu/createContextMenu'
import { forwardContextMenuClicks } from './quick-menu/forwardContextMenu'
import { captureScreenListener } from './sidebar/captureScreenListener'
import { sendSidebarShortcut } from './sidebar/sendSidebarShortcut'
import { sidebarToggleListeners } from './sidebar/sidebarToggleListeners'
import { setupSmartLensListener } from './smart-lens/fetchPreview'
import { setupPageVisionListener } from './page-vision/analyzePageVision'
import { migrateSettings } from '../../lib/migrateSettings'

console.log('[Background] Service Worker starting...')

backgroundLog()

// =========================== //
// Settings Migration
// =========================== //
migrateSettings()

// =========================== //
// Sidebar Scripts
// =========================== //
sidebarToggleListeners()
sendSidebarShortcut()
captureScreenListener()

// =========================== //
// Quick menu Scripts
// =========================== //
createContextMenu()
forwardContextMenuClicks()
createContextMenuOnStorageChange()

// =========================== //
// Smart Lens Scripts
// =========================== //
setupSmartLensListener()

// =========================== //
// Page Vision Scripts
// =========================== //
setupPageVisionListener()

console.log('[Background] Service Worker fully initialized')
