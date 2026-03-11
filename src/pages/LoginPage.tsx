import { signInWithEmailAndPassword } from "firebase/auth"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { auth } from "../firebase"
import { Button, Container, Paper, TextField, Typography } from "@mui/material"

export const LoginPage = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/admin')
    } catch(error) {
      alert('Помилка входу: невірний емейл або пароль')
    }
    }

    return (
      <Container maxWidth='xs' sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center'}}>
          <Typography variant="h5" gutterBottom>Вхід для адміна</Typography>
          <form onSubmit={handleLogin}>
            <TextField 
              fullWidth
              label='Email'
              margin='normal'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField 
              fullWidth
              label='Пароль'
              type='password'
              margin='normal'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type='submit' variant='contained' fullWidth sx={{ mt: 2 }}>
              Увійти
            </Button>
          </form>
        </Paper>
      </Container>
    )
  }
