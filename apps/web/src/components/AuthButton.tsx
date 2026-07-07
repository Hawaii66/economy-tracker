import { Link } from '@tanstack/react-router'
import { useAuthActions } from '@convex-dev/auth/react'
import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'
import { api } from '@economy-tracker/convex/api'
import { Button } from '@/components/ui/button'

export default function AuthButton() {
  return (
    <>
      <AuthLoading>
        <span className="text-sm text-[var(--text-muted)]">…</span>
      </AuthLoading>
      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
      <Authenticated>
        <SignedInMenu />
      </Authenticated>
    </>
  )
}

function SignInButton() {
  return (
    <Button variant="outline" size="sm" render={<Link to="/sign-in" />} nativeButton={false}>
      Sign in
    </Button>
  )
}

function SignedInMenu() {
  const { signOut } = useAuthActions()
  const { data: user } = useQuery(convexQuery(api.users.currentUser, {}))

  return (
    <div className="flex items-center gap-2">
      {user?.name ? (
        <span className="hidden max-w-32 truncate text-sm text-[var(--text-muted)] sm:inline">
          {user.name}
        </span>
      ) : null}
      <Button type="button" variant="ghost" size="sm" onClick={() => void signOut()}>
        Sign out
      </Button>
    </div>
  )
}
