import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Container, Link, Typography } from '@mui/material';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Blog', path: '/blog' },
  { label: 'Projects', path: '/projects' },
  { label: 'ARA ASM 2026', path: '/ara-asm-2026' },
];

const Navigation = () => {
  const location = useLocation();

  return (
    <Box
      component="header"
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'rgba(247, 248, 246, 0.86)',
        backdropFilter: 'blur(18px)',
      }}
    >
      <Container
        maxWidth="lg"
        component="nav"
        aria-label="Primary navigation"
        sx={{
          minHeight: 76,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 3,
          py: { xs: 1.5, sm: 0 },
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
        }}
      >
        <Link
          component={RouterLink}
          to="/"
          underline="none"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.25,
            color: 'text.primary',
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              fontWeight: 800,
              fontSize: '0.9rem',
            }}
          >
            CM
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 750, lineHeight: 1.1 }}>Dr. Chris McMaster</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.78rem', lineHeight: 1.2 }}>
              RheumAI
            </Typography>
          </Box>
        </Link>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.75, sm: 1 },
          }}
        >
          {navItems.map((item) => {
            const isActive =
              item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                component={RouterLink}
                to={item.path}
                underline="none"
                aria-current={isActive ? 'page' : undefined}
                sx={{
                  minHeight: 38,
                  px: { xs: 1.25, sm: 1.75 },
                  borderRadius: 2,
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: isActive ? 'primary.dark' : 'text.secondary',
                  backgroundColor: isActive ? 'rgba(14, 93, 100, 0.1)' : 'transparent',
                  fontSize: '0.94rem',
                  fontWeight: 700,
                  transition: 'background-color 160ms ease, color 160ms ease',
                  '&:hover': {
                    color: 'primary.dark',
                    backgroundColor: 'rgba(14, 93, 100, 0.08)',
                  },
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
};

export default Navigation;
