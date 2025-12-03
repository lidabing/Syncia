import React, { useState } from 'react'
import { RiSparklingFill, RiArrowRightSLine } from 'react-icons/ri'
import { usePageSuggestions } from '../../../hooks/usePageSuggestions'

interface PageSuggestionsProps {
  onSelectSuggestion: (suggestion: string) => void
}

const PageSuggestions = ({ onSelectSuggestion }: PageSuggestionsProps) => {
  const { suggestions, isLoading, hasSuggestions } = usePageSuggestions()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Always show the section when loading or has suggestions
  if (!hasSuggestions && !isLoading) {
    return null
  }

  return (
    <div className="cdx-px-4 cdx-py-3 cdx-border-b dark:cdx-border-neutral-800 cdx-border-neutral-200 cdx-bg-neutral-50/50 dark:cdx-bg-neutral-800/30">

      {isLoading ? (
        <div className="cdx-space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="cdx-h-9 cdx-rounded-lg cdx-bg-neutral-200/50 dark:cdx-bg-neutral-700/30 cdx-animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="cdx-space-y-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSelectSuggestion(suggestion)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cdx-group cdx-w-full cdx-text-left cdx-px-3 cdx-py-2 cdx-rounded-lg cdx-text-[13px]
                cdx-bg-white dark:cdx-bg-neutral-800
                hover:cdx-bg-blue-50 dark:hover:cdx-bg-blue-900/20
                cdx-transition-colors
                dark:cdx-text-neutral-200 cdx-text-neutral-700
                cdx-border cdx-border-neutral-200 dark:cdx-border-neutral-700
                hover:cdx-border-blue-300 dark:hover:cdx-border-blue-700"
            >
              <div className="cdx-flex cdx-items-center cdx-gap-2.5">
                {/* 序号 */}
                <span className="cdx-flex-shrink-0 cdx-flex cdx-items-center cdx-justify-center cdx-w-5 cdx-h-5 cdx-rounded-md cdx-bg-blue-100 dark:cdx-bg-blue-900/40 cdx-text-[11px] cdx-font-semibold cdx-text-blue-600 dark:cdx-text-blue-400">
                  {index + 1}
                </span>
                
                {/* 文本 */}
                <span className="cdx-flex-1 cdx-line-clamp-1 group-hover:cdx-text-blue-700 dark:group-hover:cdx-text-blue-300 cdx-transition-colors">
                  {suggestion}
                </span>

                {/* 箭头 */}
                <RiArrowRightSLine 
                  className={`cdx-flex-shrink-0 cdx-text-neutral-300 dark:cdx-text-neutral-600 group-hover:cdx-text-blue-500 dark:group-hover:cdx-text-blue-400 cdx-transition-all ${
                    hoveredIndex === index ? 'cdx-translate-x-0.5' : ''
                  }`}
                  size={16}
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default PageSuggestions
