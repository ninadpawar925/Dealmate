// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Paper,
  CircularProgress, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';
import useAuthStore from '../store';

function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiClient.post('/register', form);
      setToken(res.data.access_token);
      setUser(res.data.user);
      navigate('/dashboard'); // or '/chatbot' based on your UX flow
    } catch (err) {
      setError(err.response?.data?.message || 'Registration sucessfully!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="page-container" sx={{ mt: 6 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, maxWidth: 480, mx: 'auto', borderRadius: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Create your Dealmate Account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            name="username"
            fullWidth
            margin="normal"
            autoComplete="username"
            value={form.username}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 2, py: 1.3 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default RegisterPage;
