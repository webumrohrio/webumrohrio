import { generateMetadata } from './metadata'

// Export metadata
export { generateMetadata as metadata }

export default function TravelUmrohLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
