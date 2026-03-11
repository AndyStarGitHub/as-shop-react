import { Card, CardContent, Typography } from "@mui/material"
import { Box, Grid } from "@mui/material"
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import StarIcon from '@mui/icons-material/Star';

interface DashboardProps {
  orders: any[]
}

export const Dashboard = ({orders}: DashboardProps) => {
  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, order) => sum + (Number(order.total) || 0), 0)

  const today = new Date().toLocaleDateString()
  const todayOrders = orders.filter(o => {
    const orderDate = o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString() : ''
    return orderDate === today
  }).length

  const productStats: { [key: string]: number } = {}
  orders.forEach(order => {
    order.items?.forEach((item: any) => {
      productStats[item.title] = (productStats[item.title] || 0) + item.quantity 
    });
  })
  
  const topProduct = Object.entries(productStats).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Ще немає даних'

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant='h5' gutterBottom sx={{ fontWeight: 'bold', md: 3 }}>
        📈 Аналітика магазину
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon />
                <Typography variant="h6">Дохід</Typography>
              </Box>
              <Typography variant="h4">{totalRevenue} грн</Typography>
              <Typography variant="body2">Всього з виконаних</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: 'success.main', color: 'white'}}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingBagIcon />
                <Typography variant="h6">Нових замовлень</Typography>
              </Box>
              <Typography variant="h4">{todayOrders}</Typography>
              <Typography variant="body2">Нових замовлень</Typography> 
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white'}}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarIcon />
                <Typography variant="h6">Хіт продажів</Typography>
              </Box>
              <Typography variant='h4' sx={{ fontSize: '1.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                {topProduct}
              </Typography>
              <Typography variant="body2">Найпопулярніший</Typography>
            </CardContent>
          </Card>
        </Grid>






      </Grid>
    </Box>

  )
}