import { redirect } from 'next/navigation'

export default async function LegacyAdminLoginPage() {
  redirect('/admin')
}
