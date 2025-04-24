import React from 'react';
import {
  Box, Typography, Container, Paper, Button, Grid, Card, CardMedia,
  CardContent, CardActions, Tooltip, Fab
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store';

const sampleProducts = [
  {
    title: "Apple iPhone 15 (128GB)",
    price: 79990,
    source: "Flipkart",
    link: "https://www.flipkart.com/apple-iphone-15",
    image: "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/h/h/z/-original-imagtc5fzrzzhcvp.jpeg"
  },
  {
    title: "OnePlus Nord CE 3 Lite",
    price: 19999,
    source: "Amazon",
    link: "https://www.amazon.in/dp/B0BY8MCJSX",
    image: "https://m.media-amazon.com/images/I/61QRgOgBx0L._SL1500_.jpg"
  },
  {
    title: "Samsung Galaxy S23",
    price: 74999,
    source: "Samsung India",
    link: "https://www.samsung.com/in/smartphones/galaxy-s23",
    image: "https://images.samsung.com/is/image/samsung/p6pim/in/sm-s911bzkdins/gallery/in-galaxy-s23-s911-sm-s911bzkdins-thumb-535719070"
  },
  {
    title: "Redmi Note 12 Pro+ 5G",
    price: 28999,
    source: "Mi Store",
    link: "https://www.mi.com/in/product/redmi-note-12-pro-plus-5g/",
    image: "https://i01.appmifile.com/webfile/globalimg/in/cms/B4DAFDC3-5E1A-64C6-1FBD-1D0FDF244324.jpg"
  }
];

function HomePage() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const navigate = useNavigate();

  const handleChatbotClick = () => {
    navigate(isLoggedIn ? "/chatbot" : "/login");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: '16px', backgroundColor: 'background.paper' }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
          Welcome to Dealmate!
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 3 }}>
          Discover the best product deals with our smart assistant.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ChatIcon />}
          onClick={handleChatbotClick}
          sx={{ mb: 2 }}
        >
          Open Chat Assistant
        </Button>
      </Paper>

      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
          <AutoAwesomeIcon sx={{ mr: 1, color: 'secondary.main' }} />
          Recommended Deals
        </Typography>
        <Grid container spacing={3}>
          {sampleProducts.map((product, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ borderRadius: 2 }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={product.image}
                  alt={product.title}
                />
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {product.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    ₹{product.price} – {product.source}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="outlined"
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<ShoppingCartIcon />}
                  >
                    Buy Now
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Floating FAB */}
      <Tooltip title="Ask Dealmate Assistant">
        <Fab
          color="primary"
          aria-label="chat"
          onClick={handleChatbotClick}
          sx={{
            position: 'fixed',
            bottom: { xs: 70, sm: 32 },
            right: { xs: 16, sm: 32 },
            zIndex: 999
          }}
        >
          <ChatIcon />
        </Fab>
      </Tooltip>
    </Container>
  );
}

export default HomePage;
