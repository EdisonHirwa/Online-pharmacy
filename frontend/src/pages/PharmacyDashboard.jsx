import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Grid, Paper, Typography, Box, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PharmacyDashboard = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            const response = await axios.get('http://localhost/Online_pharmacy/Backend/controllers/pharmacyController.php', {
                withCredentials: true
            });
            setPrescriptions(response.data);
        } catch (error) {
            console.error("Error fetching prescriptions", error);
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
                    Pharmacy Dashboard
                </Typography>
                <Button variant="contained" color="secondary" onClick={handleLogout}>
                    Logout
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Pending Prescriptions
                        </Typography>
                        <List>
                            {prescriptions.map((p, index) => (
                                <React.Fragment key={p.prescription_id}>
                                    <ListItem alignItems="flex-start" secondaryAction={
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            onClick={() => handleDispense(p.prescription_id)}
                                        >
                                            Dispense & Bill
                                        </Button>
                                    }>
                                        <ListItemText
                                            primary={`Medications: ${p.medications}`}
                                            secondary={`Patient: ${p.patient_name} | Doctor: ${p.doctor_name} | Instructions: ${p.instructions}`}
                                        />
                                    </ListItem>
                                    {index < prescriptions.length - 1 && <Divider variant="inset" component="li" />}
                                </React.Fragment>
                            ))}
                            {prescriptions.length === 0 && (
                                <Typography variant="body1" sx={{ p: 2 }}>No pending prescriptions found.</Typography>
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

const handleDispense = async (id) => {
    if (!window.confirm("Are you sure you want to dispense this prescription? This will generate a bill.")) return;
    try {
        await axios.post('http://localhost/Online_pharmacy/Backend/controllers/pharmacyController.php?action=dispense',
            { prescription_id: id },
            { withCredentials: true }
        );
        fetchPrescriptions();
    } catch (error) {
        console.error("Error dispensing", error);
        alert("Failed to dispense.");
    }
};

export default PharmacyDashboard;
