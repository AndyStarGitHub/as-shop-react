import { Grid, Button, Container, Typography, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Box, Tabs, Tab, Paper } from "@mui/material"
import { ProductItem } from "../components/ProductItem"
import { useCategories } from "../context/CategoriesContext"
import type { Category } from "../types"
import type { Product } from '../types'
import { useProducts } from "../context/ProductContext"
import { useState } from "react"

export const HomePage = ({ 
    onBuy, 
    showExpensive, 
    setShowExpensive,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    currentCategory,
    setCurrentCategory,
    orders
}: any) => {
  const [onlyInStock, setOnlyInStock] = useState(false)
  const { products, isLoading } = useProducts() as { products: Product[], isLoading: boolean}
  console.log('Продукти з контексту на головній сторінці: ', products)
  const { categories } = useCategories()
 
  const filteredProducts = products.filter((p: Product) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPrice = showExpensive ? p.price > 400 : true
    const matchesCategory = currentCategory === 'all' || p.category === currentCategory
    const matchesStock = onlyInStock ? (p.stock || 0) > 0 : true
    return matchesSearch && matchesPrice && matchesCategory && matchesStock
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'asc') return a.price - b.price
    if (sortBy === 'desc') return b.price - a.price
    return 0
  })

  const categoriesToDisplay = ['all', ...categories.map((c: Category) => c.id)]

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setCurrentCategory(newValue)
  }

  const productsPopularity = (orders || []).reduce((acc: Record<string, number>, order: any) => {
    order.items.forEach((item: any) => {
      acc[item.title] = (acc[item.title] || 0) + item.quantity
    })
    return acc
  }, {})

  const hitProducts = products
    .filter(p => productsPopularity[p.title] > 0)
    .sort((a, b) => (productsPopularity[b.title] || 0) - (productsPopularity[a.title] || 0))
    .slice(0, 3)

  return (
    <Container>
      <Typography variant="h4" sx={{ my: 4, textAlign: 'center'}}>
        Вітрина товарів 
      </Typography>

      {hitProducts.length > 0 && (
        <Box sx={{ mb: 6, p: 3, bgcolor: '#fff9c4', borderRadius: 4, border: '2px dashed #fbc02d'}}>
          <Typography>
            🔥 Популярне зараз
          </Typography>
          <Grid container spacing={3}>
            {hitProducts.map((product) => (
              <Grid key={product.id} size={{ xs: 12, md: 4 }}>
                <Paper sx={{ p: 2, position: 'relative', overflow: 'hidden', height: '100%'}}>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: -30,
                      bgcolor: 'error.main',
                      color: 'white',
                      px: 5,
                      py: 0.5,
                      transform: 'rotate(45deg)',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}
                  >
                    HIT
                  </Box>
                  <Typography variant="h6">{product.title}</Typography>
                  <Typography color="primary" sx={{ fontWeight: 'bold'}}>{product.price}грн</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentCategory} onChange={handleChange} centered>
          {categoriesToDisplay.map((cat: string) => (
            <Tab
                key={cat}
                label={cat === 'all' ? 'Все' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                value={cat}
            />

          ))}


        </Tabs>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row'}} spacing = {2} sx = {{ mb: 4, alignItems: 'center' }} >
        <TextField 
          label='Пошук товарів, напоїв...'
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>Сортувати за ціною</InputLabel>
        <Select
          value={sortBy}
          label='Сортувати за ціною'
          onChange={(e) => setSortBy(e.target.value)}
        >
          <MenuItem value=''>Без сортування</MenuItem>
          <MenuItem value='asc'>Спочатку дешевші</MenuItem>
          <MenuItem value='desc'>Спочатку дорожчі</MenuItem>
        </Select>
      </FormControl>

      <Button
        variant="outlined"
        sx={{ height: '56px', whiteSpace: 'nowrap', px: 3 }}
        onClick={() => setShowExpensive(!showExpensive)}
      >
        {showExpensive ? 'Показати всі' : 'Тільки дорогі'}
      </Button>

      <Button
        variant={onlyInStock ? 'contained' : 'outlined'}
        color="success"
        sx={{ height: '56px', whiteSpace: 'nowrap', px: 3 }}
        onClick={() => setOnlyInStock(!onlyInStock) }
      >
        {onlyInStock ? 'Всі товари' : 'Тільки в наявності'}
      </Button>

    </Stack>
    <Grid container spacing={3}>
      {sortedProducts.length > 0 ? (
        Array.from(new Map(sortedProducts.map(p => [p.id, p])).values()).map((p: any) => (
          <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <ProductItem product={p} onBuy={() => onBuy(p)} />
          </Grid>
        ))
      ) : (
        <Typography sx={{ textAlign: 'center', width: '100%', mt: 4 }}>
          {isLoading ? 'Завантаження товарів...' : 'Нічого не знайдено за вашим запитом 😢'}
        </Typography>
      )}
    </Grid>
    </Container>
  )
}