import { 
    Box, 
    Checkbox,
    Container, 
    FormControlLabel, 
    Grid, 
    Paper, 
    Stack, 
    TextField, 
    Typography 
} from "@mui/material"
import { useState } from "react"
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts"

interface AnalyticsProps {
  orders: any[]
}

export const AnalyticsPage = ({ orders }: AnalyticsProps) => {
  const today = new Date().toISOString().split('T')[0]
  const lastMonth = new Date()
  lastMonth.setDate(lastMonth.getDate() - 30)
  const monthAgo = lastMonth.toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(monthAgo)
  const [endDate, setEndDate] = useState(today)
  const [onlyCompleted, setOnlyCompleted] = useState(false)

  const filteredOrders = orders.filter(order => {
    if (!order.createdAt) return false

    const orderDate = order.createdAt.toDate().toISOString().split('T')[0]
    const isWithinDates = orderDate >= startDate && orderDate <= endDate
    const matchesStatus = onlyCompleted ? order.status === 'completed' : true

    return isWithinDates && matchesStatus
})

const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0)
const ordersCount = filteredOrders.length
const avgCheck = ordersCount > 0 ? (totalRevenue / ordersCount).toFixed(2) : 0

const productStats = filteredOrders.reduce((acc: any, order) => {
  order.items.forEach((item: any) => {
    if (acc[item.title]) {
      acc[item.title] += item.quantity
    } else {
        acc[item.title] = item.quantity
    }
  })
  return acc
}, {})

const topProducts = Object.entries(productStats)
  .map(([name, count]) => ({ name, count: count as number}))
  .sort((a, b) => b.count - a.count)
  .slice(0, 5)

const chartDataRaw = filteredOrders.reduce((acc: any, order) => {
  if (!order.createdAt) return acc

  const date = order.createdAt.toDate().toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit'
  })

  if (acc[date]) {
    acc[date] += order.total || 0
  } else {
    acc[date] = order.total || 0
  }
  return acc
}, {})

const chartData = Object.entries(chartDataRaw)
  .map(([date, revenue]) => ({ date, revenue }))
  .sort((a, b) => a.date.localeCompare(b.date))

const categoryDataRaw = filteredOrders.reduce((acc: any, order) => {
  order.items.forEach((item: any) => {
    const catName = item.category || 'Без категорії'
    const price = (item.price * item.quantity) || 0

    if (acc[catName]) {
        acc[catName] += price
    } else {
        acc[catName] = price
    }
  })
  return acc
}, {})

const categoryData = Object.entries(categoryDataRaw).map(([name, value]) => ({
    name, value 
}))

return (
  <Container sx={{ mt: 4, mb: 4 }}>
    <Typography variant="h4" gutterBottom>📊 Аналітика продажів</Typography>

    <Paper sx={{ p:3, mb: 4 }}>
      <Grid container spacing={3} alignItems='center'>
        <Grid size={{ xs: 12, md: 5 }}>
          <TextField 
            label='Від'
            type='date'
            fullWidth
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            slotProps={{ inputLabel: {shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <TextField 
            label='До'
            type='date'
            fullWidth
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            slotProps={{ inputLabel: {shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormControlLabel
            label="Показувати тільки виконані замовлення ✅"
            control={
                <Checkbox 
                  checked={onlyCompleted}
                  color='success'
                  onChange={(e) => setOnlyCompleted(e.target.checked)}
                />
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <Typography variant="body2" color='text.secondary'>
            Замовлень: <b>{ordersCount}</b>
          </Typography>
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6">Виторг</Typography>
              <Typography variant="h4">{totalRevenue}</Typography> 
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'success.main', color: 'white' }}>
              <Typography variant="h6">Замовлень</Typography>
              <Typography variant="h4">{ordersCount}</Typography> 
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.main', color: 'white' }}>
              <Typography variant="h6">Середня сума чеку</Typography>
              <Typography variant="h4">{avgCheck} грн</Typography> 
            </Paper>
          </Grid>

          <Typography variant="h5" sx={{ mt: 6, mb: 2, fontWeight: 'bold'}}>
            📈 Динаміка виторгу
          </Typography>
          <Paper sx={{ p: 3, mb: 4, minHeight: 450 }}>
            <Box sx={{ width: '100%', maxWidth: 800 }}>
              <LineChart 
                data={chartData}
                width={800}
                height={400}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray='3 3' vertical={false}/>

                <XAxis dataKey='date'/>
                <YAxis />
                <Tooltip />
                  <Line 
                    type='monotone'
                    dataKey='revenue'
                    stroke='#1976d2'
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    activeDot={{ r: 8 }}
                    name='Виторг (грн)'
                  />
                </LineChart>
            </Box>
          </Paper>
        

          <Stack spacing={4}>
            <Typography variant="h5" sx={{ mt: 6, mb: 2, fontWeight: 'bold'}}>
                🍕 Розподіл за категоріями (грн)
            </Typography>
            <Paper sx={{ p: 3, mb: 4, display: 'flex', justifyContent: 'center'}}>
                <PieChart width={500} height={300}>
                <Pie
                    data={categoryData}
                    cx='50%'
                    cy='50%'
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                    label={(entry) => `${entry.name}: ${entry.value} грн`}
                >
                    {categoryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                    ))}
                </Pie>
                <Tooltip />
                </PieChart>
            </Paper>

            <Typography variant="h5" sx={{ mt: 6, mb: 2 }}>🏆 Топ-5 товарів періоду</Typography>
            <Paper sx={{ p: 3 }}>
                <Stack spacing={2}>
                {topProducts.length > 0 ? (
                    topProducts.map((product, index) => (
                        <Box key={product.name} sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1,
                        borderBottom: index !== topProducts.length - 1 ? '1px solid #eee' : 'none'
                        }}>
                        <Typography><b>{index + 1}.</b>{product.name}</Typography>
                        <Typography color="primary" sx={{ fontWeight: 'bold'}}>
                            {product.count} шт.
                        </Typography>
                        </ Box>
                    ))
                ) : (
                    <Typography color="text.secondary">За цей період замовлень не було</Typography>
                )}
                </Stack>    
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Paper>    
  </Container>
  )

}
