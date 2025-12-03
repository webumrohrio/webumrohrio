import { generateMetadata } from './metadata'

// Export metadata
export { generateMetadata }

export default function PackageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
