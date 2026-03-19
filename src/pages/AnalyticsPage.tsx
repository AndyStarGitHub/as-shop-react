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
import { useProducts } from "../context/ProductContext"
import { useCategories } from "../context/CategoriesContext"

interface AnalyticsProps {
  orders: any[]
}

export const AnalyticsPage = ({ orders }: AnalyticsProps) => {
  const { products } = useProducts()
  const { categories } = useCategories()

  const [productSearchQuery, setProductSearchQuery] = useState('')

  const totalStockPositions = products.length
  const totalStockValue = products.reduce((sum,p) => sum + (Number(p.price) || 0), 0 )

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

const stockCategoryDataRaw = products.reduce((acc: any, p: any) => {
  const category = categories.find((cat: any) => cat.id === p.category)
  const canName = category ? category.name : 'Без категорії'
  const price = Number(p.price) || 0

  if (acc[canName]) {
    acc[canName] += price
  } else {
    acc[canName] = price
  }
  return acc
}, {})

const stockCategoryData = Object.entries(stockCategoryDataRaw).map(([name, value]) => ({
  name,
  value
}))

const uncategorizedProducts = products.filter(p => {
  const categoryExists = categories.some(cat => cat.id === p.category)
  return !p.category || !categoryExists
})

const searchedProduct = products.find(p => 
  p.title.toLocaleLowerCase() === productSearchQuery.toLocaleLowerCase().trim()
)

const productOrderStats = filteredOrders.reduce((acc, order) => {
  const item = order.items.find((i: any) => i.title.toLowerCase() === productSearchQuery.toLowerCase().trim())
  if (item) {
    acc.count += item.quantity
    acc.revenue += (item.price * item.quantity)
  }
  return acc
}, {count: 0, revenue: 0})

return (
  <Container sx={{ mt: 4, mb: 4 }}>

    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold'}}>
      📊 Аналітика та Склад      
    </Typography>

    <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
      📦 Поточний склад
    </Typography>
    <Grid container spacing={3} sx={{ mb: 6 }}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 3, textAlign: 'center', borderLeft: '8px solid #673ab7' }}>
          <Typography variant="h6" color='text.secondary'>Усього товарів в базі</Typography>
          <Typography variant="h4" sx={{ fontWeight: "bold"}}>{totalStockPositions}</Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 3, textAlign: 'center', borderLeft: '8px solid #00bcd4' }}>
          <Typography variant="h6" color='text.secondary'>Загальна вартість активів</Typography>
          <Typography variant="h4" sx={{ fontWeight: "bold"}}>{totalStockValue.toLocaleString()} грн</Typography>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary'}}>
            🍕 Розподіл вартості складу за категоріями (грн)
          </Typography>
          {stockCategoryData.length > 0 ? (
            <PieChart width={400} height={250}>
              <Pie
                data={stockCategoryData}
                cx='50%'
                cy='50%'
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey='value'
                label={(entry) => `${entry.name}`}
              >
                {stockCategoryData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#0088fe', '#00c49f', '#ffbb28', '#FF8042', '#8884d8'][index % 5]}/>
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px' }} formatter={(value) => `${value?.toLocaleString()} грн`}/>
            </PieChart>
          ) : (
            <Typography color="text.secondary" sx={{ p: 5 }}>
              На складі поки що немає товарів
            </Typography>
          )}
        </Paper>
      </Grid>
    </Grid>

    {uncategorizedProducts.length > 0 && (
      <Paper sx={{ p: 2, mt: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          ⚠️ Знайдено товари без категорій ({uncategorizedProducts.length}):
        </Typography>
        <Box sx={{ mt: 1 }}>
          {uncategorizedProducts.map((p, idx) => (
            <Typography key={p.id} variant="body2">
              {idx + 1}. <b>{p.title}</b> - {p.price} грн
            </Typography>
          ))}
        </Box>
        <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.8 }}>
          *Перейдіть в адмінку, щоб призначити їм правильну категорію
        </Typography>
      </Paper>
    )}


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

            <Paper sx={{ p: 3, mb: 4, bgcolor: 'background.default', border: '1px solid #e0e0e0'}}>
              <Typography variant="h6" gutterBottom>🔍 Швидка перевірка товару</Typography>
              <TextField 
                fullWidth
                size="small"
                placeholder="Введіть точну назву товару (наприклад 'Яблуко Голден)"
                value={productSearchQuery}
                sx={{ mb: 2 }}
                onChange={(e) => setProductSearchQuery(e.target.value)}
              />
              {productSearchQuery.trim() && (
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  {searchedProduct ? (
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">На складі (ціна):</Typography>
                        <Typography variant="subtitle1"><b>{searchedProduct.price}</b></Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                         <Typography variant="body2" color="text.secondary">Продано за період:</Typography>     
                         <Typography variant="subtitle1" color="primary"><b>{productOrderStats.count} шт.</b> ({productOrderStats.revenue} грн)</Typography>                  
                      </Grid>
                    </Grid>
                  ) : (
                    <Typography variant='body2' color='error'>Товар з такою назвою не знадено в каталозі</Typography>
                  )}
                </Box>
              )}



            </Paper>       

            <Typography variant="h5" sx={{ mt: 6, mb: 2 }}>🏆 Топ-5 товарів періоду</Typography>
            <Paper sx={{ p: 3 }}>
                <Stack spacing={2}>
                {topProducts.length > 0 ? (
                    topProducts.map((product, index) => (
                        <Box 
                          key={product.name} 
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 1,
                            borderBottom: index !== topProducts.length - 1 ? '1px solid #eee' : 'none',
                            cursor: 'pointer',
                            '&:hover': {bgcolor: 'rgba(25, 118, 210, 0.05)'}
                          }}
                          onClick = {() => setProductSearchQuery(product.name)}  
                        >
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
