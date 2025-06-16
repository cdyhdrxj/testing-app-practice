"use client"

import type React from "react"
import { useState } from "react"
import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material"
import { useRouter } from "next/navigation"
import { loginAPI } from "@/lib/api"
import Link from "next/link"
import { useSnackbar } from "notistack"

export default function LoginPage() {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      const loginData = new FormData()
      loginData.append("username", username)
      loginData.append("password", password)

      const response = await loginAPI.login(loginData)
      enqueueSnackbar(`Добро пожаловать, ${response.name}!`, { variant: "success" })

      router.push("/")
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
            Вход
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Логин"
              name="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              slotProps={{
                htmlInput: {
                  minLength: 8,
                  maxLength: 64,
                }
              }}
            />
            <Button type="submit" variant="contained" sx={{ my: 2 }} fullWidth>
              Войти
            </Button>
          </Box>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Нет аккаунта?{" "}
            <Link href="/register" style={{ textDecoration: "none" }}>
              <Typography component="span" variant="body2" color="primary" sx={{ cursor: "pointer" }}>
                Зарегистрироваться
              </Typography>
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}
