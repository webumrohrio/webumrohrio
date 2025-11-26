export function getDateRangeFromPeriod(period: string | null): Date | undefined {
  if (!period) return undefined

  const now = new Date()
  const startDate = new Date()

  switch (period) {
    case 'day':
      startDate.setHours(0, 0, 0, 0)
      break
    case 'week':
      startDate.setDate(now.getDate() - 7)
      startDate.setHours(0, 0, 0, 0)
      break
    case 'month':
      startDate.setMonth(now.getMonth() - 1)
      startDate.setHours(0, 0, 0, 0)
      break
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1)
      startDate.setHours(0, 0, 0, 0)
      break
    default:
      return undefined
  }

  return startDate
}
