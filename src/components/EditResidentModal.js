import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import Swal from "sweetalert2";
import axios from "axios";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from "dayjs";  // Import Dayjs for date formatting

const EditResidentDialog = ({ open, handleClose, resident, fetchResidents }) => {
    const defaultResident = {
        first_name: "",
        middle_name: "",
        last_name: "",
        extension_name: "",
        age: "",
        address: "",
        sex: "",
        status: "",
        birthplace: "",
        birthday: null,  // Ensure correct initial format
    };

    const [formValues, setFormValues] = useState(defaultResident);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        handleClose();

        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Do you want to update this resident's details?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, update it!",
        });

        if (result.isConfirmed) {
            Swal.fire({
                title: "Updating...",
                text: "Please wait while updating resident details.",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            try {
                await axios.put(
                    `https://bned-backend.onrender.com/api/update_resident/${resident.resident_id}`,
                    formValues
                );
                fetchResidents();
                Swal.fire("Updated!", "Resident details have been updated.", "success");
            } catch (error) {
                console.error("Error updating resident:", error);
                Swal.fire("Error!", "Failed to update resident.", "error");
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
                            <TextField fullWidth label="Age" type="number" name="age" value={formValues.age} onChange={handleChange} required />
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
                                    <MenuItem value="M">Male</MenuItem>
                                    <MenuItem value="F">Female</MenuItem>
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
