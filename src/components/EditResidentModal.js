import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import axios from "axios";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import useSwalTheme from '../utils/useSwalTheme';
import dayjs from "dayjs";  // Import Dayjs for date formatting
import { API_URL,headername,keypoint } from '../utils/config';

const EditResidentDialog = ({ open, handleClose, resident, fetchResidents }) => {
    const defaultResident = {
        first_name: "",
        middle_name: "",
        last_name: "",
        extension_name: "",
        age: "",
        address: "",
        sex: "",
        birthplace: "",
        birthday: null,
        vote: "",
        vulnerable_status: "",
        
    };

    const [formValues, setFormValues] = useState(defaultResident);
    const SwalInstance = useSwalTheme();

    useEffect(() => {
        if (resident) {
            setFormValues({
                ...resident,
                birthday: resident.birthday ? dayjs(resident.birthday) : null  // Convert string to Dayjs
            });
        } 
    }, [resident]);

    const handleChange = (e) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.value });
    };

    const handleDateChange = (date) => {
        setFormValues({ ...formValues, birthday: date ? dayjs(date).format("YYYY-MM-DD") : "" });
    };
    const checkInternet = () => {
        if (!navigator.onLine) {
          SwalInstance.fire({
            icon: 'error',
            title: 'No Internet',
            text: 'You are currently offline. Please check your connection.',
            toast: true,
            timer: 3000,
            position: 'top-end',
            showConfirmButton: false,
          });
          return false;
        }
        return true;
      };
    

    const handleSubmit = async (e) => {
        if (!checkInternet()) return;
        e.preventDefault();
        handleClose();
       
        const result = await SwalInstance.fire({
            title: "Are you sure?",
            text: "Do you want to update this resident's details?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, update it!",
        });

        if (result.isConfirmed) {
            SwalInstance.fire({
                title: "Updating...",
                text: "Please wait while updating resident details.",
                allowOutsideClick: false,
                didOpen: () => SwalInstance.showLoading(),
            });

            try {
                await axios.put(
                    `${API_URL}/api/residents/update/${resident.resident_id}`,
                    formValues,{
                        headers:{
                            [headername]:keypoint
                        }
                    }
                );
                fetchResidents();
                SwalInstance.fire("Updated!", "Resident details have been updated.", "success");
            } catch (error) {
                console.error("Error updating resident:", error);
                SwalInstance.fire("Error!", "Failed to update resident.", "error");
            }
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Resident</DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="First Name" name="first_name" value={formValues.first_name} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Middle Name" name="middle_name" value={formValues.middle_name} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Last Name" name="last_name" value={formValues.last_name} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Extension Name (Jr, Sr, etc.)" name="extension_name" value={formValues.extension_name} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Age"
                                type="number"
                                name="age"
                                value={formValues.age}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || (value.length <= 3 && parseInt(value) <= 200)) {
                                        handleChange(e);
                                    }
                                }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Purok</InputLabel>
                                <Select name="address" value={formValues.address} onChange={handleChange}>
                                    <MenuItem value="P-1">Purok 1</MenuItem>
                                    <MenuItem value="P-2">Purok 2</MenuItem>
                                    <MenuItem value="P-3">Purok 3</MenuItem>
                                    <MenuItem value="P-4">Purok 4</MenuItem>
                                    <MenuItem value="P-5">Purok 5</MenuItem>
                                    <MenuItem value="P-6 A">Purok 6-A</MenuItem>
                                    <MenuItem value="P-6 B">Purok 6-B</MenuItem>
                                    <MenuItem value="P-7 A">Purok 7-A</MenuItem>
                                    <MenuItem value="P-7 B">Purok 7-B</MenuItem>
                                    <MenuItem value="P-8 A">Purok 8-A</MenuItem>
                                    <MenuItem value="P-8 B">Purok 8-B</MenuItem>
                                    <MenuItem value="P-9">Purok 9</MenuItem>
                                    <MenuItem value="P-10">Purok 10</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Gender</InputLabel>
                                <Select name="sex" value={formValues.sex} onChange={handleChange}>
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Marital Status</InputLabel>
                                <Select name="status" value={formValues.status} onChange={handleChange}>
                                    <MenuItem value="Single">Single</MenuItem>
                                    <MenuItem value="Married">Married</MenuItem>
                                    <MenuItem value="Widowed">Widowed</MenuItem>
                                    <MenuItem value="Divorced">Divorced</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Birthplace" name="birthplace" value={formValues.birthplace} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Birthday"
                                    name="birthday"
                                    value={formValues.birthday ? dayjs(formValues.birthday) : null}
                                    onChange={handleDateChange}
                                    format="YYYY-MM-DD"
                                    slotProps={{ textField: { fullWidth: true, required: true } }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Vulnerable Sector"
                                name="vulnerable_status"
                                value={formValues.vulnerable_status}
                                onChange={handleChange}
                                required
                            />
                            
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Voting Status</InputLabel>
                                <Select
                                    name="vote"
                                    value={formValues.vote}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                                    <MenuItem value="NOT ACTIVE">NOT ACTIVE</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary" variant="contained">Cancel</Button>
                <Button onClick={handleSubmit} color="primary" variant="contained">Update Resident</Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditResidentDialog;
