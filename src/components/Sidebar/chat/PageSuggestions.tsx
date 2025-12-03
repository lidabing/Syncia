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
    <div className="cdx-px-2 cdx-py-1.5 cdx-border-b dark:cdx-border-neutral-800/50 cdx-border-neutral-200/50 cdx-bg-gradient-to-r cdx-from-blue-50/40 cdx-to-purple-50/40 dark:cdx-from-blue-950/15 dark:cdx-to-purple-950/15">

      {isLoading ? (
        <div className="cdx-space-y-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="cdx-relative cdx-h-7 cdx-rounded-md cdx-overflow-hidden cdx-bg-white/50 dark:cdx-bg-neutral-800/30"
            >
              <div className="cdx-absolute cdx-inset-0 cdx-bg-gradient-to-r cdx-from-transparent cdx-via-blue-100/50 dark:cdx-via-blue-900/20 cdx-to-transparent cdx-animate-shimmer" 
                   style={{ backgroundSize: '200% 100%' }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="cdx-space-y-1">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSelectSuggestion(suggestion)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cdx-group cdx-relative cdx-w-full cdx-text-left cdx-px-2 cdx-py-1.5 cdx-rounded-md cdx-text-[11px]
                cdx-bg-white/70 dark:cdx-bg-neutral-800/40
                hover:cdx-bg-gradient-to-r hover:cdx-from-blue-50 hover:cdx-to-purple-50
                dark:hover:cdx-from-blue-900/25 dark:hover:cdx-to-purple-900/15
                cdx-transition-all cdx-duration-200
                dark:cdx-text-neutral-200 cdx-text-neutral-700
                cdx-border cdx-border-neutral-200/60 dark:cdx-border-neutral-700/40
                hover:cdx-border-blue-400/50 dark:hover:cdx-border-blue-600/40
                hover:cdx-shadow-sm hover:cdx-shadow-blue-500/5
                cdx-leading-snug
                hover:cdx-scale-[1.01] cdx-transform"
            >
              <div className="cdx-flex cdx-items-center cdx-gap-1.5">
                {/* 序号 */}
                <span className="cdx-flex-shrink-0 cdx-flex cdx-items-center cdx-justify-center cdx-w-3.5 cdx-h-3.5 cdx-rounded cdx-bg-blue-500/10 dark:cdx-bg-blue-500/15 cdx-text-[8px] cdx-font-bold cdx-text-blue-600 dark:cdx-text-blue-400 group-hover:cdx-bg-gradient-to-br group-hover:cdx-from-blue-500 group-hover:cdx-to-purple-600 group-hover:cdx-text-white cdx-transition-all cdx-duration-200">
                  {index + 1}
                </span>
                
                {/* 文本 */}
                <span className="cdx-flex-1 cdx-line-clamp-1 group-hover:cdx-text-blue-700 dark:group-hover:cdx-text-blue-300 cdx-transition-colors">
                  {suggestion}
                </span>

                {/* 箭头 */}
                <RiArrowRightSLine 
                  className={`cdx-flex-shrink-0 cdx-text-neutral-400 dark:cdx-text-neutral-500 group-hover:cdx-text-blue-600 dark:group-hover:cdx-text-blue-400 cdx-transition-all cdx-duration-200 ${
                    hoveredIndex === index ? 'cdx-translate-x-0.5' : ''
                  }`}
                  size={14}
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
