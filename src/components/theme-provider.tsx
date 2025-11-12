"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // On the server or during hydration, render the children directly
    // This avoids trying to access localStorage
    return <>{children}</>
  }

  // Once mounted on the client, render the full provider
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
