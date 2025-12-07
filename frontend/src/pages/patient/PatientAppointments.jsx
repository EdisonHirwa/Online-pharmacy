import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, Box } from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';

const PatientAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await axios.get('http://localhost/Online_pharmacy/Backend/controllers/patientController.php?action=appointments', {
                    withCredentials: true
                });
                setAppointments(response.data);
            } catch (error) {
                console.error("Error fetching appointments", error);
            }
        };
        fetchAppointments();
    }, []);

    return (
        <DashboardLayout title="My Appointments">
            <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Appointment History</Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/patient/find-doctors')}
                    >
                        Book New Appointment
                    </Button>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Doctor</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Notes</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {appointments.length > 0 ? (
                                appointments.map((apt) => (
                                    <TableRow key={apt.appointment_id}>
                                        <TableCell>{new Date(apt.appointment_date).toLocaleString()}</TableCell>
                                        <TableCell>{apt.doctor_name || 'Doctor'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={apt.status}
                                                color={apt.status === 'confirmed' ? 'success' : apt.status === 'pending' ? 'warning' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{apt.notes}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">No appointments found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </DashboardLayout>
    );
};

export default PatientAppointments;
