import './globals.css'
import './chart-theme.css'
import type { Metadata } from 'next'
import { Fraunces, JetBrains_Mono, Source_Sans_3 } from 'next/font/google'

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MediTwin Studio · Pharmacokinetic anatomy',
  description:
    'Educational digital twin: visualize medicine pathways, organ emphasis, and longitudinal effects across a patient profile you control.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${sourceSans.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}>
      <body className={sourceSans.className}>
        {children}
      </body>
    </html>
  )
}
