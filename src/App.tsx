import { auth, db } from './firebase'
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useEffect, useReducer, useState } from 'react'
import type { Product, Category } from './types';
import { 
  IconButton, 
  Typography, 
  Box, 
  AppBar, 
  Toolbar, 
  Container, 
  Badge,
  Snackbar,
  Alert,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Tooltip from '@mui/material/Tooltip';
import Brightness4Icon from '@mui/icons-material/Brightness4'; 
import Brightness7Icon from '@mui/icons-material/Brightness7'; 
import LogoutIcon from '@mui/icons-material/Logout'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CartPage } from './pages/CartPage';
import { OrderDialog } from './pages/OrderDialog';
import { Footer } from './components/Footer';
import { ProductPage } from './pages/ProductPage';
import { AdminPage } from './pages/AdminPage';
import { OrdersPage } from './pages/OrdersPage';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { LoginPage } from './pages/LoginPage';
import { ProductSkeleton } from './components/ProductSkeleton';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { useCart } from './context/CartContext';

const productsData: Product[] = [];

type ProductAction = 
| { type: 'ADD_PRODUCT'; product: Product }
| { type: 'SET_PRODUCTS'; products: Product[] }
| { type: 'UPDATE_PRODUCT'; product: Product }
| { type: 'DELETE_PRODUCT'; id: string}

function ProductsReducer (state: Product[], action: ProductAction): Product[] {
  switch(action.type) {
    case 'ADD_PRODUCT':
      return [...state, action.product]

    case 'SET_PRODUCTS':
      return action.products

    case 'DELETE_PRODUCT':
      return state.filter(p => p.id !== action.id)

    case 'UPDATE_PRODUCT':
      return state.map(p => p.id === action.product.id ? action.product : p )
    
      default:
        return state
  }
}

function App() {
  const { cartItems, dispatch, totalPrice, totalQuantity } = useCart()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [user, setUser] = useState<User | null>(null)
  const [currentCategory, setCurrentCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const {isOrderModalOpen, setIsOrderModalOpen} = useCart()
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  })
  const [categoriesList, setCategoriesList] = useState<any[]>([])

  const handleLogout = async () => {
    if (window.confirm('Вийти з акаунта адміна?')) {
      await signOut(auth)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value}=e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value}));
  }

  const [products, productsDispatch] = useReducer(ProductsReducer, [])

  const [orders, setOrders] = useState<any[]>([])
  const [showExpensive, setShowExpensive] = useState<boolean>(false);
  const [openSnackBar, setOpenSnackBar] = useState<boolean>(false)
  const [lastAddedItem, setLastAddedItem] = useState<string>('')

  const updateProduct = async (updatedProduct: Product) => {
    try {
      const productRef = doc(db, 'products', updatedProduct.id);
      await updateDoc(productRef, { ...updatedProduct })
      setOpenSnackBar(true)
      setLastAddedItem(`Оновлено: "${updatedProduct.title}"✅`)
    } catch(error) {
      console.error('Помилка оновлення:', error)
    }
  };

  const deleteProduct = async (id: string) => {

    const isInCart = cartItems.some(item => item.id === id)

    if (isInCart) {
      alert('Неможливо видалити товар, він є в кошику у покупця. Спочатку попросіть користувача видалити його або дочекайтеся завершення замовлення.')
      return
    }
  
  if (window.confirm('Видалити з хмари?')) {
    await deleteDoc(doc(db, "products", id))
    }
  }

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('myTheme')
    return savedTheme === 'true'
  })
  
  const addProduct = async (newProduct: Product) => {
    await addDoc(collection(db, 'products'), newProduct)
  }

  useEffect(() => {
    const q = query(collection(db, 'categories'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({
        id: doc.id, 
        ...doc.data() 
      })) as Category[]
      setCategoriesList(cats)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    localStorage.setItem('myTheme', String(darkMode))
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('myProducts', JSON.stringify(products))
  }, [products])

  const addToCart = (good: Product) => {
    setLastAddedItem(`${good.title} додано до кошика`)
    setOpenSnackBar(true)
    dispatch({ type: 'ADD_ITEM', product: good })
  }

  const removeFromCart = (idToRemove: string) => {
    const isConfirmed = window.confirm('Ви впевнені?')
    if (isConfirmed) {
      dispatch({ type: 'REMOVE_ITEM', id: idToRemove })
    }
  }

  // Виносимо логіку фільтрації в окрему змінну для чистоти коду
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPrice = showExpensive ? p.price > 400 : true
    const matchesCategory = currentCategory === 'all' || p.category === currentCategory
    return matchesSearch && matchesPrice && matchesCategory
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'asc') return a.price - b.price
    if (sortBy === 'desc') return b.price - a.price
    return 0
  })

  const changeQuantity = (id: string, delta: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', id, delta})
  }

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#90caf9' : '#1976d2'
      }
    }
  })

  const allCategories = ['all', ...Array.from(new Set(products.map((p => p.category))))] as string[]

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsArray: any[] = [];
      querySnapshot.forEach((doc) => {
        productsArray.push({ ...doc.data(), id: doc.id})
      })
      productsDispatch({ type: 'SET_PRODUCTS', products: productsArray})
      setIsLoading(false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'orders'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setOrders(ordersData)
    })
    return () => unsubscribe()
  }, [])


  const sentTelegramMessage = async (orderData: any) => {
    const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
    const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID
    const message = `
    <b>🚀 НОВЕ ЗАМОВЛЕННЯ!</b>
    --------------------------
    👤 <b>Клієнт:</b> ${orderData.customer.name}
    📞 <b>Телефон:</b> ${orderData.customer.phone}
    🏠 <b>Адреса:</b> ${orderData.customer.address}
    --------------------------
    🛒 <b>Товари:</b>
    ${orderData.items.map((item: any) => `• ${item.title} x${item.quantity}`).join('\n')}
    --------------------------
    💰 <b>Разом:</b> ${orderData.total} грн
    `

    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      })
      console.log('Сповіщення в Телеграм надіслано. 📡')
    } catch(error) {
     console.error('Помилка відправки в Телеграм: ', error)
     }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <BrowserRouter>
        <Box sx={{ 
          display:' flex',
          flexDirection: 'column',
          minHeight: '100vh'
        }}>
          <AppBar position='static'>
            <Toolbar>
              <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
                <Link to='/' style={{ color: 'white', textDecoration: 'none'}}>Мій супер магазин</Link>
              </Typography>

              {user && (
                <Typography
                  variant='body2'
                  sx={{
                    ml: 2,
                    display: {xs: 'none', sm: 'block' },
                    color: 'rgba(255, 255, 255, 0.7',
                    fontStyle: 'italic'
                  }}
                >
                  {user.email}
                </Typography>
              )}

              <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit" sx={{ mr: 1 }}>
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>

              <IconButton component={Link} to='/cart' color='inherit'>
                <Badge badgeContent={totalQuantity} color='secondary'>
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>

              <IconButton component={Link} to='/admin' color='inherit' sx={{ ml: 1 }}>
                <SettingsIcon />
              </IconButton>

              <IconButton component={Link} to='/orders' color='inherit' sx={{ ml: 1 }}>
                <Badge badgeContent={orders.filter(o => o.status === 'new').length} color="error">
                  <StorefrontIcon />
                </Badge>
              </IconButton>

              {user && (
                <IconButton component={Link} to='/analytics' color='inherit'>
                  <Tooltip title='Аналітика'>
                    <AssessmentIcon />
                  </Tooltip>
                </IconButton>
              )}

              {user && (
                <IconButton onClick={handleLogout} color='inherit' sx={{ ml: 1 }}>
                  <Tooltip title='Вийти'>
                    <LogoutIcon />
                  </Tooltip>
                </IconButton>
              )}

            </Toolbar>
          </AppBar>

          <Container sx={{ mt: 4, flex: 1 }}>
            <Routes>
              <Route path='/' element={
                isLoading ? (
                  <ProductSkeleton />
                ) : (
                  <HomePage 
                    products={sortedProducts}
                    allCategories={allCategories}
                    onBuy={addToCart}
                    showExpensive={showExpensive}
                    setShowExpensive={setShowExpensive}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    currentCategory={currentCategory}
                    setCurrentCategory={setCurrentCategory}
                  />
                )
              }/>
              <Route path='/cart' element={
                <CartPage />
              }/>
              <Route path="/product/:id" element={
                <ProductPage products={products} onBuy={addToCart} />
              }/>
              <Route path='/admin' element={ user 
                ?
                <AdminPage 
                  onAddProduct={addProduct} 
                  onUpdateProduct={updateProduct}
                  onDeleteProduct={deleteProduct}
                  products={products}
                  categories={categoriesList}
                  cartItems={cartItems}
                /> 
                :<LoginPage />
              }
              />
              <Route path='/orders' element={user ? <OrdersPage /> : <LoginPage />} />
              <Route path='/login'  element={<LoginPage />} />
              <Route path='/analytics' element={ user ? <AnalyticsPage orders={orders} /> : <LoginPage /> } />
            </Routes>
          </Container>
          <Footer />
          <OrderDialog 
            open={isOrderModalOpen}
            onClose={() => setIsOrderModalOpen(false)}
            customerInfo={customerInfo}
            onInputChange={handleInputChange}
            totalPrice={totalPrice}
            onSubmit={async () => {
              try {
                const orderData = {
                  customer: customerInfo,
                  items: cartItems,
                  total: totalPrice,
                  status: 'new',
                  createdAt: serverTimestamp()
                }

                const docRef = await addDoc(collection(db, 'orders'), orderData)

                await sentTelegramMessage(orderData)

                alert(`Дякуємо, ${customerInfo.name}! Ваше замовлення № ${docRef.id.slice(0, 5)} прийнято.`)

                setIsOrderModalOpen(false)
                dispatch({ type: 'CLEAR_CART'})
                setCustomerInfo({name: '', phone: '', address: ''})

              } catch(error) {
                console.error('Помилка при створенні замовлення', error)
                alert('Йой! Щось пішло не так. Спробуйте будь ласка ще раз.')
              }
            }}
          />
          <Snackbar
            open={openSnackBar}
            autoHideDuration={3000}
            onClose={() => setOpenSnackBar(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <Alert 
              onClose={() => setOpenSnackBar(false)} 
              severity="success" 
              variant="filled" 
              sx={{ width: '100%' }}
            >
              {lastAddedItem}
            </Alert>
          </Snackbar>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App;