import type { ReactNode } from 'react'
import {
  BookOpen,
  Bell,
  ChartBar,
  Gauge,
  PlusCircle,
  ShieldCheck,
  Swap,
  Tag,
  Ticket,
  Timer,
  Tray,
  UsersThree,
  Users,
  Buildings,
} from '@phosphor-icons/react'
import type { LoginUser } from '@/types/auth'

export interface NavItem {
  to: string
  label: string
  icon: ReactNode
  /** 拥有任一权限码即可见；为空表示登录即可见 */
  anyPermission?: string[]
  /** 是否仅路径完全一致时高亮（避免作为其他菜单路径前缀时被连带激活） */
  exact?: boolean
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export function buildNavGroups(user: LoginUser | null): NavGroup[] {
  const has = (codes?: string[]) =>
    !codes || codes.some((code) => user?.permissions.includes(code))

  const groups: NavGroup[] = [
    {
      title: '工作台',
      items: [
        { to: '/', label: '仪表盘', icon: <Gauge size={18} /> },
        { to: '/tickets', label: '全部工单', icon: <Ticket size={18} />, exact: true },
        {
          to: '/my-tickets',
          label: '我的待办',
          icon: <Tray size={18} />,
          anyPermission: ['ticket:accept', 'ticket:view:assigned'],
        },
        {
          to: '/transfer-requests',
          label: '跨团队转派',
          icon: <Swap size={18} />,
          anyPermission: ['ticket:transfer', 'ticket:transfer:approve'],
        },
        { to: '/tickets/new', label: '新建工单', icon: <PlusCircle size={18} /> },
        { to: '/knowledge', label: '知识库', icon: <BookOpen size={18} /> },
        { to: '/notifications', label: '通知中心', icon: <Bell size={18} /> },
      ],
    },
    {
      title: '服务运营',
      items: [
        {
          to: '/sla/tickets',
          label: 'SLA 监控',
          icon: <Timer size={18} />,
          anyPermission: ['sla:view', 'sla:manage'],
        },
        {
          to: '/sla/rules',
          label: 'SLA 规则',
          icon: <ShieldCheck size={18} />,
          anyPermission: ['sla:view', 'sla:manage'],
        },
        {
          to: '/reports',
          label: '统计报表',
          icon: <ChartBar size={18} />,
          anyPermission: ['report:view'],
        },
      ],
    },
    {
      title: '系统管理',
      items: [
        {
          to: '/admin/users',
          label: '用户管理',
          icon: <Users size={18} />,
          anyPermission: ['user:manage'],
        },
        {
          to: '/admin/departments',
          label: '部门管理',
          icon: <Buildings size={18} />,
          anyPermission: ['department:manage'],
        },
        {
          to: '/admin/teams',
          label: '团队管理',
          icon: <UsersThree size={18} />,
          anyPermission: ['team:manage'],
        },
        {
          to: '/admin/categories',
          label: '分类管理',
          icon: <Tag size={18} />,
          anyPermission: ['category:manage'],
        },
        {
          to: '/admin/roles',
          label: '角色权限',
          icon: <ShieldCheck size={18} />,
          anyPermission: ['role:manage', 'permission:manage'],
        },
      ],
    },
  ]

  return groups
    .map((group) => ({ ...group, items: group.items.filter((item) => has(item.anyPermission)) }))
    .filter((group) => group.items.length > 0)
}
