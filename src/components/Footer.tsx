import { Box, Container, IconButton, Stack, Typography } from "@mui/material"
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import GitHubIcon from '@mui/icons-material/GitHub';

export const Footer = () => {
    return (
        <Box
            component='footer'
            sx={{
                py: 3,
                ps: 2,
                mt: 'auto',
                backgtoundColor: (theme) => 
                    theme.palette.mode === 'light'
                        ? theme.palette.grey[200]
                        : theme.palette.grey[800]
            }}
        >
              <Container maxWidth='lg'>
                <Stack 
                  direction={{ xs: 'column', sm: 'row'}}
                  justifyContent='space-between'
                  alignItems='center'
                  spacing={2}
                >
                  <Typography variant="body2" color="text.secondary">
                    © {new Date().getFullYear()} Мій Супер Магазин. Всі права захищені.
                  </Typography>

                  <Stack direction='row' spacing={1}>
                    <IconButton color='inherit' href="https://instagram.com" target="_blank">
                      <InstagramIcon />
                    </IconButton>
                    <IconButton color="inherit" href="https://t.me" target="_blank">
                      <TelegramIcon />
                    </IconButton>
                    <IconButton color="inherit" href="https://github.com" target="_blank">
                      <GitHubIcon />
                    </IconButton>
                  </Stack>
                </Stack>
              </Container>


        </Box>
    )
}