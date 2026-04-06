import { redirect } from 'next/navigation'

export default async function LegacyLocaleAdminLayout() {
  redirect('/admin')
}
