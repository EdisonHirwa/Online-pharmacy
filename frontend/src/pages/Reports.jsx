import React from 'react';
import { Grid, Paper, Typography, Box, Button } from '@mui/material';
import DashboardLayout from '../components/DashboardLayout';
import GetAppIcon from '@mui/icons-material/GetApp';

const Reports = () => {
    const handleExport = (type) => {
        window.location.href = `http://localhost/Online_pharmacy/Backend/controllers/adminController.php?action=export_data&type=${type}`;
    };

    return (
        <DashboardLayout title="Reports">
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                            Available Reports
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                                        <Typography variant="subtitle1" fontWeight="bold">Patient Records</Typography>
                                        <Typography variant="body2" color="textSecondary" paragraph>
                                            Export a complete list of all registered patients, including their contact details and registration dates.
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            startIcon={<GetAppIcon />}
                                            onClick={() => handleExport('patients')}
                                        >
                                            Download CSV
                                        </Button>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                                        <Typography variant="subtitle1" fontWeight="bold">Audit Logs</Typography>
                                        <Typography variant="body2" color="textSecondary" paragraph>
                                            Export system activity logs for security auditing and compliance. Includes user actions, IPs, and timestamps.
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            startIcon={<GetAppIcon />}
                                            onClick={() => handleExport('logs')}
                                        >
                                            Download CSV
                                        </Button>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                                        <Typography variant="subtitle1" fontWeight="bold">Medical Records</Typography>
                                        <Typography variant="body2" color="textSecondary" paragraph>
                                            Export comprehensive medical records including patient history and prescriptions for referrals.
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            startIcon={<GetAppIcon />}
                                            onClick={() => handleExport('medical_records')}
                                        >
                                            Download CSV
                                        </Button>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </DashboardLayout>
    );
};

export default Reports;
