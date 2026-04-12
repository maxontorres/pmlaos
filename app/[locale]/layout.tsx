import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { Noto_Sans_Lao } from 'next/font/google'
import { routing } from '@/i18n/routing'
import Navbar from '@/app/components/Navbar'
import Footer from '@/app/components/Footer'
import WhatsAppWidget from '@/components/shared/WhatsAppWidget'

const notoSansLao = Noto_Sans_Lao({
  subsets: ['lao'],
  weight: ['400', '600', '700'],
  display: 'swap',
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout(props: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await props.params

  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <div className={locale === 'lo' ? notoSansLao.className : undefined}>
        <Navbar locale={locale} />
        <main>{props.children}</main>
        <Footer locale={locale} />
        <WhatsAppWidget />
      </div>
    </NextIntlClientProvider>
  )
}
