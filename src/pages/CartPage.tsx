import { Box, Button, Paper, List, ListItemText, ListItem, Typography, IconButton } from "@mui/material"
import DeleteIcon from '@mui/icons-material/Delete'; 

export const CartPage = ({ cartItems, totalPrice, onOpenOrder, onChangeQuantity, onRemove }: any ) => {
  if (cartItems.length === 0) return <Typography sx={{ p: 3 }}> Кошик порожній </Typography>

  

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant='h5' gutterBottom>Ваш вибір</Typography>

        <List>
          {cartItems.map((item: any) => (
            <ListItem 
              key={item.id} divider
                secondaryAction={
                <IconButton edge='end' aria-label='delete' onClick={() => onRemove(item.id)} color='error'>
                    <DeleteIcon/>
                </IconButton>     
                }       
            >
              <ListItemText primary={item.title} secondary={`${item.price * item.quantity} грн`}></ListItemText>
              <div style={{ display: 'flex', alignItems: 'center', marginRight: '40px' }}>
                <Button size='small' onClick={() => onChangeQuantity(item.id, -1)}>-</Button>
                <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                <Button size='small' onClick={() => onChangeQuantity(item.id, 1)}>+</Button>
              </div>
            </ListItem>
          ))}
        </List>
        <Typography variant="h6">Разом: {totalPrice} грн</Typography>
        <Button variant='contained' color='success' fullWidth onClick={onOpenOrder} sx={{ mt: 2 }}>
          Оформити замовлення
        </Button>
      </Paper>
    </Box>
  )
}