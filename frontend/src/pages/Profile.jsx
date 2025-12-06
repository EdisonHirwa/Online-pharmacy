import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Paper, Typography, Box, TextField, Button, Alert } from '@mui/material';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success');

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.name || '',
                email: user.email || '', // Note: email might not be in user object if not returned by login
                phone: user.phone || '',
                address: user.address || ''
            });
            // Fetch full profile if needed
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            // We need a general profile endpoint. For now using patientController for everyone or create a userController?
            // Let's use authController check_session or a new action.
            // Actually, patientController has 'profile' action but only for patients.
            // Let's assume we can get basic info from session check or implement a generic profile endpoint.
            // For now, let's just use what we have or mock it if backend isn't ready.
            // I'll implement a generic 'profile' action in authController.
            const response = await axios.get('http://localhost/Online_pharmacy/Backend/controllers/authController.php?action=profile', {
                withCredentials: true
            });
            if (response.data) {
                setFormData({
                    full_name: response.data.full_name,
                    email: response.data.email,
                    phone: response.data.phone,
                    address: response.data.address
                });
            }
        } catch (error) {
            console.error("Error fetching profile", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost/Online_pharmacy/Backend/controllers/authController.php?action=update_profile', formData, {
                withCredentials: true
            });
            setMessage("Profile updated successfully.");
            setSeverity("success");
        } catch (error) {
            setMessage("Failed to update profile.");
            setSeverity("error");
        }
    };

    return (
        <DashboardLayout title="My Profile">
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Edit Profile
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Full Name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Email Address"
                                name="email"
                                value={formData.email}
                                disabled
                            />
                            <TextField
                                margin="normal"
                                fullWidth
                                label="Phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                            <TextField
                                margin="normal"
                                fullWidth
                                label="Address"
                                name="address"
                                multiline
                                rows={3}
                                value={formData.address}
                                onChange={handleChange}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Save Changes
                            </Button>
                            {message && <Alert severity={severity} sx={{ mt: 2 }}>{message}</Alert>}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </DashboardLayout>
    );
};

export default Profile;
