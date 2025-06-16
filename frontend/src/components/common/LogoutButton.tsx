"use client"

import { Button } from "@mui/material"
import { useRouter } from "next/navigation"
import { loginAPI } from "@/lib/api"
import { enqueueSnackbar } from "notistack"

export function LogoutButton() {
  const router = useRouter()
  
  const handleLogout = async () => {
    try {
      await loginAPI.logout()
      enqueueSnackbar("Вы успешно вышли из аккаунта", { variant: "success" })
      router.push("/")
      router.refresh()
    }
    catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" })
    }
  }

  return (
    <Button variant="outlined" onClick={handleLogout} sx={{ color: "white" }}>
      Выйти
    </Button>
  )
}
