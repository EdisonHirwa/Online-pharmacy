import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Grid, Paper, Button, Box } from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';

// Icons
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import ScienceIcon from '@mui/icons-material/Science';

const DoctorOverview = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        patients: 0,
        appointments: 0,
        pendingReports: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch patients count
                const patientsRes = await axios.get('http://localhost/Online_pharmacy/Backend/controllers/doctorController.php?action=patients', { withCredentials: true });
                // Fetch schedule/appointments count
                const scheduleRes = await axios.get('http://localhost/Online_pharmacy/Backend/controllers/doctorController.php?action=schedule', { withCredentials: true });

                // We'll use the lengths of these arrays as proxy stats
                // Note: 'patients' endpoint returns an array of patients
                // 'schedule' endpoint returns { schedule: [...] }

                setStats({
                    patients: Array.isArray(patientsRes.data) ? patientsRes.data.length : 0,
                    appointments: scheduleRes.data.schedule ? scheduleRes.data.schedule.length : 0,
                    pendingReports: 0 // Placeholder as we don't have a count endpoint yet, or need to query lab orders 
                });
            } catch (error) {
                console.error("Error fetching overview stats", error);
            }
        };
        fetchStats();
    }, []);

    const widgets = [
        { title: 'Appointments Today', value: stats.appointments, icon: <CalendarTodayIcon fontSize="large" color="primary" />, link: '/doctor/schedule' },
        { title: 'My Patients', value: stats.patients, icon: <PeopleIcon fontSize="large" color="secondary" />, link: '/doctor/patients' },
        { title: 'Pending Lab Reports', value: stats.pendingReports, icon: <ScienceIcon fontSize="large" color="error" />, link: '/doctor/lab-orders' },
    ];

    return (
        <DashboardLayout title="Doctor Dashboard">
            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={3}>
                    {widgets.map((widget, index) => (
                        <Grid item xs={12} sm={4} key={index}>
                            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => navigate(widget.link)}>
                                {widget.icon}
                                <Typography variant="h4" sx={{ mt: 2 }}>{widget.value}</Typography>
                                <Typography variant="subtitle1" color="textSecondary">{widget.title}</Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                <Box sx={{ mt: 5 }}>
                    <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                    <Grid container spacing={2}>
                        <Grid item>
                            <Button variant="contained" color="primary" onClick={() => navigate('/doctor/schedule')}>Manage Schedule</Button>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" color="secondary" onClick={() => navigate('/doctor/prescriptions')}>Issue Prescription</Button>
                        </Grid>
                        <Grid item>
                            <Button variant="outlined" onClick={() => navigate('/doctor/lab-orders')}>Order Lab Test</Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </DashboardLayout>
    );
};

export default DoctorOverview;
