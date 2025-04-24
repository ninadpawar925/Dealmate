import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent, CardActions,
  Container, CircularProgress, Alert, Pagination
} from '@mui/material';
import apiClient from '../api';

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clearing, setClearing] = useState(false);

  const fetchHistory = async (currentPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get(`/history?page=${currentPage}&per_page=5`);
      setHistory(res.data.items);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      setError('Failed to load history.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      await apiClient.delete('/history');
      setHistory([]);
    } catch {
      setError('Failed to clear history.');
    } finally {
      setClearing(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Your Search History</Typography>
        <Button
          variant="outlined"
          color="error"
          onClick={handleClear}
          disabled={clearing || loading}
        >
          Clear All
        </Button>
      </Box>

      {loading && <CircularProgress />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {history.length === 0 && !loading && (
        <Typography variant="body1">No history found.</Typography>
      )}

      {history.map((item) => (
        <Card key={item.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1">{item.query}</Typography>
            <Typography variant="caption" color="text.secondary">
              Searched on: {new Date(item.timestamp).toLocaleString()}
            </Typography>
            {item.best_offer && (
              <Box mt={1}>
                <Typography variant="body2">
                  Best Offer: <strong>₹{item.best_offer.price.toLocaleString()}</strong> from {item.best_offer.source}
                </Typography>
              </Box>
            )}
          </CardContent>
          {item.best_offer?.link && (
            <CardActions>
              <Button
                size="small"
                color="primary"
                variant="contained"
                href={item.best_offer.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Buy Now
              </Button>
            </CardActions>
          )}
        </Card>
      ))}

      {totalPages > 1 && (
        <Box mt={3} display="flex" justifyContent="center">
          <Pagination count={totalPages} page={page} onChange={handlePageChange} />
        </Box>
      )}
    </Container>
  );
}

export default HistoryPage;
