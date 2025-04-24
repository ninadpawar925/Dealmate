
import React from 'react';
import { Box, Typography, Button, Container, Paper, Grid } from '@mui/material';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { Link as RouterLink } from 'react-router-dom';

function WelcomePage() {
    return (<div className="page-container">
        <Container maxWidth="md">
            <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, mt: { xs: 2, sm: 4 }, textAlign: 'center', backgroundColor: 'background.paper', borderRadius: '16px', border: '1px solid', borderColor: 'divider' }} >
                <PriceCheckIcon sx={{ fontSize: { xs: 50, sm: 60 }, color: 'primary.main', mb: 2 }} />
                <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', fontSize: { xs: '2rem', sm: '2.5rem'} }}>
                    Welcome to Dealmate!
                </Typography>
                <Typography variant="h5" color="text.secondary" paragraph sx={{ mb: 4, fontSize: { xs: '1.1rem', sm: '1.25rem'} }}>
                    Find the Best Deal in Seconds. <br /> Your smart assistant for price comparison across the web.
                </Typography>

                <Grid container spacing={2} justifyContent="center"> {/* Reduced spacing */}
                    <Grid item xs={12} sm={6} md={5}>
                        <Button fullWidth variant="contained" color="primary" size="large" startIcon={<TravelExploreIcon />} component={RouterLink} to="/register" sx={{ py: 1.5, borderRadius: '8px' }} > Get Started (Register) </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={5}>
                        <Button fullWidth variant="outlined" color="primary" size="large" startIcon={<LockOpenIcon />} component={RouterLink} to="/login" sx={{ py: 1.5, borderRadius: '8px' }} > Login </Button>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 5, borderTop: 1, borderColor: 'divider', pt: 3 }}>
                    <Typography variant="h6" gutterBottom>How Dealmate Helps You:</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ px: 2 }}> {/* Add padding */}
                        - Compare prices instantly from major online stores.<br />
                        - Chat naturally with our AI assistant.<br />
                        - Use voice or image search (coming soon!).<br />
                        - Track your search history.
                    </Typography>
                </Box>
            </Paper>
        </Container></div>
    );
}
export default WelcomePage;