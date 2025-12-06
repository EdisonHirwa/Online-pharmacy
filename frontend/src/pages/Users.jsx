import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Paper, Typography, Box, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Grid } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DashboardLayout from '../components/DashboardLayout';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Dialog State
    const [open, setOpen] = useState(false);
    const [viewMode, setViewMode] = useState(false); // New state for View mode
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        role: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost/Online_pharmacy/Backend/controllers/adminController.php?action=users', {
                withCredentials: true
            });
            // Add unique id for DataGrid if not present or map user_id to id
            const dataWithId = response.data.map(user => ({ ...user, id: user.user_id }));
            setUsers(dataWithId);
        } catch (error) {
            console.error("Error fetching users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.post('http://localhost/Online_pharmacy/Backend/controllers/adminController.php?action=delete_user', { user_id: id }, { withCredentials: true });
                fetchUsers();
            } catch (error) {
                console.error("Error deleting user", error);
            }
        }
    };

    const handleEditClick = (user) => {
        setCurrentUser(user);
        setViewMode(false);
        setFormData({
            full_name: user.full_name,
            email: user.email,
            role: user.role
        });
        setOpen(true);
    };

    const handleViewClick = (user) => {
        setCurrentUser(user);
        setViewMode(true);
        setFormData({
            full_name: user.full_name,
            email: user.email,
            role: user.role
        });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentUser(null);
        setViewMode(false);
    };

    const handleSave = async () => {
        try {
            await axios.post('http://localhost/Online_pharmacy/Backend/controllers/adminController.php?action=update_user', {
                user_id: currentUser.user_id,
                ...formData
            }, { withCredentials: true });
            setOpen(false);
            fetchUsers();
        } catch (error) {
            console.error("Error updating user", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const columns = [
        { field: 'user_id', headerName: 'ID', width: 70 },
        { field: 'full_name', headerName: 'Full Name', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1 },
        { 
            field: 'role', 
            headerName: 'Role', 
            width: 150,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={params.value === 'admin' ? 'secondary' : 'primary'}
                    size="small"
                    variant="outlined"
                />
            )
        },
        { 
            field: 'created_at', 
            headerName: 'Joined Date', 
            width: 180,
            valueFormatter: (params) => new Date(params.value).toLocaleDateString()
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            sortable: false,
            disableClickEventBubbling: true,
            renderCell: (params) => {
                return (
                    <Box>
                        <IconButton color="info" size="small" onClick={() => handleViewClick(params.row)}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton color="primary" size="small" onClick={() => handleEditClick(params.row)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton color="error" size="small" onClick={() => handleDelete(params.row.user_id)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                );
            }
        }
    ];

    return (
        <DashboardLayout title="User Management">
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 600, width: '100%' }}>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            All Users
                        </Typography>
                        <DataGrid
                            rows={users}
                            columns={columns}
                            loading={loading}
                            pageSize={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            checkboxSelection
                            disableSelectionOnClick
                            components={{ Toolbar: GridToolbar }}
                            initialState={{
                                pagination: {
                                    paginationModel: { pageSize: 10, page: 0 },
                                },
                            }}
                        />
                    </Paper>
                </Grid>
            </Grid>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{viewMode ? 'View User' : 'Edit User'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus={!viewMode}
                        margin="dense"
                        name="full_name"
                        label="Full Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={formData.full_name}
                        onChange={handleChange}
                        disabled={viewMode}
                    />
                    <TextField
                        margin="dense"
                        name="email"
                        label="Email"
                        type="email"
                        fullWidth
                        variant="standard"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={viewMode}
                    />
                    <TextField
                        select={!viewMode}
                        margin="dense"
                        name="role"
                        label="Role"
                        fullWidth
                        variant="standard"
                        value={formData.role}
                        onChange={handleChange}
                        disabled={viewMode}
                    >
                        {!viewMode && [
                            <MenuItem key="admin" value="admin">Admin</MenuItem>,
                            <MenuItem key="doctor" value="doctor">Doctor</MenuItem>,
                            <MenuItem key="patient" value="patient">Patient</MenuItem>,
                            <MenuItem key="pharmacist" value="pharmacist">Pharmacist</MenuItem>,
                            <MenuItem key="lab" value="lab_technician">Lab Technician</MenuItem>
                        ]}
                        {viewMode && (
                            <MenuItem value={formData.role}>{formData.role}</MenuItem>
                        )}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                    {!viewMode && <Button onClick={handleSave}>Save</Button>}
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
};

export default Users;
