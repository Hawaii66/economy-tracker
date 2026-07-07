import { Link } from '@tanstack/react-router'
import { Authenticated } from 'convex/react'
import AuthButton from './AuthButton'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[rgba(14,13,12,0.82)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text)] no-underline sm:px-4 sm:py-2"
          >
            <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
            Economy Tracker
          </Link>
        </h2>

        <div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-none sm:w-auto sm:flex-nowrap sm:pb-0">
          <Link
            to="/"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Home
          </Link>
          <Link
            to="/about"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            About
          </Link>
          <a
            href="https://tanstack.com/start/latest/docs/framework/react/overview"
            className="nav-link"
            target="_blank"
            rel="noreferrer"
          >
            Docs
          </a>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Authenticated>
            <Link
              to="/dashboard"
              className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-[var(--text)] no-underline transition hover:bg-[var(--surface)]"
            >
              Dashboard
            </Link>
          </Authenticated>
          <AuthButton />
        </div>
      </nav>
    </header>
  )
}
