'use client'

import { useEffect, useRef } from 'react'

const HEARTBEAT_INTERVAL = 5 * 60 * 1000 // 5 minutes in milliseconds

export function useUserHeartbeat() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        // Check if user is logged in
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
        const user = localStorage.getItem('currentUser')

        if (!isLoggedIn || !user) {
          return
        }

        const userData = JSON.parse(user)

        // Send heartbeat to update lastActive
        await fetch('/api/user/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userData.email })
        })
      } catch (error) {
        console.error('Failed to send heartbeat:', error)
      }
    }

    // Send initial heartbeat immediately
    sendHeartbeat()

    // Set up interval to send heartbeat every 5 minutes
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])
}
