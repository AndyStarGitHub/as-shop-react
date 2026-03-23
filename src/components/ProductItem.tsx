import { Button, Card, CardActions, CardContent, CardMedia, Typography } from "@mui/material";
import type { Product } from "../types";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useNavigate } from "react-router-dom";


interface ProductProps{
  product: Product
  onBuy: (p: Product) => void
}

export const ProductItem = ({ product, onBuy }: ProductProps) => {
  const navigate = useNavigate()
  return (
    <Card 
      sx={{ cursor: 'pointer' }} 
      onClick={() => navigate(`/product/${product.id}`)}
    >
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
        >
          Купити
        </Button>
      </CardActions>
    </Card>
  )
}
