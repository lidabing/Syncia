import React from 'react'
import { usePageSuggestions } from '../../../hooks/usePageSuggestions'

interface PageSuggestionsProps {
  onSelectSuggestion: (suggestion: string) => void
}

const PageSuggestions = ({ onSelectSuggestion }: PageSuggestionsProps) => {
  const { suggestions, isLoading, hasSuggestions } = usePageSuggestions()

  // Don't render if no suggestions or loading
  if (!hasSuggestions && !isLoading) {
    return null
  }

  return (
    <div className="cdx-px-4 cdx-py-4 cdx-border-b dark:cdx-border-neutral-700/50 cdx-border-neutral-200 cdx-bg-gradient-to-b cdx-from-transparent cdx-to-neutral-50/50 dark:cdx-to-neutral-800/30">
      <div className="cdx-flex cdx-items-center cdx-gap-2 cdx-mb-3">
        <span className="cdx-text-base">💡</span>
        <h3 className="cdx-text-sm cdx-font-semibold dark:cdx-text-neutral-300 cdx-text-neutral-700">
          你可能想要...
        </h3>
      </div>
      
      {isLoading ? (
        <div className="cdx-space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="cdx-h-11 cdx-rounded-xl cdx-bg-neutral-200 dark:cdx-bg-neutral-700/50 cdx-animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="cdx-space-y-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSelectSuggestion(suggestion)}
              className="cdx-w-full cdx-text-left cdx-px-3.5 cdx-py-2.5 cdx-rounded-xl cdx-text-sm
                cdx-bg-white dark:cdx-bg-neutral-800/50
                hover:cdx-bg-blue-50 dark:hover:cdx-bg-blue-900/20
                cdx-transition-all cdx-duration-200
                dark:cdx-text-neutral-200 cdx-text-neutral-700
                cdx-border cdx-border-neutral-200 dark:cdx-border-neutral-700/50
                hover:cdx-border-blue-300 dark:hover:cdx-border-blue-700/50
                hover:cdx-shadow-sm
                cdx-group"
            >
              <span className="group-hover:cdx-text-blue-600 dark:group-hover:cdx-text-blue-400 cdx-transition-colors">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default PageSuggestions
