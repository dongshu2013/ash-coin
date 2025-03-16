import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import WalletContextProvider from '@/components/WalletContextProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Ash Coin - Burn Memecoins, Earn Rewards',
  description: 'Burn your Solana memecoins to earn Ash Coin credits and rewards',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  )
} 