import { defineManifest } from '@crxjs/vite-plugin'
import packageJson from './package.json'
const { version } = packageJson

const [major, minor, patch, label = '0'] = version
  .replace(/[^\d.-]+/g, '')
  .split(/[.-]/)

export default defineManifest(async (env) => ({
  name:
    env.mode === 'staging'
      ? '[INTERNAL] 千羽助手'
      : '千羽助手 - 在任何网站上使用大模型的力量',
  description:
    "千羽助手 是一个浏览器扩展，允许你在任何网站上使用大模型。",
  version: `${major}.${minor}.${patch}.${label}`,
  version_name: version,
  action: {
    default_title: '千羽助手 - 打开侧边栏',
  },
  commands: {
    'open-sidebar': {
      suggested_key: {
        default: 'Ctrl+Shift+X',
        mac: 'Command+Shift+X',
      },
      description: '打开侧边栏',
    },
  },
  externally_connectable: { ids: ['*'] },
  manifest_version: 3,
  icons: {
    '16': 'images/icon-16.png',
    '32': 'images/icon-32.png',
    '48': 'images/icon-48.png',
    '128': 'images/icon-128.png',
  },
  permissions: [
    'storage',
    'unlimitedStorage',
    'contextMenus',
    'tabs',
    'activeTab',
    'clipboardWrite',
  ],
  background: {
    service_worker: 'src/pages/background/index.ts',
  },
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*', '<all_urls>'],
      js: ['src/pages/content/sidebar.tsx'],
    },
    {
      matches: ['http://*/*', 'https://*/*', '<all_urls>'],
      js: [
        'src/pages/content/quick-menu/initQuickMenu.tsx',
        'src/pages/content/quick-menu/listenContextMenu.tsx',
      ],
      all_frames: true,
    },
  ],
  web_accessible_resources: [
    {
      resources: [
        'src/pages/sidebar/index.html',
        'images/robot.png',
        'src/pages/settings/index.html',
      ],
      matches: ['http://*/*', 'https://*/*'],
    },
  ],
}))
