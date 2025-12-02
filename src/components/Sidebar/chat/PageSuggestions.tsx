import React from 'react'
import { usePageSuggestions } from '../../../hooks/usePageSuggestions'

interface PageSuggestionsProps {
  onSelectSuggestion: (suggestion: string) => void
}

const PageSuggestions = ({ onSelectSuggestion }: PageSuggestionsProps) => {
  const { suggestions, isLoading, hasSuggestions } = usePageSuggestions()

  // Always show the section when loading or has suggestions
  if (!hasSuggestions && !isLoading) {
    return null
  }

  return (
    <div className="cdx-px-3 cdx-py-3 cdx-border-b dark:cdx-border-neutral-700/50 cdx-border-neutral-200 cdx-bg-gradient-to-br cdx-from-blue-50/50 cdx-via-purple-50/30 cdx-to-transparent dark:cdx-from-blue-900/15 dark:cdx-via-purple-900/10 dark:cdx-to-transparent cdx-shadow-sm">
      {isLoading ? (
        <div className="cdx-space-y-1.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="cdx-h-10 cdx-rounded-lg cdx-bg-gradient-to-r cdx-from-neutral-200 cdx-via-neutral-100 cdx-to-neutral-200 dark:cdx-from-neutral-700/50 dark:cdx-via-neutral-800/50 dark:cdx-to-neutral-700/50 cdx-animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="cdx-space-y-1.5">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSelectSuggestion(suggestion)}
              className="cdx-w-full cdx-text-left cdx-px-3 cdx-py-2 cdx-rounded-lg cdx-text-xs
                cdx-bg-gradient-to-r cdx-from-white cdx-to-blue-50/50 dark:cdx-from-neutral-800 dark:cdx-to-blue-900/20
                hover:cdx-from-blue-50 hover:cdx-to-blue-100 dark:hover:cdx-from-blue-900/30 dark:hover:cdx-to-blue-800/30
                cdx-transition-all cdx-duration-200
                dark:cdx-text-neutral-100 cdx-text-neutral-700
                cdx-border cdx-border-blue-200/60 dark:cdx-border-blue-800/40
                hover:cdx-border-blue-400 dark:hover:cdx-border-blue-600
                hover:cdx-shadow-sm hover:cdx-scale-[1.01]
                cdx-group cdx-relative cdx-overflow-hidden
                cdx-leading-relaxed"
            >
              <div className="cdx-absolute cdx-inset-0 cdx-bg-gradient-to-r cdx-from-blue-400/0 cdx-via-blue-400/5 cdx-to-blue-400/0 cdx-opacity-0 group-hover:cdx-opacity-100 cdx-transition-opacity" />
              <span className="cdx-relative cdx-flex cdx-items-center cdx-gap-1.5 group-hover:cdx-text-blue-600 dark:group-hover:cdx-text-blue-300 cdx-transition-colors">
                <span className="cdx-text-blue-500 dark:cdx-text-blue-400 cdx-text-[10px]">▸</span>
                {suggestion}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default PageSuggestions
