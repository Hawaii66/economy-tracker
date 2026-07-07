import { useAuthActions } from '@convex-dev/auth/react'
import { Link } from '@tanstack/react-router'
import type { Doc } from '@economy-tracker/convex/dataModel'
import { Button } from '@/components/ui/button'

type DashboardHeaderProps = {
  user: Doc<'users'>
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const { signOut } = useAuthActions()

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[rgba(14,13,12,0.82)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text)] no-underline sm:px-4 sm:py-2"
          >
            <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
            Economy Tracker
          </Link>
        </h2>

        <div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-none sm:w-auto sm:flex-nowrap sm:pb-0">
          <Link
            to="/dashboard"
            className="nav-link"
            activeOptions={{ exact: true }}
            activeProps={{ className: 'nav-link is-active' }}
          >
            Budgets
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {user.name || user.email ? (
            <span className="hidden max-w-40 truncate text-sm text-[var(--text-muted)] sm:inline">
              {user.name ?? user.email}
            </span>
          ) : null}
          <Button type="button" variant="ghost" size="sm" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      </nav>
    </header>
  )
}
