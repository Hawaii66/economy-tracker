import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Authenticated, Unauthenticated } from 'convex/react'
import { api } from '@economy-tracker/convex/api'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { data: ping, isPending, isError } = useQuery(
    convexQuery(api.health.ping, {}),
  )
  const { data: user } = useQuery(convexQuery(api.users.currentUser, {}))

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="panel rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(94,174,255,0.2),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(46,122,212,0.12),transparent_66%)]" />
        <p className="kicker mb-3">Economy Tracker</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] tracking-tight text-[var(--text)] sm:text-6xl">
          Track budgets together.
        </h1>
        <p className="mb-8 max-w-2xl text-base text-[var(--text-muted)] sm:text-lg">
          Real-time budget state powered by Convex. Sign in with GitHub to
          create budgets, invite collaborators, and branch scenarios.
        </p>
        <div className="flex flex-wrap gap-3">
          <Authenticated>
            <Link to="/dashboard" className="btn-primary !px-5 !py-2.5 text-sm">
              Go to dashboard
            </Link>
          </Authenticated>
          <Unauthenticated>
            <Link to="/sign-in" className="btn-primary !px-5 !py-2.5 text-sm">
              Sign in
            </Link>
          </Unauthenticated>
          <Link to="/about" className="btn-ghost !px-5 !py-2.5 text-sm">
            About
          </Link>
        </div>
      </section>

      <section className="panel mt-8 rounded-2xl p-6">
        <p className="kicker mb-2">Convex Status</p>
        <dl className="m-0 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-[var(--text)]">Backend</dt>
            <dd className="m-0 text-[var(--text-muted)]">
              {isPending ? 'Connecting…' : isError ? 'Unreachable' : 'Connected'}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--text)]">Health check</dt>
            <dd className="m-0 text-[var(--text-muted)]">
              {isPending ? '…' : ping?.ok ? 'OK' : 'Failed'}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-semibold text-[var(--text)]">Session</dt>
            <dd className="m-0 text-[var(--text-muted)]">
              {user ? (
                <>
                  Signed in{user.email ? ` as ${user.email}` : ''}.{' '}
                  <Link to="/dashboard" className="font-semibold text-[var(--accent)]">
                    Open dashboard
                  </Link>
                </>
              ) : (
                <>
                  Not signed in.{' '}
                  <Link to="/sign-in" className="font-semibold text-[var(--accent)]">
                    Sign in
                  </Link>
                </>
              )}
            </dd>
          </div>
        </dl>
      </section>
    </main>
  )
}
