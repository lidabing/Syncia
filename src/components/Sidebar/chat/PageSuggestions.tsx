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
    <div className="cdx-px-4 cdx-py-3 cdx-border-b dark:cdx-border-neutral-700 cdx-border-neutral-200">
      <h3 className="cdx-text-sm cdx-font-semibold cdx-mb-2 dark:cdx-text-neutral-300 cdx-text-neutral-700">
        💡 你可能想要...
      </h3>
      
      {isLoading ? (
        <div className="cdx-space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="cdx-h-10 cdx-rounded-md cdx-bg-neutral-200 dark:cdx-bg-neutral-700 cdx-animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="cdx-space-y-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSelectSuggestion(suggestion)}
              className="cdx-w-full cdx-text-left cdx-px-3 cdx-py-2 cdx-rounded-md cdx-text-sm
                cdx-bg-neutral-100 dark:cdx-bg-neutral-700/50
                hover:cdx-bg-neutral-200 dark:hover:cdx-bg-neutral-600/50
                cdx-transition-colors cdx-duration-150
                dark:cdx-text-neutral-200 cdx-text-neutral-800
                cdx-border cdx-border-transparent hover:cdx-border-neutral-300 dark:hover:cdx-border-neutral-600"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default PageSuggestions
