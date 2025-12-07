import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Grid, Paper, Typography, Box, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LabDashboard = () => {
    const [tests, setTests] = useState([]);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            const response = await axios.get('http://localhost/Online_pharmacy/Backend/controllers/labController.php', {
                withCredentials: true
            });
            setTests(response.data);
        } catch (error) {
            console.error("Error fetching tests", error);
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
                    Lab Technician Dashboard
                </Typography>
                <Button variant="contained" color="secondary" onClick={handleLogout}>
                    Logout
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Lab Test Requests
                        </Typography>
                        <List>
                            {tests.map((test, index) => (
                                <React.Fragment key={test.test_id}>
                                    <ListItem alignItems="flex-start" secondaryAction={
                                        test.status !== 'completed' && (
                                            <Button variant="contained" component="label" size="small">
                                                Upload Report
                                                <input type="file" hidden onChange={(e) => handleUpload(e, test.test_id)} />
                                            </Button>
                                        )
                                    }>
                                        <ListItemText
                                            primary={`Test: ${test.test_name}`}
                                            secondary={
                                                <React.Fragment>
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        color="text.primary"
                                                    >
                                                        {`Patient: ${test.patient_name} | Doctor: ${test.doctor_name}`}
                                                    </Typography>
                                                    {` - Status: ${test.status}`}
                                                    {test.report_path && <br />}
                                                    {test.report_path && <a href={test.report_path} target="_blank" rel="noopener noreferrer">View Report</a>}
                                                </React.Fragment>
                                            }
                                        />
                                    </ListItem>
                                    {index < tests.length - 1 && <Divider variant="inset" component="li" />}
                                </React.Fragment>
                            ))}
                            {tests.length === 0 && (
                                <Typography variant="body1" sx={{ p: 2 }}>No lab tests found.</Typography>
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid >
        </Container >
    );
};

// Add handleUpload function inside component
const handleUpload = async (e, testId) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('report', file);
    formData.append('test_id', testId);
    formData.append('status', 'completed');

    try {
        await axios.post('http://localhost/Online_pharmacy/Backend/controllers/labController.php?action=update_status', formData, {
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        fetchTests(); // Refresh list
    } catch (error) {
        console.error("Error uploading report", error);
    }
};

export default LabDashboard;
