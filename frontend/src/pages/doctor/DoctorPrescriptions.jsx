import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper, Typography, Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, TextField, DialogActions, MenuItem } from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';

const DoctorPrescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]); // Needed for issuing prescription

    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({ patient_id: '', medication: '', dosage: '', instructions: '' });

    useEffect(() => {
        fetchPrescriptions();
        fetchPatients();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            const response = await axios.get('http://localhost/Online_pharmacy/Backend/controllers/doctorController.php?action=prescriptions', {
                withCredentials: true
            });
            setPrescriptions(response.data);
        } catch (error) {
            console.error("Error fetching prescriptions", error);
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

    const handleIssuePrescription = async () => {
        try {
            await axios.post('http://localhost/Online_pharmacy/Backend/controllers/doctorController.php?action=add_prescription', {
                patient_id: formData.patient_id,
                medications: `${formData.medication} ${formData.dosage}`,
                instructions: formData.instructions
            }, {
                withCredentials: true
            });
            fetchPrescriptions();
            setOpenDialog(false);
            setFormData({ patient_id: '', medication: '', dosage: '', instructions: '' });
        } catch (error) {
            console.log("Error adding prescription", error);
            alert("Failed to issue prescription.");
        }
    };

    return (
        <DashboardLayout title="Prescriptions">
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" onClick={() => setOpenDialog(true)}>Issue Prescription</Button>
            </Box>
            <Paper sx={{ p: 3 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Patient</TableCell>
                                <TableCell>Medication/Dosage</TableCell>
                                <TableCell>Instructions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {prescriptions.length > 0 ? (
                                prescriptions.map((row) => (
                                    <TableRow key={row.prescription_id}>
                                        <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>{row.patient_name}</TableCell>
                                        <TableCell>{row.medications}</TableCell>
                                        <TableCell>{row.instructions}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">No prescriptions record found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Issue New Prescription</DialogTitle>
                <DialogContent>
                    <TextField
                        select
                        margin="dense"
                        label="Patient"
                        fullWidth
                        value={formData.patient_id}
                        onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                    >
                        {patients.map((p) => (
                            <MenuItem key={p.patient_id} value={p.patient_id}>{p.name}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        margin="dense"
                        label="Medication"
                        fullWidth
                        value={formData.medication}
                        onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Dosage"
                        fullWidth
                        value={formData.dosage}
                        onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Instructions"
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.instructions}
                        onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleIssuePrescription} variant="contained">Issue</Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
};
import { Box } from '@mui/material';

export default DoctorPrescriptions;
