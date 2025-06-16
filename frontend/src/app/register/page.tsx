"use client"

import type React from "react"
import { useState } from "react"
import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material"
import { useRouter } from "next/navigation"
import type { UserCreate } from "@/lib/types"
import { usersAPI } from "@/lib/api"
import Link from "next/link"
import { useSnackbar } from "notistack"

export default function RegisterPage() {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [user, setUser] = useState<Partial<UserCreate>>({
    name: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setUser((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      await usersAPI.createUser(user)
      enqueueSnackbar("Вы успешно зарегистировались!", { variant: "success" })
      router.push("/login")
      router.refresh()
    }
    catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" })
    }
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper
          elevation={3}
          sx={{
            padding: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h4">
            Регистрация
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Логин"
              name="name"
              autoFocus
              value={user.name}
              onChange={handleChange}
              slotProps={{
                htmlInput: {
                  minLength: 3,
                  maxLength: 64,
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
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
            <Button type="submit" variant="contained" sx={{ my: 2 }} fullWidth>
              Зарегистрироваться
            </Button>
          </Box>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Уже зарегистировались?{" "}
            <Link href="/login" style={{ textDecoration: "none" }}>
              <Typography component="span" variant="body2" color="primary" sx={{ cursor: "pointer" }}>
                Войти
              </Typography>
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}
