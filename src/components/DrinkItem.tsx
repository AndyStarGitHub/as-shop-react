import { Button, Card, CardActions, CardContent, CardMedia, Typography } from "@mui/material";
import type { Drink } from "../types";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';


interface DrinkProps{
  drink: Drink
  onBuy: () => void
}

export const DrinkItem = ({ drink, onBuy }: DrinkProps) => {
  return (
    <Card 
      sx={{ 
        maxWidth: 345, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        bgcolor: '#e3f2fd',
        border: '1px solid #bbdefb'
      }}
    >
      <CardMedia 
        sx={{ height: 140 }}
        image="https://source.unsplash.com/random/300x200?drink"
        title={drink.title}
      />

      <CardContent>
        <Typography gutterBottom variant="h5" component='div'>
          {drink.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Найкращий вибір для вашого здоров'я - тільки дрінк
        </Typography>
        <Typography variant="h6" sx={{ mt: 2, color: 'primary.main' }}>
          {drink.price} грн
        </Typography>
      </CardContent>

      <CardActions>
        <Button
          size="small"
          variant="contained"
          fullWidth
          startIcon={<AddShoppingCartIcon />}
          onClick={onBuy}
        >
          Купити
        </Button>
      </CardActions>


    </Card>
  )
}



