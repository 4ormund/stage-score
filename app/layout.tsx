import './globals.css'
import { Providers } from './providers'

export const metadata = {
      title: 'Stage Score',
      description: 'Your $SEED token score on Monad',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
      return (
              <html lang="en">
                    <body className="min-h-screen bg-[#0D0D0F] text-white">
                            <Providers>{children}</Providers>
                    </body>
              </html>
            )
}
