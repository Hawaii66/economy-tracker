import { useAuthActions } from '@convex-dev/auth/react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { fetchCurrentUser, getSafeRedirectPath } from '@/lib/auth'

type SignInSearch = {
  redirect?: string
}

export const Route = createFileRoute('/sign-in')({
  validateSearch: (search: Record<string, unknown>): SignInSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: async ({ context, search }) => {
    const user = await fetchCurrentUser(context.queryClient)
    if (user) {
      throw redirect({ to: getSafeRedirectPath(search.redirect) })
    }
  },
  component: SignInPage,
})

function SignInPage() {
  const { redirect: redirectTo } = Route.useSearch()

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <AuthLoading>
        <section className="panel mx-auto max-w-md rounded-2xl p-8 text-center">
          <p className="m-0 text-sm text-[var(--text-muted)]">Checking session…</p>
        </section>
      </AuthLoading>
      <Authenticated>
        <SignInRedirect to={getSafeRedirectPath(redirectTo)} />
      </Authenticated>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </main>
  )
}

function SignInRedirect({ to }: { to: string }) {
  const navigate = useNavigate()

  useEffect(() => {
    void navigate({ to })
  }, [navigate, to])

  return null
}

function SignInForm() {
  const { signIn } = useAuthActions()

  return (
    <section className="panel rise-in mx-auto max-w-md rounded-[2rem] px-6 py-10 sm:px-10">
      <p className="kicker mb-3">Sign in</p>
      <h1 className="display-title mb-4 text-3xl tracking-tight text-[var(--text)] sm:text-4xl">
        Welcome back
      </h1>
      <p className="mb-8 text-sm text-[var(--text-muted)] sm:text-base">
        Sign in with GitHub to access your budgets and collaborate with others.
      </p>
      <Button type="button" className="w-full" onClick={() => void signIn('github')}>
        Sign in with GitHub
      </Button>
    </section>
  )
}
