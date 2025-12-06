import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const HomeRedirect = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    switch (user.role) {
        case 'admin': return <Navigate to="/admin" replace />;
        case 'doctor': return <Navigate to="/doctor" replace />;
        case 'patient': return <Navigate to="/patient" replace />;
        case 'lab_technician': return <Navigate to="/lab" replace />;
        case 'pharmacist': return <Navigate to="/pharmacy" replace />;
        default: return <Navigate to="/login" replace />;
    }
};

export default HomeRedirect;
