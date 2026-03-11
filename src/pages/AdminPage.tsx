import { Box, Button, Chip, Container, IconButton, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import EditIcon from '@mui/icons-material/Edit';
import { ImageUploader } from '../components/ImageUploader'
import type { Category } from "../types";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export const AdminPage = ({ 
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct, 
  products, 
  categories, 
  cartItems 
}: any) => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: 'fruits',
    image: ''
  })

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      onUpdateProduct({
        id: editingId,
        title: formData.title,
        price: Number(formData.price),
        category: formData.category,
        image: formData.image,
        description: 'Оновлено через адмінку'
      })
      setEditingId(null)
      alert('Зміни збережено')
    } else {
        const newProduct = {
      id: Date.now(),
      title: formData.title,
      price: Number(formData.price),
      category: formData.category,
      description: 'Додано через Адмінку',
      image: formData.image || `https://loremflickr.com/400/300/${formData.title.toLowerCase()}?lock=${Date.now()}`,
      }
      onAddProduct(newProduct)
      setFormData({ title: '', price: '', category: 'fruits', image: '' })
      alert('Товар додано')
    }
    navigate('/')
  }
  return (
    <Container sx={{ mt: 4 }}>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          size='small'
          label='Нова категорія'
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
        />
        <Button variant="contained" onClick={handleAddCategory}>Додати</Button>
      </Paper>

      <Box sx={{ mt: 3, mb: 4 }}>
        <Typography variant="subtitle2" color='text.secondary' gutterBottom>
          Наявні категорії. Натисніть "x" для видалення порожніх
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {categories.map((cat: Category) => {
            const productCount = products.filter((p: any) => p.category === cat.id).length
            return (
              <Chip 
                key={cat.id}
                label={`${cat.name} (${productCount})`}
                onDelete={() => handleDeleteCategory(cat.id, cat.name)}
                color={productCount > 0 ? 'primary' : 'default'}
                variant={productCount > 0 ? 'filled' : 'outlined'}
                sx={{ fontweight: productCount > 0 ? 'bold' : 'normal'} }
              />
            )

          })}

        </Box>
      </Box>

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

            {/* <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {categories.map((cat: Category) => (
                <Button 
                  key={cat.id}
                  variant="outlined"
                  size='small'
                  onClick={() => setFormData({...formData, category: cat.id})}
                >
                  {cat.name}
                </Button>
              ))}
            </Box> */}

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
          {products.map((product: any) => {
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
                  onClick={() => onDeleteProduct(product.id)}
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