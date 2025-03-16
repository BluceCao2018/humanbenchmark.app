import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gyroscope Balance Test - HumanBenchmark',
  description: 'Test your balance and coordination skills by keeping your phone level.',
  openGraph: {
    title: 'Gyroscope Balance Test - HumanBenchmark',
    description: 'Test your balance and coordination skills by keeping your phone level.',
  },
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-gray-900">
      {children}
    </main>
  )
} 