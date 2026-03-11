import { collection, deleteDoc, onSnapshot, orderBy, query, updateDoc, doc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "../firebase"
import { Box, Button, Chip, Container, InputAdornment, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material"
import SearchIcon from '@mui/icons-material/Search'
// import { Dashboard } from "@mui/icons-material"
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

  return (
    <Container sx={{ mt: 4 }}>
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
                <Typography variant="h6">Замовлення № {order.id.slice(0, 5)}</Typography>
                <Typography color='text.secondary'>Клієнт: {order.customer?.name} ({order.customer?.phone})</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Товари: </strong> {order.items?.map((item: any) => `${item.title} x${item.quantity}`).join(', ')}
                </Typography>
                <Typography variant="h6" sx={{ mt: 1, color: 'primary.main' }}>Сума: {order.total} грн</Typography>
              </Box>
              <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column',  alignItems: 'flex-end', gap: 1 }}>
                <Chip 
                  label={order.status === 'new' ? 'НОВЕ' : 'ВИКОНАНО'}
                  color={order.status === 'new' ? 'warning' : 'success'}
                  sx={{ md: 2 }}
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