import { Grid, Button, Container, Typography, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Box, Tabs, Tab } from "@mui/material"
import { ProductItem } from "../components/ProductItem"
import { useCategories } from "../context/CategoriesContext"
import type { Category } from "../types"
import type { Product } from '../types'
import { useProducts } from "../context/ProductContext"

export const HomePage = ({ 
    onBuy, 
    showExpensive, 
    setShowExpensive,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    currentCategory,
    setCurrentCategory
}: any) => {
  const { products, isLoading } = useProducts() as { products: Product[], isLoading: boolean}
  console.log('Продукти з контексту на головній сторінці: ', products)
  const { categories } = useCategories()
 
  const filteredProducts = products.filter((p: Product) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPrice = showExpensive ? p.price > 400 : true
    const matchesCategory = currentCategory === 'all' || p.category === currentCategory
    return matchesSearch && matchesPrice && matchesCategory
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

  return (
    <Container>
      <Typography variant="h4" sx={{ my: 4, textAlign: 'center'}}>
        Вітрина товарів 
      </Typography>

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
    </Stack>
      <Grid container spacing={3}>
        {sortedProducts.length > 0 ? (
            sortedProducts.map((p: any) => (
              <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <ProductItem product={p} onBuy={() => onBuy(p)}/>
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