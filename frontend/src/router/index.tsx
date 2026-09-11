import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { RequireAuth, RequirePermission } from './guards'
import { LoginPage } from '@/pages/login/login-page'
import { DashboardPage } from '@/pages/dashboard/dashboard-page'
import { TicketListPage } from '@/pages/tickets/ticket-list-page'
import { MyTicketsPage } from '@/pages/tickets/my-tickets-page'
import { TicketCreatePage } from '@/pages/tickets/ticket-create-page'
import { TicketDetailPage } from '@/pages/tickets/ticket-detail-page'
import { TransferRequestsPage } from '@/pages/tickets/transfer-requests-page'
import { KnowledgeListPage } from '@/pages/knowledge/knowledge-list-page'
import { KnowledgeDetailPage } from '@/pages/knowledge/knowledge-detail-page'
import { KnowledgeCreatePage } from '@/pages/knowledge/knowledge-create-page'
import { NotificationsPage } from '@/pages/notifications/notifications-page'
import { SlaTicketsPage } from '@/pages/sla/sla-tickets-page'
import { SlaRulesPage } from '@/pages/sla/sla-rules-page'
import { ReportsPage } from '@/pages/reports/reports-page'
import { UserManagePage } from '@/pages/admin/user-manage-page'
import { DepartmentManagePage } from '@/pages/admin/department-manage-page'
import { TeamManagePage } from '@/pages/admin/team-manage-page'
import { CategoryManagePage } from '@/pages/admin/category-manage-page'
import { RoleManagePage } from '@/pages/admin/role-manage-page'
import { ProfilePage } from '@/pages/profile/profile-page'
import { NotFoundPage } from '@/pages/errors/not-found-page'
import { ForbiddenPage } from '@/pages/errors/forbidden-page'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/403',
    element: (
      <RequireAuth>
        <ForbiddenPage />
      </RequireAuth>
    ),
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'tickets', element: <TicketListPage /> },
      { path: 'my-tickets', element: <MyTicketsPage /> },
      { path: 'tickets/new', element: <TicketCreatePage /> },
      { path: 'tickets/:id', element: <TicketDetailPage /> },
      { path: 'transfer-requests', element: <TransferRequestsPage /> },
      { path: 'knowledge', element: <KnowledgeListPage /> },
      { path: 'knowledge/new', element: <KnowledgeCreatePage /> },
      { path: 'knowledge/:id', element: <KnowledgeDetailPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      {
        path: 'sla/tickets',
        element: (
          <RequirePermission any={['sla:view', 'sla:manage']}>
            <SlaTicketsPage />
          </RequirePermission>
        ),
      },
      {
        path: 'sla/rules',
        element: (
          <RequirePermission any={['sla:view', 'sla:manage']}>
            <SlaRulesPage />
          </RequirePermission>
        ),
      },
      {
        path: 'reports',
        element: (
          <RequirePermission any={['report:view']}>
            <ReportsPage />
          </RequirePermission>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <RequirePermission any={['user:manage']}>
            <UserManagePage />
          </RequirePermission>
        ),
      },
      {
        path: 'admin/departments',
        element: (
          <RequirePermission any={['department:manage']}>
            <DepartmentManagePage />
          </RequirePermission>
        ),
      },
      {
        path: 'admin/teams',
        element: (
          <RequirePermission any={['team:manage']}>
            <TeamManagePage />
          </RequirePermission>
        ),
      },
      {
        path: 'admin/categories',
        element: (
          <RequirePermission any={['category:manage']}>
            <CategoryManagePage />
          </RequirePermission>
        ),
      },
      {
        path: 'admin/roles',
        element: (
          <RequirePermission any={['role:manage', 'permission:manage']}>
            <RoleManagePage />
          </RequirePermission>
        ),
      },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
  { path: '*', element: <Navigate to="/404" replace /> },
  {
    path: '/404',
    element: (
      <RequireAuth>
        <NotFoundPage />
      </RequireAuth>
    ),
  },
])
