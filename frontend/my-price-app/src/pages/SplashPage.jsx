
import React, { useEffect, useState } from 'react';
import { Box, Typography, Fade, CircularProgress } from '@mui/material';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';


const pulseKeyframes = `
  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(1); opacity: 0.7; }
  }
`;

function SplashPage() {
    const [visible, setVisible] = useState(false);

    
    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 100); 
        return () => clearTimeout(timer); 
    }, []);

    return (<div className="page-container">
        <>
            {/* Inject keyframes */}
            <style>{pulseKeyframes}</style>
            <Fade in={visible} timeout={1000}>
                {/* Use theme background */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100vh', 
                        width: '100vw', 
                        position: 'fixed', 
                        top: 0,
                        left: 0,
                        backgroundColor: 'primary.main', 
                        color: 'primary.contrastText', 
                        zIndex: 9999, 
                    }}
                >
                    <PriceCheckIcon sx={{
                        fontSize: '6rem', 
                        mb: 2,
                        animation: 'pulse 2s infinite ease-in-out' 
                    }} />
                    <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Dealmate
                    </Typography>
                    <Typography variant="h6" sx={{ fontStyle: 'italic' }}>
                        Find the Best Deal in Seconds
                    </Typography>
                    {/* Optional: Add a subtle loader if needed */}
                    {/* <CircularProgress color="inherit" size={20} sx={{mt: 3}} /> */}
                </Box>
            </Fade>
        </></div>
    );
}

export default SplashPage;