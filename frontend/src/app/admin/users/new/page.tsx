"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSnackbar } from "notistack"
import Paper from "@mui/material/Paper"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Grid from "@mui/material/Grid"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { usersAPI } from "@/lib/api"
import type { AdminCreate } from "@/lib/types"
import PageHeader from "@/components/common/PageHeader"

export default function UserAdminForm() {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [user, setUser] = useState<Partial<AdminCreate>>({
    name: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setUser((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await usersAPI.createAdmin(user)
      enqueueSnackbar("Пользователь успешно создан", { variant: "success" })
      router.push("/admin/users")
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" })
    }
  }

  const handleBack = () => {
    router.push("/admin/users")
  }

  return (
    <>
      <Box sx={{ mb: 1, display: "flex", alignItems: "flex-start" }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <PageHeader title="Новый администратор"/>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3} sx={{ display: "flex", flexDirection: "column" }}>
            <Grid size={{ xs: 6 }}>
              <TextField
                required
                fullWidth
                label="Логин"
                name="name"
                value={user.name}
                onChange={handleChange}
                slotProps={{
                  htmlInput: {
                    minLength: 3,
                    maxLength: 64,
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                required
                fullWidth
                label="Пароль"
                name="password"
                value={user.password}
                onChange={handleChange}
                slotProps={{
                  htmlInput: {
                    minLength: 8,
                    maxLength: 64,
                    pattern: "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$",
                    title: "Нет пробелов, минимум 1 буква и 1 цифра"
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button type="submit" variant="contained" color="primary">
                  Создать
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </>
  )
}
