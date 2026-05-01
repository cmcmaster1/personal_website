import React from 'react';
import { Box, Container } from '@mui/material';
import Navigation from './Navigation';

const PageShell = ({ children, maxWidth = 'lg', mainSx }) => (
  <Box
    sx={{
      minHeight: '100vh',
      background:
        'linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(247,248,246,0.98) 520px, #f7f8f6 100%)',
    }}
  >
    <Navigation />
    <Container
      component="main"
      maxWidth={maxWidth}
      sx={{
        py: { xs: 4, md: 7 },
        ...mainSx,
      }}
    >
      {children}
    </Container>
  </Box>
);

export default PageShell;
