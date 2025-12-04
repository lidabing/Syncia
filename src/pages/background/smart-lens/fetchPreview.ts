/**
 * Smart Lens Background Script Handler
 * Handles link preview fetching to avoid CORS issues
 */

import { parseOpenGraph, generateAISummary } from '../../../lib/smartLens/contentFetcher'
import type { LinkPreviewData } from '../../../config/settings/smartLens'

export function setupSmartLensListener() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'smart-lens-fetch-preview') {
      handleFetchPreview(message.url)
        .then(sendResponse)
        .catch((error) => {
          console.error('Smart Lens fetch error:', error)
          sendResponse(null)
        })
      return true // Keep the message channel open for async response
    }
  })
}

async function handleFetchPreview(url: string): Promise<LinkPreviewData | null> {
  try {
    // Fetch the page HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const previewData = parseOpenGraph(html, url)

    // Generate AI summary if enabled
    const settings = await chrome.storage.sync.get('SETTINGS')
    if (settings.SETTINGS?.smartLens?.enableAISummary && settings.SETTINGS?.chat?.openAIKey) {
      try {
        // Extract text content using regex (DOMParser not available in Service Worker)
        const textContent = extractTextFromHtml(html)

        if (textContent.length > 500) {
          const summary = await generateAISummary(
            textContent,
            settings.SETTINGS.chat.openAIKey,
            settings.SETTINGS.chat.openAiBaseUrl,
            previewData.type
          )
          previewData.aiSummary = summary
        }
      } catch (error) {
        console.error('Failed to generate AI summary:', error)
        // Continue without summary
      }
    }

    return previewData
  } catch (error) {
    console.error('Failed to fetch preview:', error)
    return null
  }
}

/**
 * Extract text content from HTML without DOMParser (for Service Worker)
 */
function extractTextFromHtml(html: string): string {
  // Remove script and style tags with their content
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ')
  
  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, ' ')
  text = text.replace(/&amp;/g, '&')
  text = text.replace(/&lt;/g, '<')
  text = text.replace(/&gt;/g, '>')
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#39;/g, "'")
  
  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim()
  
  // Limit length for AI processing
  return text.slice(0, 5000)
}
