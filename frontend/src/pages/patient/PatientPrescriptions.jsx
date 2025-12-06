import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';

const PatientPrescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);

    useEffect(() => {
        const fetchPrescriptions = async () => {
            try {
                const response = await axios.get('http://localhost/Online_pharmacy/Backend/controllers/patientController.php?action=prescriptions', {
                    withCredentials: true
                });
                setPrescriptions(response.data);
            } catch (error) {
                console.error("Error fetching prescriptions", error);
            }
        };
        fetchPrescriptions();
    }, []);

    return (
        <DashboardLayout title="My Prescriptions">
            <Paper sx={{ p: 3 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Doctor</TableCell>
                                <TableCell>Medications</TableCell>
                                <TableCell>Instructions</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {prescriptions.length > 0 ? (
                                prescriptions.map((row) => (
                                    <TableRow key={row.prescription_id}>
                                        <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>Dr. {row.doctor_name}</TableCell>
                                        <TableCell>{row.medications}</TableCell>
                                        <TableCell>{row.instructions}</TableCell>
                                        <TableCell>
                                            <Chip label={row.status} color="primary" variant="outlined" size="small" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">No prescriptions found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </DashboardLayout>
    );
};

export default PatientPrescriptions;
