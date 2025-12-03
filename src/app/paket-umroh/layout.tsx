import { generateMetadata } from './metadata'

// Export metadata
export { generateMetadata as metadata }

export default function PaketUmrohLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
