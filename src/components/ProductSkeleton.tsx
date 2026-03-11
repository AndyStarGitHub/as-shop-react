import { Box, Grid, Skeleton } from '@mui/material'

export const ProductSkeleton = () => {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item} >
            <Box sx={{ p: 2 }}>
                <Skeleton variant='rectangular' width='100%' height={200} sx={{ borderRadius: 2 }} />
                <Skeleton variant='text' width='80%' height={30} sx={{ mt: 1 }} />
                <Skeleton variant='text' width='40%' height={20} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Skeleton variant='circular' width={40} height={40}/>
                  <Skeleton variant='rectangular' width={40} height={36}/>
                </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    )
}