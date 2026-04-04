import { auth } from '@/lib/auth'
import { signOut } from '@/lib/auth'

export default async function AdminDashboard() {
  const session = await auth()

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Admin Dashboard</h1>
      <p>Signed in as {session?.user?.name} ({(session?.user as { role?: string })?.role})</p>
      <form
        action={async () => {
          'use server'
          await signOut({ redirectTo: '/admin/login' })
        }}
      >
        <button type="submit">Sign out</button>
      </form>
    </main>
  )
}
