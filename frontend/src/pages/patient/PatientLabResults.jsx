import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button } from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import VisibilityIcon from '@mui/icons-material/Visibility';

const PatientLabResults = () => {
    const [labResults, setLabResults] = useState([]);

    useEffect(() => {
        const fetchLabResults = async () => {
            try {
                const response = await axios.get('http://localhost/Online_pharmacy/Backend/controllers/patientController.php?action=lab_results', {
                    withCredentials: true
                });
                setLabResults(response.data);
            } catch (error) {
                console.error("Error fetching lab results", error);
            }
        };
        fetchLabResults();
    }, []);

    return (
        <DashboardLayout title="Lab Results">
            <Paper sx={{ p: 3 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Test Name</TableCell>
                                <TableCell>Doctor</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Report</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {labResults.length > 0 ? (
                                labResults.map((row) => (
                                    <TableRow key={row.test_id}>
                                        <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>{row.test_name}</TableCell>
                                        <TableCell>Dr. {row.doctor_name}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.status}
                                                color={row.status === 'completed' ? 'success' : 'warning'}
                                                size="small"
                                            />
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
                                    <TableCell colSpan={5} align="center">No lab results found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </DashboardLayout>
    );
};

export default PatientLabResults;
