// src/theme.js
// Base Theme Configuration Object
const dealmateBaseThemeConfig = {
    palette: {
        primary: { main: '#4F46E5' }, secondary: { main: '#3B82F6' },
        background: { default: '#FFFFFF', paper: '#F3F4F6' },
        text: { primary: '#1F2937', secondary: '#6B7280' },
        success: { main: '#10B981' }, error: { main: '#EF4444' },
        divider: '#E5E7EB', common: { black: '#000000', white: '#FFFFFF' }
    },
    typography: {
        fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
        h1: { fontSize: '2.5rem', fontWeight: 700 }, h2: { fontSize: '2rem', fontWeight: 600 },
        h3: { fontSize: '1.75rem', fontWeight: 600 }, h4: { fontSize: '1.5rem', fontWeight: 600 },
        h5: { fontSize: '1.25rem', fontWeight: 500 }, h6: { fontSize: '1.1rem', fontWeight: 500 },
        body1: { fontFamily: '"Lato", "Helvetica", "Arial", sans-serif', fontSize: '1rem', fontWeight: 400 },
        body2: { fontFamily: '"Lato", "Helvetica", "Arial", sans-serif', fontSize: '0.875rem', fontWeight: 400 },
        button: { textTransform: 'none', fontWeight: 500, }
    },
    components: {
        MuiButton: { styleOverrides: { root: { borderRadius: '8px', transition: 'transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out', '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',} }, containedPrimary: { color: '#FFFFFF', }, containedError: { color: '#FFFFFF', } } },
        MuiCard: { styleOverrides: { root: { borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', padding: '16px', backgroundColor: '#FFFFFF' },}, defaultProps: { elevation: 0, } },
        MuiPaper: { styleOverrides: { root: { backgroundColor: '#F3F4F6' } } },
        MuiTextField: { styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#FFFFFF', transition: 'box-shadow 0.2s ease-in-out', '& fieldset': { borderColor: '#E5E7EB', }, '&:hover fieldset': { borderColor: '#6B7280', }, '&.Mui-focused': { '& fieldset': { borderColor: '#4F46E5', borderWidth: '1px', }, boxShadow: `0 0 0 2px rgba(79, 70, 229, 0.2)`, } }, },}, },
        MuiAlert: { styleOverrides: { root: { borderRadius: '8px', }, standardSuccess: { backgroundColor: '#D1FAE5', color: '#065F46' }, standardError: { backgroundColor: '#FEE2E2', color: '#991B1B' }, } },
        MuiList: { styleOverrides: { root: { backgroundColor: '#FFFFFF', borderRadius: '8px' } } },
        MuiFab: { styleOverrides: { root: { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', transition: 'transform 0.1s ease-in-out', '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 6px 12px rgba(0, 0, 0, 0.25)', } } } }
    }
};
export default dealmateBaseThemeConfig;