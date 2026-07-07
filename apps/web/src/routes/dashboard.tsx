import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'
import { createFileRoute, useLocation, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { api } from '@economy-tracker/convex/api'
import DashboardShell from '@/components/DashboardShell'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <>
      <AuthLoading>
        <DashboardLoading message="Checking session…" />
      </AuthLoading>
      <Unauthenticated>
        <DashboardSignInRedirect />
      </Unauthenticated>
      <Authenticated>
        <AuthenticatedDashboard />
      </Authenticated>
    </>
  )
}

function AuthenticatedDashboard() {
  const { data: user, isPending } = useQuery(convexQuery(api.users.currentUser, {}))

  if (isPending || !user) {
    return <DashboardLoading message="Loading dashboard…" />
  }

  return <DashboardShell user={user} />
}

function DashboardSignInRedirect() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    void navigate({
      to: '/sign-in',
      search: { redirect: location.href },
    })
  }, [location.href, navigate])

  return <DashboardLoading message="Redirecting to sign in…" />
}

function DashboardLoading({ message }: { message: string }) {
  return (
    <div className="budget-page">
      <p className="m-0 text-sm text-[var(--text-muted)]">{message}</p>
    </div>
  )
}
