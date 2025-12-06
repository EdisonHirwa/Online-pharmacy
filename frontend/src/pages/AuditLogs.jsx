import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, TextField, Box, InputAdornment, TableSortLabel, TablePagination } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DashboardLayout from '../components/DashboardLayout';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        fetchLogs();
    }, []);

    useEffect(() => {
        handleSearchAndSort();
    }, [logs, searchTerm, sortConfig]);

    const fetchLogs = async () => {
        try {
            const response = await axios.get('http://localhost/Online_pharmacy/Backend/controllers/adminController.php?action=audit_logs&limit=500', {
                withCredentials: true
            });
            setLogs(response.data);
        } catch (error) {
            console.error("Error fetching logs", error);
        }
    };

    const handleSearchAndSort = () => {
        let tempLogs = [...logs];

        // Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            tempLogs = tempLogs.filter(log =>
                (log.full_name && log.full_name.toLowerCase().includes(lowerTerm)) ||
                log.action.toLowerCase().includes(lowerTerm) ||
                log.details.toLowerCase().includes(lowerTerm)
            );
        }

        // Sort
        if (sortConfig.key) {
            tempLogs.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        setFilteredLogs(tempLogs);
        setPage(0); // Reset to first page
    };

    const handleSortRequest = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <DashboardLayout title="Audit Logs">
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" color="primary">
                                System Audit Logs
                            </Typography>
                            <TextField
                                variant="outlined"
                                size="small"
                                placeholder="Search logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                        <TableContainer component={Paper} elevation={0} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <TableSortLabel
                                                active={sortConfig.key === 'created_at'}
                                                direction={sortConfig.direction}
                                                onClick={() => handleSortRequest('created_at')}
                                            >
                                                Time
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={sortConfig.key === 'full_name'}
                                                direction={sortConfig.direction}
                                                onClick={() => handleSortRequest('full_name')}
                                            >
                                                User
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={sortConfig.key === 'action'}
                                                direction={sortConfig.direction}
                                                onClick={() => handleSortRequest('action')}
                                            >
                                                Action
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>Details</TableCell>
                                        <TableCell>IP Address</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredLogs
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((log) => (
                                            <TableRow key={log.log_id}>
                                                <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="bold">{log.full_name || 'System'}</Typography>
                                                    <Typography variant="caption" color="textSecondary">{log.role}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={log.action}
                                                        color={log.action.includes('LOGIN') ? 'primary' : log.action.includes('ALERT') ? 'error' : 'default'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>{log.details}</TableCell>
                                                <TableCell>{log.ip_address}</TableCell>
                                            </TableRow>
                                        ))}
                                    {filteredLogs.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">No logs found</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50]}
                            component="div"
                            count={filteredLogs.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </DashboardLayout>
    );
};

export default AuditLogs;
