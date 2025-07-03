import type { Metadata } from 'next'
import './globals.css'
import { MainLayout } from '@/components/main-layout'

export const metadata: Metadata = {
  title: 'Global Talent Hub Admin',
  description: 'Admin panel for an international job portal.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body className="font-body antialiased">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  )
}
