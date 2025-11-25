import React from 'react'

interface IconProps {
  size?: number
  className?: string
  style?: React.CSSProperties
}

export const SummarizeIcon: React.FC<IconProps> = ({ size = 16, className = '', style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <path
      d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5V5Z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const ExplainIcon: React.FC<IconProps> = ({ size = 16, className = '', style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 16V16.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M12 13V12C12 10.8954 12.8954 10 14 10V10C14.5523 10 15 9.55228 15 9V9C15 7.89543 14.1046 7 13 7H12C10.8954 7 10 7.89543 10 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

export const TranslateIcon: React.FC<IconProps> = ({ size = 16, className = '', style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <path
      d="M5 8H13M9 8V5M7.5 12C7.5 12 8.5 14.5 10 16C11.5 17.5 14 19 14 19M10 12C10 12 11 14 12 15M14 12L17 19L20 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 5H21C21.5523 5 22 5.44772 22 6V18C22 18.5523 21.5523 19 21 19H3C2.44772 19 2 18.5523 2 18V6C2 5.44772 2.44772 5 3 5Z"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
)

export const MoreIcon: React.FC<IconProps> = ({ size = 16, className = '', style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <circle cx="12" cy="5" r="2" fill="currentColor" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <circle cx="12" cy="19" r="2" fill="currentColor" />
  </svg>
)

export const AIIcon: React.FC<IconProps> = ({ size = 16, className = '', style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <path
      d="M12 2L14.5 8.5L21 11L14.5 13.5L12 22L9.5 13.5L3 11L9.5 8.5L12 2Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="19" cy="5" r="1.5" fill="currentColor" />
    <circle cx="19" cy="5" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
  </svg>
)
