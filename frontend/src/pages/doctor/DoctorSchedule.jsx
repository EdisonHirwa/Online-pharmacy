import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper, Typography, Grid, Button, TextField, List, ListItem, ListItemText, IconButton, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DashboardLayout from '../../components/DashboardLayout';

const DoctorSchedule = () => {
    const [availability, setAvailability] = useState([]);
    const [newSlot, setNewSlot] = useState({ day: '', startTime: '', endTime: '' });

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const response = await axios.get('http://localhost/Online_pharmacy/Backend/controllers/doctorController.php?action=schedule', {
                withCredentials: true
            });
            if (response.data.schedule) {
                setAvailability(response.data.schedule);
            }
        } catch (error) {
            console.error("Error fetching schedule", error);
        }
    };

    const updateSchedule = async (newSchedule) => {
        try {
            await axios.post('http://localhost/Online_pharmacy/Backend/controllers/doctorController.php?action=update_schedule', {
                schedule: newSchedule
            }, {
                withCredentials: true
            });
            setAvailability(newSchedule);
        } catch (error) {
            console.error("Error updating schedule", error);
        }
    }

    const handleAddSlot = () => {
        if (!newSlot.day || !newSlot.startTime || !newSlot.endTime) return;

        const id = Date.now(); // Simple generic ID
        const updatedSchedule = [...availability, { ...newSlot, id }];
        updateSchedule(updatedSchedule);
        setNewSlot({ day: '', startTime: '', endTime: '' });
    };

    const handleDeleteSlot = (id) => {
        const updatedSchedule = availability.filter(slot => slot.id !== id);
        updateSchedule(updatedSchedule);
    };

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <DashboardLayout title="Manage Schedule">
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Add Availability</Typography>
                        <TextField
                            select
                            label="Day of Week"
                            fullWidth
                            margin="normal"
                            value={newSlot.day}
                            onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                        >
                            {daysOfWeek.map((day) => (
                                <MenuItem key={day} value={day}>{day}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Start Time"
                            type="time"
                            fullWidth
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                            value={newSlot.startTime}
                            onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                        />
                        <TextField
                            label="End Time"
                            type="time"
                            fullWidth
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                            value={newSlot.endTime}
                            onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                        />
                        <Button variant="contained" color="primary" onClick={handleAddSlot} sx={{ mt: 2 }}>
                            Add Slot
                        </Button>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Current Schedule</Typography>
                        <List>
                            {availability.length > 0 ? (
                                availability.map((slot) => (
                                    <ListItem
                                        key={slot.id}
                                        secondaryAction={
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteSlot(slot.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText
                                            primary={slot.day}
                                            secondary={`${slot.startTime} - ${slot.endTime}`}
                                        />
                                    </ListItem>
                                ))
                            ) : (
                                <Typography variant="body2" color="textSecondary">No availability set.</Typography>
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </DashboardLayout>
    );
};

export default DoctorSchedule;
