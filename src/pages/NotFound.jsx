import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PageShell from '../components/PageShell';

const NotFound = () => (
  <PageShell maxWidth="md" mainSx={{ minHeight: '58vh', display: 'grid', alignItems: 'center' }}>
    <Stack spacing={2.5}>
      <Typography variant="h1" sx={{ fontSize: { xs: '2.4rem', md: '3.2rem' } }}>
        Page not found
      </Typography>
      <Typography color="text.secondary">
        The page may have moved, or the address may not match a current post or project.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained" sx={{ alignSelf: 'flex-start' }}>
        Go home
      </Button>
    </Stack>
  </PageShell>
);

export default NotFound;
