import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper, Typography, Grid, Box, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const PatientOverview = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [unpaidBills, setUnpaidBills] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Use optimized metrics endpoint
            const metricsRes = await axios.get(
                'http://localhost/Online_pharmacy/Backend/controllers/patientController.php?action=metrics',
                { withCredentials: true }
            );

            setAppointments([{ count: metricsRes.data.upcoming_appointments }]); // Mock structure for widget display
            setPrescriptions(Array(metricsRes.data.active_prescriptions).fill({})); // Mock for length
            setUnpaidBills(metricsRes.data.unpaid_invoices || 0);
        } catch (error) {
            console.error("Error fetching patient data", error);
        }
    };

    const widgets = [
        { title: 'Upcoming Appointments', value: appointments[0]?.count || 0, icon: <CalendarTodayIcon fontSize="large" color="primary" />, link: '/patient/appointments' },
        { title: 'Prescriptions', value: prescriptions.length, icon: <MedicalServicesIcon fontSize="large" color="secondary" />, link: '/patient/prescriptions' },
        { title: 'Unpaid Bills', value: unpaidBills, icon: <ReceiptLongIcon fontSize="large" color="error" />, link: '/patient/billing' },
    ];

    return (
        <DashboardLayout title={`Welcome, ${user?.name || 'Patient'}`}>
            <Grid container spacing={3}>
                {widgets.map((widget, index) => (
                    <Grid item xs={12} md={4} key={index}>
                        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => navigate(widget.link)}>
                            {widget.icon}
                            <Typography variant="h4" sx={{ mt: 2 }}>{widget.value}</Typography>
                            <Typography variant="subtitle1" color="textSecondary">{widget.title}</Typography>
                        </Paper>
                    </Grid>
                ))}

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Find a Doctor</Typography>
                        <Typography variant="body2" paragraph>
                            Search for specialists and book your next consultation.
                        </Typography>
                        <Button variant="contained" color="primary" onClick={() => navigate('/patient/find-doctors')}>
                            Search Doctors
                        </Button>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>My Health Records</Typography>
                        <Typography variant="body2" paragraph>
                            View your lab results and medical history.
                        </Typography>
                        <Button variant="outlined" color="primary" onClick={() => navigate('/patient/lab-results')}>
                            View Lab Results
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </DashboardLayout>
    );
};

export default PatientOverview;
