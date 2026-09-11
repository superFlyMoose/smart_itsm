/** 集中维护 React Query 键，保证失效范围可控 */
export const queryKeys = {
  tickets: {
    list: (query: unknown) => ['tickets', 'list', query] as const,
    detail: (id: number) => ['tickets', 'detail', id] as const,
    comments: (id: number) => ['tickets', id, 'comments'] as const,
    history: (id: number) => ['tickets', id, 'history'] as const,
    collaborations: (id: number) => ['tickets', id, 'collaborations'] as const,
    attachments: (id: number) => ['tickets', id, 'attachments'] as const,
    rating: (id: number) => ['tickets', id, 'rating'] as const,
    sla: (id: number) => ['tickets', id, 'sla'] as const,
  },
  users: {
    list: (query: unknown) => ['users', 'list', query] as const,
    profile: () => ['users', 'me'] as const,
  },
  categories: { tree: () => ['categories', 'tree'] as const },
  departments: { tree: () => ['departments', 'tree'] as const },
  teams: {
    list: () => ['teams', 'list'] as const,
    detail: (id: number) => ['teams', 'detail', id] as const,
  },
  roles: { list: () => ['roles', 'list'] as const },
  permissions: { list: () => ['permissions', 'list'] as const },
  knowledge: {
    list: (query: unknown) => ['knowledge', 'list', query] as const,
    detail: (id: number) => ['knowledge', 'detail', id] as const,
  },
  notifications: {
    list: (query: unknown) => ['notifications', 'list', query] as const,
    unread: () => ['notifications', 'unread-count'] as const,
  },
  sla: {
    tickets: (query: unknown) => ['sla', 'tickets', query] as const,
    rules: () => ['sla', 'rules'] as const,
  },
  transferRequests: {
    list: (query: unknown) => ['transfer-requests', 'list', query] as const,
    detail: (id: number) => ['transfer-requests', 'detail', id] as const,
  },
  reports: {
    overview: () => ['reports', 'overview'] as const,
    trend: (s?: string, e?: string) => ['reports', 'trend', s, e] as const,
    category: () => ['reports', 'category'] as const,
    workload: () => ['reports', 'workload'] as const,
    sla: () => ['reports', 'sla'] as const,
  },
  aiTask: (id: number) => ['ai-task', id] as const,
}
