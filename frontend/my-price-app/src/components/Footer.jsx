import React from 'react';
import { Box, Typography, Container } from '@mui/material';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        backgroundColor: 'grey.100',
        borderTop: '1px solid',
        borderColor: 'divider',
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          &copy; {new Date().getFullYear()} <strong>Dealmate</strong>. All rights reserved.
        </Typography>
        {/* Optional Links */}
        {/* <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <Link to="/terms">Terms</Link> • <Link to="/privacy">Privacy</Link>
          </Typography>
        </Box> */}
      </Container>
    </Box>
  );
}

export default Footer;
