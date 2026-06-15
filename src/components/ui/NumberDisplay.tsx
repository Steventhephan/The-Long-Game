import { formatNumber, formatCash, formatRate } from '../../game/persistence'

interface Props {
  value: number
  type?: 'supporters' | 'cash' | 'rate' | 'charisma'
  className?: string
}

export function NumberDisplay({ value, type = 'supporters', className = '' }: Props) {
  let formatted: string
  if (type === 'cash') formatted = formatCash(value)
  else if (type === 'rate') formatted = formatRate(value)
  else formatted = formatNumber(value)
  return <span className={className}>{formatted}</span>
}
