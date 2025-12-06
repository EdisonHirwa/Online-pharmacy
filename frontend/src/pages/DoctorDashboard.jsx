import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Grid, Paper, Typography, Box, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get('http://localhost/Online_pharmacy/Backend/controllers/doctorController.php?action=appointments', {
                withCredentials: true
            });
            setAppointments(response.data);
        } catch (error) {
            console.error("Error fetching appointments", error);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" gutterBottom>
                    Doctor Dashboard - Dr. {user?.name}
                </Typography>
                <Button variant="contained" color="secondary" onClick={handleLogout}>
                    Logout
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Upcoming Appointments
                        </Typography>
                        <List>
                            {appointments.map((apt, index) => (
                                <React.Fragment key={apt.appointment_id}>
                                    <ListItem alignItems="flex-start">
                                        <ListItemText
                                            primary={`Patient: ${apt.patient_name}`}
                                            secondary={
                                                <React.Fragment>
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        color="text.primary"
                                                    >
                                                        {new Date(apt.appointment_date).toLocaleString()}
                                                    </Typography>
                                                    {` - Status: ${apt.status}`}
                                                    <br />
                                                    {`Notes: ${apt.notes}`}
                                                </React.Fragment>
                                            }
                                        />
                                    </ListItem>
                                    {index < appointments.length - 1 && <Divider variant="inset" component="li" />}
                                </React.Fragment>
                            ))}
                            {appointments.length === 0 && (
                                <Typography variant="body1" sx={{ p: 2 }}>No appointments found.</Typography>
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default DoctorDashboard;
