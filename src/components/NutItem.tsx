import { Button, Card, CardActions, CardContent, CardMedia, Typography } from "@mui/material";
import type { Nut } from "../types";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';


interface NutProps{
  nut: Nut
  onBuy: () => void
}

export const NutItem = ({ nut, onBuy }: NutProps) => {
  return (
    <Card 
      sx={{ 
        maxWidth: 345, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        bgcolor: '#fff3e0', // Світло-помаранчевий для горіхів
        border: '1px solid #ffe0b2'
      }}
      >
      <CardMedia 
        sx={{ height: 140 }}
        image="https://source.unsplash.com/random/300x200?nut"
        title={nut.title}
      />

      <CardContent>
        <Typography gutterBottom variant="h5" component='div'>
          {nut.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Найкращий вибір для вашого здоров'я - тільки горішки на закуску
        </Typography>
        <Typography variant="h6" sx={{ mt: 2, color: 'primary.main' }}>
          {nut.price} грн
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



