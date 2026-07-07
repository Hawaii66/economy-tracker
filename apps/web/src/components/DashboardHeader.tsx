import { useAuthActions } from '@convex-dev/auth/react'
import { Link } from '@tanstack/react-router'
import type { Doc } from '@economy-tracker/convex/dataModel'
import { Button } from '@/components/ui/button'
import ThemeToggle from './ThemeToggle'

type DashboardHeaderProps = {
  user: Doc<'users'>
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const { signOut } = useAuthActions()

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm text-[var(--sea-ink)] no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)] sm:px-4 sm:py-2"
          >
            <span className="h-2 w-2 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
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
            <span className="hidden max-w-40 truncate text-sm text-[var(--sea-ink-soft)] sm:inline">
              {user.name ?? user.email}
            </span>
          ) : null}
          <Button type="button" variant="ghost" size="sm" onClick={() => void signOut()}>
            Sign out
          </Button>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
