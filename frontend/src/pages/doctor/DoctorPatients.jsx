import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper, Typography, Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';

const DoctorPatients = () => {
    const [patients, setPatients] = useState([]);
    const [openConsultation, setOpenConsultation] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [consultationNotes, setConsultationNotes] = useState('');

    useEffect(() => {
        fetchPatients();
    }, []);

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

    const handleOpenConsultation = (patient) => {
        setSelectedPatient(patient);
        // Notes would ideally be fetched per appointment, but for this view we might be issuing general notes or need to select an appointment context.
        // For simplicity, we are adding notes to the latest appointment or just a general log if the backend supports it.
        // The backend endpoint 'add_consultation_notes' requires an 'appointment_id'.
        // Since this view is 'My Patients', and not 'My Appointments', we might need to fetch the patient's latest appointment or create a new one.
        // However, let's assume for now we are adding notes to their *latest* visit.
        // Ideally, we should list appointments for the patient and add notes to a specific one.

        // A better UX might be: Click Consult -> Show list of recent appointments -> Select one -> Add Notes.
        // Or simply: Click Consult -> Create NEW record/appointment (not implemented in backend yet for doctor to create appointment).

        // Given complexity, let's just open the dialog. We likely need an appointment ID.
        // Let's modify the flow: "View Appointments" instead of just "Consult".
        setOpenConsultation(true);
    };

    const handleSaveConsultation = async () => {
        // Logic to save notes. 
        // NOTE: The backend expects `appointment_id`. 
        // Since we don't have it readily available in this "Patient List" view (which aggregates by patient),
        // we might need to adjust this page to show "Recent Appointments" instead of just "Patients".
        // OR, we just log it to the console for now as "Feature Pending" until we Link it to a specific appointment.

        console.log("Saving notes for", selectedPatient.name, consultationNotes);
        alert("To save notes, please go to the 'Overview' or 'Schedule' page and select a specific appointment.");

        setOpenConsultation(false);
        setConsultationNotes('');
    };

    return (
        <DashboardLayout title="My Patients">
            <Paper sx={{ p: 3 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Last Visit</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {patients.length > 0 ? (
                                patients.map((row) => (
                                    <TableRow key={row.patient_id}>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>{row.last_visit}</TableCell>
                                        <TableCell>
                                            <Button variant="contained" size="small" onClick={() => handleOpenConsultation(row)}>
                                                Consult
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">No patients found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={openConsultation} onClose={() => setOpenConsultation(false)} fullWidth maxWidth="md">
                <DialogTitle>Consultation - {selectedPatient?.name}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Note: To add consultation notes for a specific visit, please access via the Appointment list.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="notes"
                        label="General Notes (Local Only)"
                        type="text"
                        fullWidth
                        multiline
                        rows={6}
                        variant="outlined"
                        value={consultationNotes}
                        onChange={(e) => setConsultationNotes(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConsultation(false)}>Cancel</Button>
                    <Button onClick={handleSaveConsultation} variant="contained">Save Notes</Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
};

export default DoctorPatients;
