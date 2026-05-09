type RadishProps = {
  size?: number
  className?: string
}

export function Radish({ size = 48, className }: RadishProps) {
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
        d="M10.7 9.2C9.5 7 8.8 5 8.5 3C9.2 5 10 7.2 11.5 9Z"
        fill="#22c55e"
      />
      <path
        d="M12 9.2C11.4 6.5 11.4 4 12 2C12.6 4 12.6 6.5 12 9.2Z"
        fill="#22c55e"
      />
      <path
        d="M13.3 9.2C14.5 7 15.2 5 15.5 3C14.8 5 14 7.2 12.5 9Z"
        fill="#22c55e"
      />

      <ellipse cx="12" cy="14.5" rx="4" ry="6" fill="#dc2626" />
      <path
        d="M8.8 18.1Q10.5 17.5 12 18T15.2 18.1A4 6 0 0 1 8.8 18.1Z"
        fill="#f5efe2"
      />

      <ellipse cx="10.4" cy="12" rx="1" ry="1.5" fill="#f87171" opacity="0.55" />

      <path
        d="M12 20.5C12 21.5 12.4 22.3 12.3 23.4"
        stroke="#cdc6b6"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  )
}
