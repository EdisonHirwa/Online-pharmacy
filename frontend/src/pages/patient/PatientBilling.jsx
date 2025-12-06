import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';

const PatientBilling = () => {
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await axios.get('http://localhost/Online_pharmacy/Backend/controllers/patientController.php?action=invoices', {
                    withCredentials: true
                });
                setInvoices(response.data);
            } catch (error) {
                console.error("Error fetching invoices", error);
            }
        };
        fetchInvoices();
    }, []);

    return (
        <DashboardLayout title="Billing & Payments">
            <Paper sx={{ p: 3 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {invoices.length > 0 ? (
                                invoices.map((row) => (
                                    <TableRow key={row.invoice_id}>
                                        <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>{row.description}</TableCell>
                                        <TableCell>${row.amount}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.status}
                                                color={row.status === 'paid' ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">No invoices found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </DashboardLayout>
    );
};

export default PatientBilling;
