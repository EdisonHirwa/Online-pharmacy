import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Paper, Typography, Box, Button, TextField, MenuItem, Alert } from '@mui/material';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const PatientDashboard = () => {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [date, setDate] = useState('');
    const [notes, setNotes] = useState('');
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success');
    const { user } = useAuth();

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await axios.get('http://localhost/Online_pharmacy/Backend/controllers/patientController.php?action=doctors', {
                withCredentials: true
            });
            setDoctors(response.data);
        } catch (error) {
            console.error("Error fetching doctors", error);
        }
    };

    const handleBook = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost/Online_pharmacy/Backend/controllers/patientController.php?action=book_appointment', {
                doctor_id: selectedDoctor,
                date: date,
                notes: notes
            }, {
                withCredentials: true
            });
            setMessage(response.data.message);
            setSeverity('success');
            setSelectedDoctor('');
            setDate('');
            setNotes('');
        } catch (error) {
            setMessage("Failed to book appointment.");
            setSeverity('error');
        }
    };

    return (
        <DashboardLayout title={`Welcome, ${user?.name}`}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                        <Typography component="h2" variant="h5" color="primary" gutterBottom fontWeight="bold">
                            Book an Appointment
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                            Select a doctor and schedule your visit.
                        </Typography>
                        <Box component="form" onSubmit={handleBook}>
                            <TextField
                                select
                                margin="normal"
                                required
                                fullWidth
                                label="Select Doctor"
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                            >
                                {doctors.map((doc) => (
                                    <MenuItem key={doc.doctor_id} value={doc.doctor_id}>
                                        {doc.full_name} - {doc.specialization}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                type="datetime-local"
                                label="Date & Time"
                                InputLabelProps={{ shrink: true }}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                            <TextField
                                margin="normal"
                                fullWidth
                                label="Notes"
                                multiline
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                sx={{ mt: 3, mb: 2, borderRadius: 2 }}
                            >
                                Book Appointment
                            </Button>
                            {message && <Alert severity={severity} sx={{ mt: 2 }}>{message}</Alert>}
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', borderRadius: 2, height: '100%' }}>
                        <Typography component="h2" variant="h5" color="primary" gutterBottom fontWeight="bold">
                            My Appointments
                        </Typography>
                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography color="textSecondary">No upcoming appointments</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </DashboardLayout>
    );
};

export default PatientDashboard;
