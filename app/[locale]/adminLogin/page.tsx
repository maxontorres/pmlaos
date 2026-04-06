import { redirect } from 'next/navigation'

export default async function LegacyAdminLoginShortcutPage() {
  redirect('/admin')
}
