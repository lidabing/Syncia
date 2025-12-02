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
    <div className="cdx-px-3 cdx-py-3 cdx-border-b dark:cdx-border-neutral-800/50 cdx-border-neutral-200/50 cdx-bg-neutral-50/50 dark:cdx-bg-neutral-800/30">
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
              className="cdx-w-full cdx-text-left cdx-px-3 cdx-py-2.5 cdx-rounded-lg cdx-text-xs
                cdx-bg-white dark:cdx-bg-neutral-800/80
                hover:cdx-bg-blue-50 dark:hover:cdx-bg-blue-900/20
                cdx-transition-all cdx-duration-200
                dark:cdx-text-neutral-200 cdx-text-neutral-700
                cdx-border cdx-border-neutral-200 dark:cdx-border-neutral-700/50
                hover:cdx-border-blue-300 dark:hover:cdx-border-blue-700
                hover:cdx-shadow-sm
                cdx-group
                cdx-leading-relaxed cdx-font-medium"
            >
              <span className="cdx-flex cdx-items-center cdx-gap-2 group-hover:cdx-text-blue-600 dark:group-hover:cdx-text-blue-400 cdx-transition-colors">
                <span className="cdx-text-blue-500 dark:cdx-text-blue-400 cdx-text-[10px] cdx-opacity-60">●</span>
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
