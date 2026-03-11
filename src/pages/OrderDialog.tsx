import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Stack, Typography 
} from '@mui/material';
import { isOrderFormValid, isPhoneValid } from '../utils/validation';

interface OrderDialogProps {
  open: boolean;
  onClose: () => void;
  customerInfo: { name: string; phone: string; address: string };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  totalPrice: number;
  onSubmit: () => void;
}

export const OrderDialog = ({ 
  open, onClose, customerInfo, onInputChange, totalPrice, onSubmit 
}: OrderDialogProps) => {

  const phoneError = customerInfo.phone.length > 0 && !isPhoneValid(customerInfo.phone)
  const nameError = customerInfo.name.length === 0

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>📦 Оформлення замовлення</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Сума до сплати: <b>{totalPrice} грн</b>
        </Typography>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField 
            label="Ім'я" 
            name="name" 
            value={customerInfo.name} 
            onChange={onInputChange} 
            fullWidth 
            required 
            error={nameError}
          />
          <TextField 
            label="Телефон" 
            name="phone" 
            value={customerInfo.phone} 
            onChange={onInputChange} 
            fullWidth 
            required 
            error={phoneError}
            helperText={phoneError ? 'Формат: +380 або 0ХХХХХХХХХХ' : ''}
          />
          <TextField 
            label="Адреса" 
            name="address" 
            value={customerInfo.address} 
            onChange={onInputChange} 
            fullWidth multiline 
            rows={2} 
            required 
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Скасувати</Button>
        <Button 
          variant="contained" 
          color="success" 
          disabled={!isOrderFormValid(customerInfo)} 
          onClick={onSubmit}
        >
          Підтвердити
        </Button>
      </DialogActions>
    </Dialog>
  );
};