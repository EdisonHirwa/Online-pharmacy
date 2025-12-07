import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Grid, Card, CardContent, CardActions, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Button, TextField } from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';

const PatientFindDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [bookDialog, setBookDialog] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [bookingData, setBookingData] = useState({ date: '', notes: '' });
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await axios.get('http://localhost/Online_pharmacy/Backend/controllers/patientController.php?action=doctors', {
                withCredentials: true
            });
            if (Array.isArray(response.data)) {
                setDoctors(response.data);
            } else {
                console.error("Invalid response format for doctors:", response.data);
                setDoctors([]);
            }
        } catch (error) {
            console.error("Error fetching doctors", error);
            setDoctors([]);
        }
    };

    const openBookDialog = (doctor) => {
        setSelectedDoctor(doctor);
        setBookDialog(true);
        setMessage({ text: '', type: '' });
    };

    const handleBook = async () => {
        try {
            const response = await axios.post('http://localhost/Online_pharmacy/Backend/controllers/patientController.php?action=book_appointment', {
                doctor_id: selectedDoctor.doctor_id,
                date: bookingData.date,
                notes: bookingData.notes
            }, {
                withCredentials: true
            });
            setMessage({ text: response.data.message, type: 'success' });
            setTimeout(() => {
                setBookDialog(false);
                setBookingData({ date: '', notes: '' });
            }, 2000);
        } catch (error) {
            setMessage({ text: "Failed to book appointment.", type: 'error' });
        }
    };

    return (
        <DashboardLayout title="Available Doctors">

            <Grid container spacing={3}>
                {doctors.length > 0 ? (
                    doctors.map((doc) => (
                        <Grid size={{ xs: 12, md: 4 }} key={doc.doctor_id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" component="div">
                                        Dr. {doc.full_name}
                                    </Typography>
                                    <Typography color="textSecondary" gutterBottom>
                                        {doc.specialization}
                                    </Typography>
                                    <Typography variant="body2">
                                        Department: {doc.department}<br />
                                        Fee: ${doc.consultation_fee}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" onClick={() => openBookDialog(doc)}>Book Appointment</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="body1" align="center">No doctors found matching filters.</Typography>
                    </Grid>
                )}
            </Grid>

            <Dialog open={bookDialog} onClose={() => setBookDialog(false)}>
                <DialogTitle>Book Appointment - Dr. {selectedDoctor?.full_name}</DialogTitle>
                <DialogContent>
                    {message.text && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}
                    <TextField
                        margin="dense"
                        label="Date & Time"
                        type="datetime-local"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={bookingData.date}
                        onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Reason / Notes"
                        fullWidth
                        multiline
                        rows={3}
                        value={bookingData.notes}
                        onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBookDialog(false)}>Cancel</Button>
                    <Button onClick={handleBook} variant="contained" disabled={!bookingData.date}>Confirm Booking</Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
};

export default PatientFindDoctors;
