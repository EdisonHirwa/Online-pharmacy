import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Paper, Typography, Box, Badge, IconButton } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import NotificationsIcon from '@mui/icons-material/Notifications';

const StatCard = ({ title, value, icon, color }) => (
    <Paper
        sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 140,
            justifyContent: 'space-between',
            background: `linear-gradient(45deg, ${color} 30%, ${color}90 90%)`,
            color: 'white',
            borderRadius: 2,
            boxShadow: 3
        }}
    >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Typography component="h2" variant="h6" fontWeight="bold">
                {title}
            </Typography>
            {icon}
        </Box>
        <Typography component="p" variant="h3" fontWeight="bold">
            {value}
        </Typography>
    </Paper>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        patients: 0,
        doctors: 0,
        appointments: 0,
        revenue: 0,
        beds_available: 0,
        beds_occupied: 0,
        today_admissions: 0,
        pending_tests: 0,
        recent_activity: [],
        alerts: []
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost/Online_pharmacy/Backend/controllers/adminController.php?action=stats', {
                withCredentials: true
            });
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching stats", error);
        }
    };

    const data = [
        { name: 'Patients', count: stats.patients },
        { name: 'Doctors', count: stats.doctors },
        { name: 'Appointments', count: stats.appointments },
    ];

    return (
        <DashboardLayout title="Admin Dashboard">
            <Grid container spacing={3}>
                {/* Stats Cards */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard title="Total Patients" value={stats.patients} icon={<PeopleAltIcon fontSize="large" />} color="#2196f3" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard title="Total Doctors" value={stats.doctors} icon={<LocalHospitalIcon fontSize="large" />} color="#4caf50" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard title="Appointments" value={stats.appointments} icon={<EventNoteIcon fontSize="large" />} color="#ff9800" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard title="Revenue" value={`$${stats.revenue}`} icon={<AttachMoneyIcon fontSize="large" />} color="#f44336" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard title="Available Beds" value={stats.beds_available} icon={<LocalHospitalIcon fontSize="large" />} color="#00bcd4" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard title="Today's Admissions" value={stats.today_admissions} icon={<PeopleAltIcon fontSize="large" />} color="#9c27b0" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard title="Pending Lab Tests" value={stats.pending_tests} icon={<EventNoteIcon fontSize="large" />} color="#ff5722" />
                </Grid>

                {/* Charts */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 400, borderRadius: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography component="h2" variant="h6" color="primary">System Overview</Typography>
                            <Box>
                                <button onClick={() => window.location.href = 'http://localhost/Online_pharmacy/Backend/controllers/adminController.php?action=export_data&type=patients'} style={{ padding: '5px 10px', marginRight: '10px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Export Patients</button>
                                <button onClick={() => window.location.href = 'http://localhost/Online_pharmacy/Backend/controllers/adminController.php?action=export_data&type=logs'} style={{ padding: '5px 10px', backgroundColor: '#607d8b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Export Logs</button>
                            </Box>
                        </Box>
                        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#8884d8" radius={[5, 5, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* Notifications & Recent Activity */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 400, borderRadius: 2, mb: 3 }}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Typography component="h2" variant="h6" color="primary" sx={{ flexGrow: 1 }}>
                                System Notifications
                            </Typography>
                            <IconButton color="primary">
                                <Badge badgeContent={stats.alerts ? stats.alerts.length : 0} color="error">
                                    <NotificationsIcon />
                                </Badge>
                            </IconButton>
                        </Box>
                        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                            {stats.alerts && stats.alerts.length > 0 ? (
                                stats.alerts.map((alert, index) => (
                                    <Box key={index} sx={{ mb: 2, p: 1, borderLeft: '4px solid #f44336', bgcolor: '#ffebee' }}>
                                        <Typography variant="subtitle2" fontWeight="bold">{alert.alert_type || 'System Alert'}</Typography>
                                        <Typography variant="body2">{alert.description || 'No description'}</Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {alert.created_at ? new Date(alert.created_at).toLocaleString() : ''}
                                        </Typography>
                                    </Box>
                                ))
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <Typography color="textSecondary">No new system alerts</Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>

                    <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 400, borderRadius: 2 }}>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Recent Activity
                        </Typography>
                        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                            {stats.recent_activity && stats.recent_activity.length > 0 ? (
                                stats.recent_activity.map((log, index) => (
                                    <Box key={index} sx={{ mb: 2, p: 1, borderBottom: '1px solid #eee' }}>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {log.action} - {log.full_name} ({log.role})
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {log.details}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {new Date(log.created_at).toLocaleString()}
                                        </Typography>
                                    </Box>
                                ))
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <Typography color="textSecondary">No recent activity</Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </DashboardLayout>
    );
};

export default AdminDashboard;
