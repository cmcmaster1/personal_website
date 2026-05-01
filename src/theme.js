import { createTheme } from '@mui/material/styles';

const serifStack = 'Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif';
const sansStack =
  'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0e5d64',
      dark: '#093f45',
      light: '#2f858b',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#b85f44',
      dark: '#8f4430',
      light: '#d8866e',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f7f8f6',
      paper: '#ffffff',
    },
    text: {
      primary: '#151a18',
      secondary: '#58635e',
    },
    divider: '#dbe4de',
  },
  typography: {
    fontFamily: sansStack,
    letterSpacing: 0,
    h1: {
      fontFamily: serifStack,
      fontWeight: 600,
      lineHeight: 1.05,
      letterSpacing: 0,
    },
    h2: {
      fontFamily: serifStack,
      fontWeight: 600,
      lineHeight: 1.15,
      letterSpacing: 0,
    },
    h3: {
      fontFamily: serifStack,
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: 0,
    },
    h4: {
      fontFamily: serifStack,
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: 0,
    },
    h5: {
      fontWeight: 650,
      lineHeight: 1.3,
      letterSpacing: 0,
    },
    h6: {
      fontWeight: 650,
      lineHeight: 1.35,
      letterSpacing: 0,
    },
    body1: {
      fontSize: '1.06rem',
      lineHeight: 1.75,
      letterSpacing: 0,
    },
    body2: {
      lineHeight: 1.65,
      letterSpacing: 0,
    },
    button: {
      fontWeight: 650,
      letterSpacing: 0,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollBehavior: 'smooth',
        },
        body: {
          minWidth: 320,
          backgroundColor: '#f7f8f6',
        },
        '::selection': {
          backgroundColor: 'rgba(14, 93, 100, 0.18)',
        },
        a: {
          color: 'inherit',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 44,
          paddingInline: 18,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #dbe4de',
          boxShadow: '0 18px 48px rgba(21, 26, 24, 0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 650,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textUnderlineOffset: '0.18em',
          textDecorationThickness: '1px',
        },
      },
    },
  },
});

export default theme;
