import { avatarColor, initialsOf } from '@/lib/format'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md'
}

const sizeClass = {
  sm: 'size-6 text-[10px]',
  md: 'size-8 text-xs',
}

export function Avatar({ name, size = 'md' }: AvatarProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${avatarColor(name)} ${sizeClass[size]}`}
      title={name}
    >
      {initialsOf(name)}
    </span>
  )
}
