
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';
import {
    Typography, Box, Paper, List, ListItem, ListItemIcon, ListItemText,
    ListSubheader, Switch, Divider, Select, MenuItem, FormControl, InputLabel, Link as MuiLink,
    CircularProgress, Alert
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmailIcon from '@mui/icons-material/Email';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LanguageIcon from '@mui/icons-material/Language';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { Link as RouterLink } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import useAuthStore from '../store';

function SettingsPage() {
    const [settings, setSettings] = useState({ email_notifications: null, dark_mode: null });
    const [language, setLanguage] = useState('en');
    const [loading, setLoading] = useState(true);
    const [savingKey, setSavingKey] = useState(null);
    const [error, setError] = useState('');
    const { enqueueSnackbar } = useSnackbar();
    const setThemeMode = useAuthStore(state => state.setThemeMode);

    const fetchSettings = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const response = await apiClient.get('/settings');
            const fetchedSettings = {
                email_notifications: response.data?.email_notifications ?? true,
                dark_mode: response.data?.dark_mode ?? false,
            };
            setSettings(fetchedSettings);
            
            setThemeMode(fetchedSettings.dark_mode ? 'dark' : 'light');
        } catch (err) { console.error("Fetch Settings Err:", err); setError(err.response?.data?.message || "Could not load."); setSettings({ email_notifications: true, dark_mode: false }); } 
        finally { setLoading(false); }
    }, [setThemeMode]);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    const handleSettingChange = async (key, value) => {
        setSavingKey(key);
        try {
            const response = await apiClient.put('/settings', { [key]: value });
            const savedValue = response.data?.settings?.[key] ?? value;
            setSettings(prev => ({ ...prev, [key]: savedValue }));
            if (key === 'dark_mode') { setThemeMode(savedValue ? 'dark' : 'light'); } 
            enqueueSnackbar(response.data?.message || 'Setting updated!', { variant: 'success' });
        } catch (err) { console.error(`Save Setting ${key} Err:`, err); enqueueSnackbar(err.response?.data?.message || `Failed to update.`, { variant: 'error' }); fetchSettings(); } 
        finally { setSavingKey(null); }
    };

    const handleEmailNotifChange = (event) => { handleSettingChange('email_notifications', event.target.checked); };
    const handleDarkModeChange = (event) => { handleSettingChange('dark_mode', event.target.checked); };
    const handleLanguageChange = (event) => { setLanguage(event.target.value); alert("Language saving coming soon!"); };

    if (loading) { return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>; }

    return (<div className="page-container">
        
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, maxWidth: 800, margin: 'auto', backgroundColor: 'background.paper', borderRadius: '12px' }}>
            <Typography variant="h4" component="h1" gutterBottom> Settings </Typography>
            {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
            {!loading && (
                <List sx={{ width: '100%', bgcolor: 'white', borderRadius: '8px' }}>
                    {/* Account */}
                    <ListSubheader sx={{ bgcolor: 'inherit', borderRadius: '8px 8px 0 0' }}>Account</ListSubheader>
                    <ListItem button component={RouterLink} to="/profile"> <ListItemIcon><AccountBoxIcon /></ListItemIcon> <ListItemText primary="Profile" secondary="Manage username/email" /> </ListItem>
                    <Divider component="li" />
                    {/* Notifications */}
                    <ListSubheader sx={{ bgcolor: 'inherit' }}>Notifications</ListSubheader>
                    <ListItem>
                        <ListItemIcon><EmailIcon /></ListItemIcon>
                        <ListItemText id="sl-email" primary="Email Notifications" secondary="Receive updates via email" />
                        <Switch edge="end" onChange={handleEmailNotifChange} checked={settings.email_notifications ?? true} disabled={savingKey === 'email_notifications'} inputProps={{ 'aria-labelledby': 'sl-email', }} />
                        {savingKey === 'email_notifications' && <CircularProgress size={20} sx={{ml: 1}} />}
                    </ListItem>
                    <Divider component="li" />
                    {/* Appearance */}
                    <ListSubheader sx={{ bgcolor: 'inherit' }}>Appearance</ListSubheader>
                     <ListItem>
                        <ListItemIcon><DarkModeIcon /></ListItemIcon>
                        <ListItemText id="sl-darkmode" primary="Dark Mode" />
                        <Switch edge="end" onChange={handleDarkModeChange} checked={settings.dark_mode ?? false} disabled={savingKey === 'dark_mode'} inputProps={{ 'aria-labelledby': 'sl-darkmode', }} />
                        {savingKey === 'dark_mode' && <CircularProgress size={20} sx={{ml: 1}} />}
                    </ListItem>
                    <Divider component="li" />
                    {/* Language */}
                    <ListSubheader sx={{ bgcolor: 'inherit' }}>Language</ListSubheader>
                     <ListItem>
                        <FormControl size="small" sx={{ m: 0, minWidth: 150, marginLeft: 'auto' }}>
                            <InputLabel id="lang-select-label">Language</InputLabel>
                            <Select labelId="lang-select-label" id="lang-select" value={language} label="Language" onChange={handleLanguageChange} disabled={Boolean(savingKey)} > <MenuItem value={'en'}>English (US)</MenuItem> <MenuItem value={'en-GB'} disabled>English (UK)</MenuItem> </Select>
                        </FormControl>
                     </ListItem>
                    <Divider component="li" />
                    {/* Legal */}
                     <ListSubheader sx={{ bgcolor: 'inherit' }}>Legal & Help</ListSubheader>
                      <ListItem button component="a" href="/privacy-policy" target="_blank"> <ListItemIcon><PrivacyTipIcon /></ListItemIcon> <ListItemText primary="Privacy Policy" /> </ListItem>
                </List>
            )}
        </Paper></div>
    );
}
export default SettingsPage;