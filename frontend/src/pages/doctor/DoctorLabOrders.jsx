import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper, Typography, Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Chip, MenuItem } from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box } from '@mui/material';

const DoctorLabOrders = () => {
    const [orders, setOrders] = useState([]);
    const [patients, setPatients] = useState([]);

    const [openOrderDialog, setOpenOrderDialog] = useState(false);
    const [orderData, setOrderData] = useState({ patient_id: '', testType: '', notes: '' });

    useEffect(() => {
        fetchOrders();
        fetchPatients();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://localhost/Online_pharmacy/Backend/controllers/doctorController.php?action=lab_orders', {
                withCredentials: true
            });
            setOrders(response.data);
        } catch (error) {
            console.error("Error fetching lab orders", error);
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await axios.get('http://localhost/Online_pharmacy/Backend/controllers/doctorController.php?action=patients', {
                withCredentials: true
            });
            setPatients(response.data);
        } catch (error) {
            console.error("Error fetching patients", error);
        }
    };

    const handleOrderTest = async () => {
        try {
            await axios.post('http://localhost/Online_pharmacy/Backend/controllers/doctorController.php?action=add_lab_order', {
                patient_id: orderData.patient_id,
                test_type: orderData.testType
            }, {
                withCredentials: true
            });
            fetchOrders();
            setOpenOrderDialog(false);
            setOrderData({ patient_id: '', testType: '', notes: '' });
        } catch (error) {
            console.log("Error ordering test", error);
            alert("Failed to order Lab Test.");
        }
    };

    return (
        <DashboardLayout title="Lab Orders">
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" onClick={() => setOpenOrderDialog(true)}>Order Lab Test</Button>
            </Box>
            <Paper sx={{ p: 3 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Patient</TableCell>
                                <TableCell>Test Type</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Report</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.length > 0 ? (
                                orders.map((row) => (
                                    <TableRow key={row.test_id}>
                                        <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>{row.patient_name}</TableCell>
                                        <TableCell>{row.test_name}</TableCell>
                                        <TableCell>
                                            <Chip label={row.status} color={row.status === 'completed' ? 'success' : 'warning'} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            {row.status === 'completed' && row.report_path ? (
                                                <Button startIcon={<VisibilityIcon />} size="small" href={row.report_path} target="_blank">
                                                    View
                                                </Button>
                                            ) : (
                                                <Typography variant="caption" color="textSecondary">Pending</Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">No lab orders found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={openOrderDialog} onClose={() => setOpenOrderDialog(false)}>
                <DialogTitle>Order Lab Test</DialogTitle>
                <DialogContent>
                    <TextField
                        select
                        margin="dense"
                        label="Patient"
                        fullWidth
                        value={orderData.patient_id}
                        onChange={(e) => setOrderData({ ...orderData, patient_id: e.target.value })}
                    >
                        {patients.map((p) => (
                            <MenuItem key={p.patient_id} value={p.patient_id}>{p.name}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        margin="dense"
                        label="Test Type"
                        fullWidth
                        value={orderData.testType}
                        onChange={(e) => setOrderData({ ...orderData, testType: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Clinical Notes"
                        fullWidth
                        multiline
                        rows={3}
                        value={orderData.notes}
                        onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenOrderDialog(false)}>Cancel</Button>
                    <Button onClick={handleOrderTest} variant="contained">Order Test</Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
};

export default DoctorLabOrders;
