type RadishProps = {
  size?: number
  className?: string
}

export function Radish({ size = 24, className }: RadishProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M9 9C7 6 6 4 5 2.5C5 4.5 6 7 9 9Z"
        fill="#22c55e"
      />
      <path
        d="M12 9C11 6 11 3 12 1.5C13 3 13 6 12 9Z"
        fill="#22c55e"
      />
      <path
        d="M15 9C17 6 18 4 19 2.5C19 4.5 18 7 15 9Z"
        fill="#22c55e"
      />

      <path
        d="M6.6 13.5Q9 12.8 12 13.6T17.4 13.5A5.5 5.5 0 0 1 6.6 13.5Z"
        fill="#f5efe2"
      />
      <path
        d="M6.6 13.5A5.5 5.5 0 0 1 17.4 13.5Q15 14.4 12 13.6T6.6 13.5Z"
        fill="#dc2626"
      />

      <ellipse cx="9.8" cy="11.6" rx="1.1" ry="1.4" fill="#f87171" opacity="0.55" />

      <path
        d="M12 20.3C12 21.3 12.5 22.1 12.3 23"
        stroke="#cdc6b6"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  )
}
