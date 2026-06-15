interface Props {
  current: number
  max: number
  label?: string
  className?: string
}

export function ProgressBar({ current, max, label, className = '' }: Props) {
  const pct = Math.min(100, (current / max) * 100)
  return (
    <div className={`w-full ${className}`}>
      {label && <div className="text-xs text-gray-500 mb-1">{label}</div>}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1 text-right">{pct.toFixed(1)}%</div>
    </div>
  )
}
