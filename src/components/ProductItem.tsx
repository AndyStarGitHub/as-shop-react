import { Box, Button, Card, CardActions, CardContent, CardMedia, Typography } from "@mui/material";
import type { Product } from "../types";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useNavigate } from "react-router-dom";


interface ProductProps{
  product: Product
  onBuy: (p: Product) => void
}

export const ProductItem = ({ product, onBuy }: ProductProps) => {
  const navigate = useNavigate()
  const isOutOfStock = product.stock !== undefined && product.stock <= 0
  return (
    <Card 
      sx={{ 
        cursor: isOutOfStock ? 'default' : 'pointer', 
        opacity: isOutOfStock ? 0.6 : 1,
        filter: isOutOfStock ? 'grayscale(0.5)' : 'none ',
        position: 'relative'
      }} 
      onClick={() => !isOutOfStock && navigate(`/product/${product.id}`)}
    >
      {
        isOutOfStock && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 2,
              bgColor: 'error.main',
              color: 'white',
              px: 1,
              borderRadius: 1,
              fontSize: '0.7rem'
            }}
          >
            НЕМАЄ В НАЯВНОСТІ
          </Box>
        )
      }
      <CardMedia 
        component='img'
        height='200'
        image={product.image || `https://loremflickr.com/400/300/${product.title.toLowerCase()}`}
        alt={product.title}
        sx={{ objectFit: 'cover'}}
      />

      <CardContent>
        <Typography gutterBottom variant="h5" component='div'>
          {product.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Найкращий вибір для вашого здоров'я
        </Typography>
        <Typography variant="h6" sx={{ mt: 2, color: 'primary.main' }}>
          {product.price} грн
        </Typography>
      </CardContent>

      <CardActions>
        <Button
          size="small"
          variant="contained"
          fullWidth
          startIcon={<AddShoppingCartIcon />}
          onClick={(e) => {
            e.stopPropagation()
            onBuy(product)
          }}
          color={isOutOfStock ? 'inherit' : 'primary'}
        >
          {isOutOfStock ? 'Очікується' : 'Купити'}
        </Button>
      </CardActions>
    </Card>
  )
}
