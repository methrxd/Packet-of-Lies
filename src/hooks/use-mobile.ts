import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const getSnapshot = React.useCallback(() => {
    if (typeof window === "undefined") {
      return false
    }

    return window.innerWidth < MOBILE_BREAKPOINT
  }, [])

  const subscribe = React.useCallback((onStoreChange: () => void) => {
    if (typeof window === "undefined") {
      return () => undefined
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const handleChange = () => onStoreChange()

    mql.addEventListener("change", handleChange)
    return () => mql.removeEventListener("change", handleChange)
  }, [])

  return React.useSyncExternalStore(subscribe, getSnapshot, () => false)
}
