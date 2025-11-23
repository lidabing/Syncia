# Syncia - AI Agent Instructions

Chrome extension (Manifest v3) that integrates ChatGPT/LLMs into any webpage via sidebar + quick menu. Built with Vite + React + TypeScript + `@crxjs/vite-plugin`.

## Architecture Overview

**Extension Components** (manifest v3 architecture):
- **Background service worker**: `src/pages/background/index.ts` - command/message routing, context menus
- **Content scripts**: `src/pages/content/` - injected into web pages
  - `sidebar.tsx` - injects iframe with chat UI, handles page<->sidebar messaging
  - `quick-menu/initQuickMenu.tsx` - floating menu on text selection
  - `quick-menu/listenContextMenu.tsx` - handles right-click context menu actions
- **Extension pages**: `src/pages/{sidebar,settings}/index.html` - full UI pages loaded in iframe/tabs

**State Management Pattern**:
- **Jotai atoms** + **Chrome Storage API** via custom `useStorage` hook pattern
- Example: `useSettings()` wraps Jotai atom with `chrome.storage.sync` persistence
- State syncs across extension contexts automatically via storage change listeners
- See `src/hooks/useStorage.ts` for the unified storage abstraction (supports `sync`, `local`, `indexedDB`)

**LLM Integration** (LangChain.js):
- `useChatCompletion` hook abstracts OpenAI/Ollama calls using LangChain's `ChatOpenAI`
- Supports streaming responses with `callbacks: [{ handleLLMNewToken }]`
- Context injection: automatically matches webpage content to user query before sending (see `getMatchedContent`)
- Model configuration in settings: API key, base URL (for Ollama), temperature mode

## Critical Developer Workflows

**Development** (Windows PowerShell):
```powershell
pnpm install          # One-time setup
pnpm dev              # Hot reload dev server on :5173
```
Then load `dist/` as unpacked extension in `chrome://extensions/`.

**Production Build**:
```powershell
pnpm build            # tsc + vite build → dist/
pnpm release:cli      # Build + publish to Chrome Web Store (requires .env with CHROME_* vars)
```

**Formatting/Linting** (Biome, not ESLint/Prettier):
```powershell
pnpm format           # Auto-fix formatting
pnpm lint             # Check for issues
pnpm lint:fix         # Auto-fix lint issues
```

**⚠️ Windows-specific gotcha**: `pnpm flush` uses Unix `rm -rf`, will fail on PowerShell. Use `Remove-Item -Recurse -Force dist/,artifacts/` instead.

## Extension-Specific Patterns

**Adding New Content Scripts**:
1. Create file in `src/pages/content/`
2. Register in `manifest.config.ts` under `content_scripts.js[]` array
3. For iframe-loaded resources, add to `web_accessible_resources.resources[]`

**Background <-> Content Script Messaging**:
```typescript
// Background sends command:
chrome.tabs.sendMessage(tabId, { action: 'open-sidebar' })

// Content script listens:
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'open-sidebar') { /* ... */ }
})
```

**Sidebar <-> Content Script Messaging** (iframe-specific):
```typescript
// Sidebar posts to parent window:
window.parent.postMessage({ action: 'get-page-content' }, '*')

// Content script listens and responds:
window.addEventListener('message', (event) => {
  if (event.data.action === 'get-page-content') {
    iframe.contentWindow?.postMessage({ action: 'get-page-content', payload: pageContent }, '*')
  }
})
```

**Chrome API Usage**:
- Use native `chrome.*` APIs directly (not `webextension-polyfill` wrapper in practice)
- Common APIs: `chrome.storage`, `chrome.runtime`, `chrome.tabs`, `chrome.commands`, `chrome.contextMenus`

## Project Conventions

**Prompt System** (hierarchical menus):
- Default prompts: `src/config/prompts/default.ts` - nested structure with `object-hash` IDs
- Custom prompts stored in `chrome.storage.sync` under `SETTINGS.quickMenu.items`
- Each prompt has `{ id, name, prompt, children? }` - supports infinite nesting
- See `RecursiveItem.tsx` for rendering nested prompt menus

**Settings Structure** (`src/config/settings/index.ts`):
```typescript
{
  quickMenu: { enabled, items, excludedSites },
  chat: { openAIKey, model, mode, openAiBaseUrl },  // mode = temperature (0-1.5)
  general: { theme, webpageContext }
}
```

**Component Organization**:
- `src/components/{QuickMenu,Sidebar,Settings}/` - feature-scoped components
- `src/hooks/use*.ts` - custom hooks with Jotai + Chrome storage integration
- `src/lib/*.ts` - pure utility functions (e.g., `generateReadableDate`, `validApiKey`)

**TypeScript Strictness**:
- `strict: true` in `tsconfig.json` - enforce all checks
- Run `pnpm build` to catch type errors before committing

## Integration Points

**LangChain.js Configuration** (`useChatCompletion`):
```typescript
const llm = new ChatOpenAI({
  streaming: true,
  openAIApiKey: apiKey,
  modelName: model,
  configuration: { baseURL: baseURL },  // For Ollama: http://localhost:11434/v1
  temperature: Number(mode),            // 0 (precise) to 1.5 (creative)
})
```

**Webpage Context Injection**:
- When `webpageContext: true`, extracts `document.body.innerText`
- Uses embedding similarity (via `getMatchedContent`) to find relevant text chunks
- Prepends matched context to user query as `### Context\n${matchedContext}\n### Question:\n${query}`

**Site Exclusion** (quick menu):
- Uses `redirect-whitelister` package to match URL patterns
- Patterns stored in `SETTINGS.quickMenu.excludedSites[]` (e.g., `'*.example.com/*'`)
- Check happens in `initQuickMenu.tsx` before rendering menu

## Common Pitfalls

1. **Manifest changes**: Always edit `manifest.config.ts`, never `dist/manifest.json` (auto-generated)
2. **Version bumps**: Update `package.json` version - it auto-syncs to manifest
3. **Storage limits**: Chrome storage.sync has 100KB quota - large data goes to storage.local or IndexedDB
4. **Content script timing**: Quick menu checks settings via `chrome.storage.sync.get` before init - race conditions possible on slow networks
5. **Context menu IDs**: Generated via `object-hash` - changing prompt text changes ID, breaks user customizations

---
*Last updated: 2025-11-23. For questions on specific subsystems (e.g., screenshot capture, chat history persistence), ask for targeted guidance.*
