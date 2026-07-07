import { useAuthActions } from '@convex-dev/auth/react'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeftRight, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import type { Doc } from '@economy-tracker/convex/dataModel'
import {
  budgetNavGroups,
  globalNavItems,
  type NavItem,
} from '@/lib/app-navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type AppSidebarProps = {
  collapsed: boolean
  onToggle: () => void
  user: Doc<'users'>
  budgetName?: string
}

function NavLink({
  item,
  collapsed,
  params,
}: {
  item: NavItem
  collapsed: boolean
  params?: { budgetId: string }
}) {
  const Icon = item.icon

  return (
    <Link
      to={item.to}
      params={params}
      activeOptions={{ exact: item.exact }}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-semibold no-underline transition-colors',
        'text-[var(--text-muted)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--text)]',
        collapsed && 'justify-center px-2',
      )}
      activeProps={{
        className:
          'bg-[rgba(94,174,255,0.12)] text-[var(--accent)] hover:bg-[rgba(94,174,255,0.12)] hover:text-[var(--accent)]',
      }}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
    </Link>
  )
}

export default function AppSidebar({
  collapsed,
  onToggle,
  user,
  budgetName,
}: AppSidebarProps) {
  const { signOut } = useAuthActions()
  const params = useParams({ strict: false })
  const budgetId = params.budgetId
  const inBudget = Boolean(budgetId)
  const linkParams = budgetId ? { budgetId } : undefined

  return (
    <aside
      className={cn(
        'app-sidebar flex h-full shrink-0 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)]',
        collapsed ? 'w-[3.75rem]' : 'w-60',
      )}
    >
      <div
        className={cn(
          'flex items-center border-b border-[var(--sidebar-border)] px-3 py-3',
          collapsed ? 'justify-center' : 'gap-2',
        )}
      >
        <Link
          to="/dashboard"
          className={cn(
            'inline-flex min-w-0 items-center gap-2 rounded-lg no-underline',
            collapsed && 'justify-center',
          )}
          title="Economy Tracker"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            <span className="size-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
          </span>
          {!collapsed ? (
            <span className="truncate text-sm font-semibold text-[var(--text)]">
              Economy Tracker
            </span>
          ) : null}
        </Link>
      </div>

      {inBudget ? (
        <div
          className={cn(
            'border-b border-[var(--sidebar-border)] px-3 py-3',
            collapsed && 'px-2',
          )}
        >
          {!collapsed ? (
            <>
              <Link
                to="/dashboard"
                className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] no-underline hover:text-[var(--accent)]"
              >
                <ArrowLeftRight className="size-3.5" />
                All budgets
              </Link>
              <p className="m-0 truncate text-sm font-semibold text-[var(--text)]">
                {budgetName ?? 'Budget'}
              </p>
            </>
          ) : (
            <Link
              to="/dashboard"
              className="flex justify-center rounded-lg p-2 text-[var(--text-muted)] no-underline hover:bg-[var(--sidebar-accent)] hover:text-[var(--text)]"
              title="All budgets"
            >
              <ArrowLeftRight className="size-4" />
            </Link>
          )}
        </div>
      ) : null}

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {!inBudget ? (
          <div className="space-y-1">
            {!collapsed ? (
              <p className="px-2.5 pb-1 text-[0.65rem] font-bold tracking-[0.16em] text-[var(--text-muted)] uppercase">
                Workspace
              </p>
            ) : null}
            {globalNavItems.map((item) => (
              <NavLink key={item.to} item={item} collapsed={collapsed} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {budgetNavGroups.map((group) => (
              <div key={group.label} className="space-y-1">
                {!collapsed ? (
                  <p className="px-2.5 pb-1 text-[0.65rem] font-bold tracking-[0.16em] text-[var(--text-muted)] uppercase">
                    {group.label}
                  </p>
                ) : null}
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    item={item}
                    collapsed={collapsed}
                    params={linkParams}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </nav>

      <div className="mt-auto border-t border-[var(--sidebar-border)] p-2">
        {!collapsed && (user.name || user.email) ? (
          <p className="mb-2 truncate px-2.5 text-xs text-[var(--text-muted)]">
            {user.name ?? user.email}
          </p>
        ) : null}
        <div className={cn('flex gap-1', collapsed ? 'flex-col' : 'items-center')}>
          <Button
            type="button"
            variant="ghost"
            size={collapsed ? 'icon-sm' : 'sm'}
            className={cn(!collapsed && 'flex-1')}
            onClick={() => void signOut()}
            title="Sign out"
          >
            {collapsed ? <LogOut className="size-4" /> : 'Sign out'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </Button>
        </div>
      </div>
    </aside>
  )
}
