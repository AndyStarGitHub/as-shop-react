import { collection, deleteDoc, onSnapshot, orderBy, query, updateDoc, doc, or } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "../firebase"
import { Box, Button, Chip, Container, Grid, InputAdornment, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material"
import SearchIcon from '@mui/icons-material/Search'
import { Dashboard } from "../components/Dashboard"

export const OrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'completed'>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    const customerName = order.customer?.name?.toLowerCase() || ''
    const customerPhone = order.customer?.phone || ''
    const matchesSearch = customerName.includes(searchTerm.toLocaleLowerCase()) || customerPhone.includes(searchTerm)
    return matchesSearch && matchesStatus
  })

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setOrders(ordersData)
    })
    return () => unsubscribe()
  }, [])

  const markAsDone = async (orderId: string) => {
    const orderRef = doc(db, 'orders', orderId)
    await updateDoc(orderRef, { status: 'completed' })
  }
  
  const deleteOrder = async (orderId: string) => {
    if (window.confirm('Видалити замовлення з бази?')) {
        await deleteDoc(doc(db, 'orders', orderId))
    }
  }

  const today = new Date().toLocaleDateString('uk-UA')
  const stats = orders.reduce((acc, order) => {
    const orderDate = order.createdAt?.toDate().toLocaleDateString('uk-UA')

    if (orderDate === today) {
      acc.countToday += 1
      if (order.status === 'new') {
        acc.pendingSum += (order.total || 0)
      } else if (order.status === 'completed') {
        acc.completedSum += (order.total || 0)
      }
    }
    return acc
  }, { countToday: 0, pendingSum: 0, completedSum: 0 })

  return (
    <Container sx={{ mt: 4 }}>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Замовлень за сьогодні</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.countToday}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid', borderColor: 'warning.main'}}>
            <Typography variant="subtitle2" color="text.secondary">Очікує оплати (нові)</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main'}}>
              {stats.pendingSum} <small style={{fontSize: '1rem'}}> грн</small>
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid', borderColor: 'success.main' }}>
            <Typography variant="subtitle2" color="text.secondary">Виконано (каса)</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main'}}>
              {stats.completedSum} <small style={{ fontSize: '1rem' }}></small>
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Dashboard orders={orders} />
      <Typography variant="h4" gutterBottom>📦 Керування замовленнями</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row'}} spacing={2} alignItems='center'>
          <Tabs
            value={filterStatus}
            onChange = {(_, newValue) => setFilterStatus(newValue)}
            sx={{ flexGrow: 1 }}
          >
            <Tab label='Всі' value='all'/>
            <Tab label='Нові' value='new'/>
            <Tab label='Виконані' value='completed'/>
          </Tabs>
          <TextField 
            placeholder="Пошук клієнта..."
            variant="outlined"
            size='small'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: { xs: '100%', sm: '300px' }}}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Stack>
      </Paper>

      <Stack spacing={2}>
        {filteredOrders.map((order) => (
          <Paper key={order.id} sx={{ p: 3, borderLeft: order.status === 'new' ? '5px solid #ed6c02' : '5px solid #2e7d32' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6">Замовлення № {order.id.slice(0, 5)}</Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      bgcolor: 'action.selected',
                      color: 'text.primary', 
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      fontWeight: 'medium',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    ⏰ {order.createdAt ? (
                      <>
                        <Box component="span" sx={{ opacity: 0.7, mr: 0.5 }}>
                          {order.createdAt.toDate().toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })}
                        </Box>

                        <Box component="span" sx={{ mx: 0.5, color: 'text.disabled' }}>|</Box>

                        <Box component="span" sx={{ fontWeight: 'bold' }}>
                          {order.createdAt.toDate().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                        </Box>
                      </>
                    ) : 'Час не вказано'} 
                  </Typography>
                </Box>

                <Typography color='text.secondary'>
                  👤Клієнт: {order.customer?.name} ({order.customer?.phone})
                </Typography>

                <Typography variant="body2" sx={{ color: 'text-secondary', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  📍 <strong>Адреса:</strong> {order.customer?.address || 'Не вказана'}
                </Typography>

                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Товари: </strong> {order.items?.map((item: any) => `${item.title} x${item.quantity}`).join(', ')}
                </Typography>
                <Typography variant="h6" sx={{ mt: 1, color: 'primary.main' }}>Сума: {order.total} грн</Typography>
              </Box>
              <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column',  alignItems: 'flex-end', gap: 1 }}>
                <Chip 
                  label={order.status === 'new' ? '🔥 НОВЕ' : '✅ ВИКОНАНО'}
                  color={order.status === 'new' ? 'warning' : 'success'}
                  variant={order.status === 'new' ? 'filled' : 'outlined'}
                  sx={{ 
                    fontWeight: 'bold',
                    boxShadow: order.status === 'new' ? '0 0 10px rgba(237, 108, 2, 0.3)' : 'none',
                    animation: order.status === 'new' ? 'pulse 2s infinite' : 'none',
                    "@keyframes pulse": {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.7 },
                      '100%': { opacity: 1 }
                    }
                  }}
                />
                <Stack direction='row' spacing={1}>
                  {order.status === 'new' && (
                    <Button variant='contained' color='success' size='small' onClick={() => markAsDone(order.id)}>
                      Виконати
                    </Button>
                  )}
                  <Button variant="outlined" color='error' size="small" onClick={() => deleteOrder(order.id)}>
                    Видалити
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Paper>
        ))}
      </Stack>
    </Container>
  )
}