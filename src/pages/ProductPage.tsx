import { Box, Button, Container, Grid, Paper, Typography } from "@mui/material"
import { useNavigate, useParams } from "react-router-dom"
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import type { Product } from "../types"

export const ProductPage = ({ products, onBuy }: any) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
//   debugger
  const product = products.find((p: Product) => p.id === id)
//   debugger
  if (!product) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5">Товар не знайдено</Typography>
        <Button onClick={() => navigate('/') }>Повернутись до магазину</Button>
      </Container>
    )
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Назад
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box 
              component='img'
              src={product.image || 'https://dummyimage.com/600x400/cccccc/ffffff.png&text=Фото+відсутнє'}
              alt={product.title}
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: 400,
                objectFit: 'contain',
                borderRadius: 2,
                boxShadow: 2
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="overline" color="primary">{product.category}</Typography>
            <Typography variant="h3" gutterBottom>{product.title}</Typography>
            <Typography variant="h4" color="success.main">{product.price}</Typography>

            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
              Це чудовий вибір! Наш {product.title} вирізняється найкращою якістю та свіжістю
              {product.description || 'Опис скоро буде, чекай...'}
            </Typography>

            <Button
              variant="contained"
              fullWidth
              onClick={onBuy}
              disabled={product.stock !== undefined && product.stock <= 0}
              sx={{ mt: 2 }}
            >
              {product.stock !== undefined && product.stock <= 0
                ? 'Немає продуктика в наявності'
                : 'Додати до кошика'
              }
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )  
}