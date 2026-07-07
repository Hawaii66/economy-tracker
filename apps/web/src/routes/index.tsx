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
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />
        <p className="island-kicker mb-3">Economy Tracker</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          Track budgets together.
        </h1>
        <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          Real-time budget state powered by Convex. Sign in with GitHub to
          create budgets, invite collaborators, and branch scenarios.
        </p>
        <div className="flex flex-wrap gap-3">
          <Authenticated>
            <Link
              to="/dashboard"
              className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
            >
              Go to dashboard
            </Link>
          </Authenticated>
          <Unauthenticated>
            <Link
              to="/sign-in"
              className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
            >
              Sign in
            </Link>
          </Unauthenticated>
          <Link
            to="/about"
            className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5"
          >
            About
          </Link>
        </div>
      </section>

      <section className="island-shell mt-8 rounded-2xl p-6">
        <p className="island-kicker mb-2">Convex Status</p>
        <dl className="m-0 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-[var(--sea-ink)]">Backend</dt>
            <dd className="m-0 text-[var(--sea-ink-soft)]">
              {isPending ? 'Connecting…' : isError ? 'Unreachable' : 'Connected'}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--sea-ink)]">Health check</dt>
            <dd className="m-0 text-[var(--sea-ink-soft)]">
              {isPending ? '…' : ping?.ok ? 'OK' : 'Failed'}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-semibold text-[var(--sea-ink)]">Session</dt>
            <dd className="m-0 text-[var(--sea-ink-soft)]">
              {user ? (
                <>
                  Signed in{user.email ? ` as ${user.email}` : ''}.{' '}
                  <Link to="/dashboard" className="font-semibold text-[var(--lagoon-deep)]">
                    Open dashboard
                  </Link>
                </>
              ) : (
                <>
                  Not signed in.{' '}
                  <Link to="/sign-in" className="font-semibold text-[var(--lagoon-deep)]">
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
