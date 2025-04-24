import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import useAuthStore from '../store';

function Navbar() {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

    return (
        <AppBar position="static" color="primary" elevation={1}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Typography
                    component={RouterLink}
                    to="/"
                    variant="h6"
                    sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 600 }}
                >
                    Dealmate
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button color="inherit" component={RouterLink} to="/">Home</Button>
                    {isLoggedIn && (
                        <>
                            <Button color="inherit" component={RouterLink} to="/chatbot">Chat</Button>
                            <Button color="inherit" component={RouterLink} to="/profile">Profile</Button>
                            <Button color="inherit" component={RouterLink} to="/history">History</Button>
                        </>
                    )}
                    {!isLoggedIn && (
                        <>
                            <Button color="inherit" component={RouterLink} to="/login">Login</Button>
                            <Button color="inherit" component={RouterLink} to="/register">Register</Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
