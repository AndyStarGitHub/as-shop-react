import { Box, Button, Chip, Container, IconButton, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import EditIcon from '@mui/icons-material/Edit';
import { ImageUploader } from '../components/ImageUploader'
import type { Category, Product } from "../types";
import { collection, deleteDoc, doc, setDoc, addDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useCategories } from '../context/CategoriesContext'
import { useCart} from '../context/CartContext'
import { useProducts } from "../context/ProductContext";

export const AdminPage = ({ 
  cartItems 
}: any) => {
  const [adminSortBy, setAdminSortBy] = useState<string>('newest')
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [adminSearchQuery, setAdminSearcQuery] = useState('')
  const { products, productsDispatch } = useProducts()
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    image: ''
  })

  const { categories, isLoading } = useCategories()

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [ ...prev, categoryId]
    )
  }

  useEffect(() => {
    if (!isLoading && categories.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: categories[0].id }))
    }
  }, [isLoading, categories, formData.category]  )

  const [editingId, setEditingId] = useState<number | null>(null);

  const [newCatName, setNewCatName] = useState('')

  const navigate = useNavigate()

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {

    const hasProducts = products.some((p:any) => p.category === categoryId)
    if (hasProducts) {
      alert(`❌ Зупиніться! У категорії "${categoryName}" ще є товари. Спочатку змініть їхню категорію або видаліть їх, щоб не залишити товари "сиротами".`)
    }

    if (window.confirm(`Ви впевнені, що хочете видалити порожню категорію "${categoryName}"`)) {
      try {
        await deleteDoc(doc(db, 'categories', categoryId))
        alert('Категорію успішно видалено зі штабу! 🗑️')
      } catch(error) {
        console.error('Помилка при видаленні', error)
        alert("Не вдалось видалити категорію, перевірти зв'язок.")
      }
    }

  }

  const handleEditCaterory = (cat: Category) => {
    setEditCategoryId(cat.id)
    setNewCatName(cat.name)
  }

  const handleSaveCategory = async () => {
    if (!newCatName.trim()) return

    try {
      if (editCategoryId) {
        await updateDoc(doc(db, 'categories', editCategoryId), {
          name: newCatName
        })
        setEditCategoryId(null)
        alert('Назву категорії змінено ✏️')
      } else {
        const categoryId = newCatName.toLowerCase().trim().replace(/\s+/g, '-')
        await setDoc(doc(db, 'categories', categoryId), {
          name: newCatName,
          slug: categoryId
        })
        alert('Категорія додана! ✅')
      }
      setNewCatName('')
    } catch (e) {
      alert('Помилка при збереженні категорійки')
    }
  }

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    const categoryId = newCatName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')

    try {
      await setDoc(doc(db, 'categories', categoryId), {
        name: newCatName,
        slug: categoryId
      })
      setNewCatName('')
      alert('Категорія синхронізована! ✅')
    } catch(e) {
      console.error("Помилка штабного зв'язку!", e)
      alert('Помилка при збереженні')
    }
  }

  const handleEditClick = (product: any) => {
    setEditingId(product.id);
    setFormData({
      title: product.title,
      price: String(product.price),
      category: product.category,
      image: product.image || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth'})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      const updateDate = {
        title: formData.title,
        price: Number(formData.price),
        category: formData.category,
        image: formData.image,
        description: 'Оновлено в адмінці, контекст'
      }
      try {
        const productRef = doc(db, 'products', String(editingId))
        await updateDoc(productRef, updateDate)
        productsDispatch({
          type: 'UPDATE_PRODUCT',
          product: { id: String(editingId), ...updateDate } as Product
        })
        setEditingId(null)
        alert('Дані продукту оновлено в базі (контекст)! 💰✨');
      } catch(error) {
        alert('Не вдалось оновити продукт в базі даних. ❌')
      }
    } else {
      const newProductData = {
        title: formData.title,
        price: Number(formData.price),
        category: formData.category,
        image: formData.image || 'https://via.placeholder.com/150',
        description: 'Додано через адмінку з контекстом'
      }
      try {
        const docRef = await addDoc(collection(db, 'products'), newProductData)
        productsDispatch({
          type: 'ADD_PRODUCT',
          product: { id: docRef.id, ...newProductData } as Product
        })
        alert('Продукт записано в базу ✅')
      } catch(error) {
        console.error('Помилка додавання', error)
        alert('Йой. В базу не записалось... ❌')
      }
    }
    navigate('/')
  }
  
  console.log("DEBUG: Categories from Context:", categories);
  if (isLoading) return <Typography sx={{ mt: 4 }}>Синхронізація зі штабом...</Typography>

  const filteredProducts = products.filter((p: any) => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category)
    const matchesSearch = p.title.toLowerCase().includes(adminSearchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (adminSortBy === 'price-asc') return (a.price - b.price)
    if (adminSortBy === 'price-desc') return (b.price - a.price)
    if (adminSortBy === 'alpha') return (a.title.localeCompare(b.title))
    return 0
  })

  return (
    <Container sx={{ mt: 4 }}>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          size='small'
          label='Нова категорія'
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
        />
        <Button 
          variant="contained" 
          onClick={handleSaveCategory}
          color={editCategoryId ? 'success' : 'primary'}
        >
          {editCategoryId ? 'Зберегти зміни ' : 'Додати'}
        </Button>
      </Paper>

      <Box sx={{ mt: 3, mb: 4 }}>
        <Typography variant="subtitle2" color='text.secondary' gutterBottom>
          Наявні категорії. Натисніть "x" для видалення порожніх
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            label={`Всі (${products.length})`}
            onClick={() => setSelectedCategories([])}
            color={selectedCategories.length === 0 ? 'secondary' : 'default'} 
            variant={selectedCategories.length === 0 ? 'filled' : 'outlined'}
          />

          {categories.map((cat: Category) => {
            const productCount = products.filter((p: any) => p.category === cat.id).length
            const isSelected = selectedCategories.includes(cat.id)

            return (
              <Box>
                <Chip 
                  key={cat.id}
                  label={`${cat.name} (${productCount})` }
                  onClick={() => toggleCategory(cat.id)}
                  onDelete={() => handleDeleteCategory(cat.id, cat.name)}
                  color={isSelected ? 'primary' : (productCount > 0 ? 'info' : 'default')}
                  variant={isSelected ? 'filled' : 'outlined'}
                  sx={{ fontWeight: isSelected ? 'bold' : 'normal' }}
                />
                <IconButton size="small" onClick={() => handleEditCaterory(cat)} >
                  <EditIcon sx={{ fontSize: 16, color: '#888'}}/>
                </IconButton>
              </Box>
            )
          })}
        </Box>
      </Box>

      <Stack>
        <TextField 
          fullWidth
          size='small'
          variant="outlined"
          placeholder="🔍 Швиденький пошук товарчиків за назвою..."
          value = {adminSearchQuery}
          onChange={(e) => setAdminSearcQuery(e.target.value)}
          sx={{ 
            mb: 2, 
            bgcolor: 'rgba(255, 255, 255, 0.05',
            borderRadius: 1,
            '& .MuiInputBase-input': {
              color: '#aaaaaa'
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#888888',
              opacity: 1,
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#555555'
              }
            }
          }}
        />

        <TextField
          select
          size="small"
          label='Сортувати'
          value={adminSortBy}
          onChange={(e) => setAdminSortBy(e.target.value)}
          sx={{ minWidth: 200, bgcolor: 'rgba(255, 255, 255, 0.05)', '& .MuiInputLabel-root': { color: '#888'}}}
          SelectProps={{
            sx: {color: '#aaa'}
          }}
        >
          <MenuItem value="newest">За замовчуванням</MenuItem>
          <MenuItem value="price-asc">💸 Спочатку дешеві</MenuItem>
          <MenuItem value="price-desc">💰 Спочатку дорожчі</MenuItem>
          <MenuItem value="alpha">🔤 За алфавітом (А-Я)</MenuItem>    
        </TextField>
      </Stack>

      <Paper sx={{ p: 4, maxWidth: 500, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          {editingId ? '✏️ Редагування товару' : '🛠️ Панель адміністратора'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField 
              label='Назва товару'
              fullWidth
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
            <TextField 
              label="Ціна"
              type='number'
              fullWidth
              required
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
            />

            <TextField
              select
              label='Категорія'
              fullWidth
              required
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {categories.map((cat: Category) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField 
              label='URL зображення'
              fullWidth
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              placeholder='https://example.com/photo.jpg'
            />

            {formData.image && (
              <Box sx={{
                mt: 2,
                p: 1,
                border: '1px dashed',
                borderColor: 'primary.main',
                borderRadius: 2,
                bgcolor: 'action.hover',
                textAlign: 'center'
              }}>
                <Typography variant="caption" color='text.secondary' display='block' gutterBottom>
                  👁️ Попередній перегляд об'єкта:
                </Typography>
                <img 
                  src={formData.image}
                  alt="Прев'ю товару"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Зображення+не+знайдено'
                  }}
                />
              </Box>
            )}

            <ImageUploader 
              onUploadSuccess={(url) => {
                setFormData(prev => ({ ...prev, image: url }))
                alert('Фото успішно завантажено в хмару! ☁️')
              }}
            />

            <Button type='submit' variant='contained' color='primary' size='large'>
              Додати на вітрину
            </Button>
          </Stack>
        </form>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center'}}>
        📦 Керування вітриною   
      </Typography>
      <Paper sx={{ p: 2, maxWidth: 600, mx: 'auto'}}>
        <Stack spacing={2}>
          {sortedProducts.map((product: any) => {
            const isDisabled = cartItems.some((item: any) => item.id === product.id)
            return (
              <Box
                key={product.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1,
                  borderBottom: '1px solid #eee'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <img
                    src={product.image}
                    alt=''
                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                  />
                  <Typography sx={{ color: isDisabled ? 'text-secondary' : 'text-primary' }}>
                    {product.title} ({product.price} грн)
                    {isDisabled && <span style={{ color: '#ed6c02', fontSize: '0.8 rem', marginLeft: '8px'}}>🛒 зарезервовано</span>}
                  </Typography>
                </Box>

                <Typography sx={{ opacity: isDisabled ? 0.5 : 1 }}>

                </Typography>

                <IconButton color="primary" onClick={() => handleEditClick(product)}>
                  <EditIcon />
                </IconButton>

                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  disabled={isDisabled}

                  onClick={async () => {
                    if (window.confirm(`Видалити "${product.title}"?`)) {
                      try {
                        const productRef = doc(db, 'products', String(product.id))
                        await deleteDoc(productRef)
                        productsDispatch({ type: 'DELETE_PRODUCT', id: String(product.id) })
                        alert('Товар видалено з бази даних (контекст)! 🗑️✅');
                      } catch(error) {
                        console.error('Помилка видалення (контекст): ', error)
                        alert('Не вдалося видалити з бази. Перевірте зв’язок. ❌');
                      }

                    }
                  }}
                >
                  Видалити
                </Button>
              </Box>
            )
          })}
        </Stack>

      </Paper>
    </Container>
  )
}
