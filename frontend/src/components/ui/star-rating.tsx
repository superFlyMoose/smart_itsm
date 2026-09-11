import { useState } from 'react'
import { Star } from '@phosphor-icons/react'

interface StarRatingProps {
  value: number
  onChange?: (score: number) => void
  size?: number
  readOnly?: boolean
}

export function StarRating({ value, onChange, size = 22, readOnly = false }: StarRatingProps) {
  const [hover, setHover] = useState(0)
  const display = hover || value

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => !readOnly && setHover(0)}>
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          disabled={readOnly}
          aria-label={`${score} 星`}
          onMouseEnter={() => !readOnly && setHover(score)}
          onClick={() => onChange?.(score)}
          className={readOnly ? 'cursor-default' : 'cursor-pointer transition-transform active:scale-90'}
        >
          <Star
            size={size}
            weight={score <= display ? 'fill' : 'regular'}
            className={score <= display ? 'text-amber-400' : 'text-border-subtle'}
          />
        </button>
      ))}
    </div>
  )
}
