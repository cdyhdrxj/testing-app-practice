"use client"

import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { SnackbarProvider } from "notistack"
import { getCookie } from "cookies-next/client"
import BaseLayout from "@/components/layout/BaseLayout"
import UserLayout from "@/components/layout/UserLayout"
import AdminLayout from "@/components/layout/AdminLayout"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#f50057",
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
  },
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const is_admin = getCookie("client_is_admin")

  return (
    <html lang="ru">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider maxSnack={3}>
            {!is_admin && <BaseLayout>{children}</BaseLayout>}
            {is_admin === "False" && <UserLayout>{children}</UserLayout>}
            {is_admin === "True" && <AdminLayout>{children}</AdminLayout>}
          </SnackbarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
