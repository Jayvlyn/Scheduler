import { CssBaseline, Container, ThemeProvider, createTheme, Box } from '@mui/material';
import TimeAllocationSlider from './components/TimeAllocationSlider';
import CalendarComponent from './components/Calendar';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}>
        <CalendarComponent />
        <Container sx={{ flex: 1, py: 4 }}>
          {/* Your main content can go here */}
        </Container>
        <TimeAllocationSlider />
      </Box>
    </ThemeProvider>
  );
}

export default App;
