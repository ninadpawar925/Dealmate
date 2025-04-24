
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';
import {
    Typography, Box, Paper, CircularProgress, Alert, List, ListItem, ListItemIcon,
    ListItemText, TextField, Button, IconButton, Tooltip, Divider, ListItemButton 
} from '@mui/material';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import EventIcon from '@mui/icons-material/Event';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LogoutIcon from '@mui/icons-material/Logout';
import HistoryIcon from '@mui/icons-material/History'; 
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
import useAuthStore from '../store';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; 



function ProfilePage() {
    
    

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ username: '', email: '' });
    const [isSaving, setIsSaving] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const logout = useAuthStore(state => state.logout);
    const updateUserInStore = useAuthStore(state => state.setUser);
    const navigate = useNavigate();

    
    const fetchProfile = useCallback(async () => {
        
        setLoading(true); setError('');
        try {
            const response = await apiClient.get('/profile');
            
            setProfile(response.data);
            setFormData({ username: response.data?.username || '', email: response.data?.email || '' });
            
        } catch (err) { console.error("Failed fetch:", err); setError(err.response?.data?.message || "Could not load."); setProfile(null); }
        finally { setLoading(false); }
    
    }, []);

    
    useEffect(() => {
        
        fetchProfile();
        
    }, [fetchProfile]); 

    
    const handleEditToggle = () => {console.log("Edit button clicked!"); 
        if (!profile) return;
        const currentlyEditing = !isEditing;
        setIsEditing(currentlyEditing);
        if (!currentlyEditing) {
            setFormData({ username: profile.username || '', email: profile.email || '' });
            setError('');
        } };
    const handleInputChange = (event) => { };
    const handleSave = async () => { };
    const handleLogout = () => { logout(); navigate('/login'); enqueueSnackbar("Logged out.", { variant: 'info' }); };


    if (loading) { return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>; }

    return (<div className="page-container">
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 },  backgroundColor: 'background.paper', borderRadius: '12px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1"> User Profile </Typography>
                 {/* Edit/Save/Cancel Buttons */}
                 {!isEditing ? ( <Tooltip title="Edit Profile"><span> <IconButton onClick={handleEditToggle} color="primary" disabled={!profile} aria-label="Edit Profile"> <EditIcon /> </IconButton> </span></Tooltip> )
                            : ( <Box> <Tooltip title="Save Changes"><span> <IconButton onClick={handleSave} color="success" disabled={isSaving} aria-label="Save Changes"> {isSaving ? <CircularProgress size={24} color="inherit"/> : <SaveIcon />} </IconButton> </span></Tooltip> <Tooltip title="Cancel Edit"><span> <IconButton onClick={handleEditToggle} color="secondary" disabled={isSaving} aria-label="Cancel Edit"> <CancelIcon /> </IconButton> </span></Tooltip> </Box> )}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            {profile ? ( <>
                    <List sx={{ bgcolor: 'white', borderRadius: '8px' }}>
                        {/* Username */}
                        <ListItem>
                            <ListItemIcon sx={{ minWidth: 40 }}><AccountCircleIcon color="action" /></ListItemIcon>
                            {isEditing ? <TextField fullWidth variant="outlined" size="small" label="Username" name="username" value={formData.username} onChange={handleInputChange} disabled={isSaving}/>
                                       : <ListItemText primary="Username" secondary={profile.username} />}
                        </ListItem>
                        {/* Email */}
                        <ListItem>
                            <ListItemIcon sx={{ minWidth: 40 }}><EmailIcon color="action" /></ListItemIcon>
                            {isEditing ? <TextField fullWidth variant="outlined" size="small" label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} disabled={isSaving}/>
                                       : <ListItemText primary="Email" secondary={profile.email} />}
                        </ListItem>
                        {/* Member Since */}
                         <ListItem>
                            <ListItemIcon sx={{ minWidth: 40 }}><EventIcon color="action" /></ListItemIcon>
                            <ListItemText primary="Member Since" secondary={profile.created_at ? format(new Date(profile.created_at), 'PPP') : 'N/A'} />
                        </ListItem>

                        {/* --- NEW: Link to History Page --- */}
                        <Divider component="li" variant="middle" sx={{ my: 1 }}/>
                        <ListItem disablePadding>
                            <ListItemButton component={RouterLink} to="/history">
                                <ListItemIcon sx={{ minWidth: 40 }}><HistoryIcon color="action" /></ListItemIcon>
                                <ListItemText primary="View Search History" />
                            </ListItemButton>
                        </ListItem>
                         {/* --- End Link to History Page --- */}

                    </List>

                    <Divider sx={{ my: 3 }} />
                    {/* Logout Button */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Button variant="contained" color="error" startIcon={<LogoutIcon />} onClick={handleLogout} disabled={isEditing} > Logout </Button>
                    </Box>
                </>
            ) : ( !loading && !error && <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>Could not load profile data.</Typography> )}
        </Paper></div>
    );
}
export default ProfilePage;