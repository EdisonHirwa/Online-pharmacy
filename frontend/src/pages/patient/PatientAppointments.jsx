import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';

const PatientAppointments = () => {
    const [appointments, setAppointments] = useState([]);

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
                                        <TableCell>{apt.doctor_name || 'Doctor'}</TableCell> {/* Ensure controller returns doctor_name joined */}
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
