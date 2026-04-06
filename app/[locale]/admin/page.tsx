import { redirect } from 'next/navigation'

export default async function LegacyLocaleAdminPage() {
  redirect('/admin')
}
