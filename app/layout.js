// app/layout.js
import './globals.css'

export const metadata = {
  title: 'AI Study Buddy - Belajar Lebih Mudah',
  description: 'Platform belajar dengan AI tutor 24/7',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}