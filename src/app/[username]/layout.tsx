import { generateMetadata } from './metadata'

// Export metadata function
export { generateMetadata }

export default function TravelProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
