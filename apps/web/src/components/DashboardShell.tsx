import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { Outlet, useParams } from '@tanstack/react-router'
import { api } from '@economy-tracker/convex/api'
import type { Doc, Id } from '@economy-tracker/convex/dataModel'
import AppSidebar from '@/components/AppSidebar'
import { useSidebarCollapsed } from '@/hooks/use-sidebar-collapsed'

type DashboardShellProps = {
  user: Doc<'users'>
}

export default function DashboardShell({ user }: DashboardShellProps) {
  const { collapsed, toggle } = useSidebarCollapsed()
  const params = useParams({ strict: false })
  const budgetId = params.budgetId
  const { data: budget } = useQuery({
    ...convexQuery(api.budgets.getBudgetState, {
      budgetId: budgetId as Id<'budgets'>,
    }),
    enabled: Boolean(budgetId),
  })

  return (
    <div className="app-shell">
      <AppSidebar
        collapsed={collapsed}
        onToggle={toggle}
        user={user}
        budgetName={budget?.name}
      />
      <div className="app-shell-main">
        <Outlet />
      </div>
    </div>
  )
}
