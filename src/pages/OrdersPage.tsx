import { collection, deleteDoc, onSnapshot, orderBy, query, doc, runTransaction } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "../firebase"
import { Box, Button, Chip, Container, Grid, InputAdornment, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material"
import SearchIcon from '@mui/icons-material/Search'
import { Dashboard } from "../components/Dashboard"
// import { Product } from '../types'

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

  const handlePrint = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // 1. Створюємо нове вікно
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    // 2. Формуємо вміст чека (чистий HTML)
    const content = `
        <html>
          <head>
            <title>Чек №${order.id.slice(0, 5)}</title>
            <style>
              body { 
                font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
                padding: 40px; 
                color: #222;
                max-width: 400px; /* Робимо вузьким, як касовий чек */
                margin: 0 auto;
              }
              .header { 
                text-align: center; 
                border-bottom: 1px dashed #ccc; 
                padding-bottom: 20px; 
                margin-bottom: 20px; 
              }
              .brand { font-size: 24px; font-weight: bold; letter-spacing: 1px; }
              .order-num { font-size: 14px; color: #666; margin-top: 5px; }
              
              .section { margin-bottom: 15px; font-size: 14px; }
              .section-title { font-weight: bold; text-transform: uppercase; font-size: 12px; color: #888; margin-bottom: 5px; }
              
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              td { padding: 8px 0; border-bottom: 1px solid #f5f5f5; font-size: 14px; }
              .qty { color: #666; font-size: 13px; }
              .price { text-align: right; font-weight: 500; }

              .total-row { 
                margin-top: 20px; 
                padding-top: 10px;
                border-top: 2px solid #222; 
                display: flex; 
                justify-content: space-between; 
                font-size: 20px; 
                font-weight: bold; 
              }
              .footer { 
                text-align: center; 
                margin-top: 50px; 
                font-size: 12px; 
                color: #aaa;
                border-top: 1px dashed #ccc;
                padding-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="brand">MY STORE ☕️</div>
              <div class="order-num">Замовлення №${order.id.slice(0, 5)}</div>
              <div style="font-size: 12px; color: #999;">${new Date().toLocaleString('uk-UA')}</div>
            </div>
            
            <div class="section">
              <div class="section-title">Клієнт</div>
              <div><strong>${order.customer?.name}</strong></div>
              <div>${order.customer?.phone}</div>
              <div style="margin-top: 5px; font-style: italic;">📍 ${order.customer?.address || 'Самовивіз'}</div>
            </div>

            <div class="section">
              <div class="section-title">Товари</div>
              <table>
                ${order.items?.map((item: any) => `
                  <tr>
                    <td>${item.title} <span class="qty">x${item.quantity}</span></td>
                    <td class="price">${item.price * item.quantity} грн</td>
                  </tr>
                `).join('')}
              </table>
            </div>

            <div class="total-row">
              <span>РАЗОМ:</span>
              <span>${order.total} грн</span>
            </div>

            <div class="footer">
              Дякуємо, що ви з нами!<br>
              Приходьте ще! 😊
            </div>

            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() { window.close(); };
              };
            </script>
          </body>
        </html>
      `;

    // 3. Записуємо контент у вікно і закриваємо потік запису
    printWindow.document.write(content);
    printWindow.document.close();
  };

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


const markAsDone = async (orderId: string) => { // Передаємо ID
  const order = orders.find(o => o.id === orderId); // Знаходимо замовлення в масиві
  if (!order) return;

  try {
    await runTransaction(db, async (transaction) => {
      // 1. УСІ ЧИТАННЯ (READS)
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await transaction.get(orderRef);

      if (!orderSnap.exists()) throw "Замовлення не знайдено!";
      if (orderSnap.data().status === 'completed') throw "Вже виконано!";

      const items = order.items || [];
      const productSnapshots = [];

      // Читаємо кожен товар із замовлення
      for (const item of items) {
        const pRef = doc(db, 'products', item.id);
        const pSnap = await transaction.get(pRef);
        if (pSnap.exists()) {
          productSnapshots.push({ ref: pRef, snap: pSnap, item });
        }
      }

      // 2. УСІ ЗАПИСИ (WRITES)
      productSnapshots.forEach(({ ref, snap, item }) => {
        const currentStock = snap.data().stock || 0;
        const newStock = currentStock - item.quantity;

        if (newStock < 0) {
          throw `Недостатньо ${item.title}! (Є: ${currentStock})`;
        }

        // Оновлюємо склад
        transaction.update(ref, { stock: newStock });

        // Записуємо в Журнал операцій (inventory_logs)
        const logRef = doc(collection(db, 'inventory_logs'));
        transaction.set(logRef, {
          productId: item.id,
          productTitle: item.title,
          amount: -item.quantity,
          type: 'outcome',
          note: `Продаж (Замовлення №${order.id.slice(0, 5)})`,
          createdAt: new Date()
        });
      });

      transaction.update(orderRef, { status: 'completed' });
    });

    console.log("Склад оновлено, замовлення закрито! 🚀");
  } catch (error) {
    console.error('Помилочка при виконанні завданнячка', error);
    alert(`Помилочка: ${error}`);
  }
};
  
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
          <Paper 
            key={order.id} 
            id={`order-${order.id}`}
            sx={{ p: 3, borderLeft: order.status === 'new' ? '5px solid #ed6c02' : '5px solid #2e7d32' }}
          >
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
                  <Button
                    variant="outlined"
                    color='inherit'
                    size='small'
                    onClick={() => handlePrint(order.id)}
                    startIcon={<Box component='span' sx={{ fontSize: '1.2rem'}}>🖨️</Box>}
                  >
                    Чек
                  </Button>
                  {order.status === 'new' && (
                    <Button variant='contained' color='success' size='small' onClick={() => markAsDone(order.id)}>
                      Виконати
                    </Button>
                  )}
                  {order.status === 'new' && (
                    <Button variant="outlined" color='error' size="small" onClick={() => deleteOrder(order.id)}>
                      Видалити
                    </Button>
                  )}
                </Stack>
              </Box>
            </Box>
          </Paper>
        ))}
      </Stack>
    </Container>
  )
}