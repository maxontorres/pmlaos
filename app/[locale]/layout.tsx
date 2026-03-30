import { Noto_Sans_Lao } from 'next/font/google'
import Navbar from '@/app/components/Navbar'
import Footer from '@/app/components/Footer'

const notoSansLao = Noto_Sans_Lao({
  subsets: ['lao'],
  weight: ['400', '600', '700'],
  display: 'swap',
})

export default async function LocaleLayout(props: LayoutProps<'/[locale]'>) {
  const { locale } = await props.params
  return (
    <div className={locale === 'lo' ? notoSansLao.className : undefined}>
      <Navbar locale={locale} />
      <main>{props.children}</main>
      <Footer locale={locale} />
    </div>
  )
}
