export default function AdminLayout(props: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  return <div>{props.children}</div>
}
