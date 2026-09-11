import { Badge } from '@/components/ui/badge'
import {
  COLLABORATION_STATUS_META,
  PRIORITY_META,
  TICKET_STATUS_META,
} from '@/lib/constants'
import type {
  CollaborationStatus,
  TicketPriority,
  TicketStatus,
} from '@/types/ticket'

export function StatusBadge({ status }: { status: TicketStatus }) {
  const meta = TICKET_STATUS_META[status]
  return <Badge tone={meta.tone} dot>{meta.label}</Badge>
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const meta = PRIORITY_META[priority]
  return <Badge tone={meta.tone}>{meta.label}</Badge>
}

export function CollaborationStatusBadge({ status }: { status: CollaborationStatus }) {
  const meta = COLLABORATION_STATUS_META[status]
  return <Badge tone={meta.tone}>{meta.label}</Badge>
}
