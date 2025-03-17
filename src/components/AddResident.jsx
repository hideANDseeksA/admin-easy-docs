import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";

const CreateResident = () => {
  const [resident, setResident] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    extension_name: "",
    age: "",
    address: "",
    sex: "",
    status: "",
    birthplace: "",
    birthday: ""
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const convertExcelDate = (serial) => {
    if (!serial || isNaN(serial)) return serial;
    const excelStartDate = new Date(Date.UTC(1899, 11, 30));
    const convertedDate = new Date(excelStartDate.getTime() + serial * 86400000);
    return convertedDate.toISOString().split("T")[0];
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      Swal.fire("Error", "Please select an Excel file first.", "error");
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to upload this file?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, upload it!',
      cancelButtonText: 'No, cancel!'
    });

    if (!result.isConfirmed) {
      return;
    }

    Swal.fire({
      title: 'Uploading...',
      text: 'Please wait while the file is being uploaded.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        let jsonData = XLSX.utils.sheet_to_json(sheet);

        jsonData = jsonData.map((resident) => ({
          ...resident,
          birthday: convertExcelDate(resident.birthday),
        }));
        
        console.log("Parsed Data:", jsonData);
        const response = await axios.post("https://bned-backend.onrender.com/api/create_residents", {
          residents: jsonData,
        });
        Swal.fire("Success", response.data, "success");
      } catch (error) {
        console.error("Error uploading residents:", error);
        Swal.fire("Error", "Error uploading residents.", "error");
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      Swal.fire("Error", "Failed to read the file.", "error");
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleUpdate = async () => {
    if (!file) {
      Swal.fire("Error", "Please select an Excel file first.", "error");
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to update with this file?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, update it!',
      cancelButtonText: 'No, cancel!'
    });

    if (!result.isConfirmed) {
      return;
    }

    Swal.fire({
      title: 'Updating...',
      text: 'Please wait while the file is being updated.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        let jsonData = XLSX.utils.sheet_to_json(sheet);

        jsonData = jsonData.map((resident) => ({
          ...resident,
          birthday: convertExcelDate(resident.birthday),
        }));

        console.log("Parsed Data:", jsonData);
        await axios.put("https://bned-backend.onrender.com/api/update_residents", {
          residents: jsonData,
        });

        Swal.fire("Success", "Update successful!", "success");
      } catch (error) {
        console.error("Error updating residents:", error);
        Swal.fire("Error", "Error updating residents.", "error");
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      Swal.fire("Error", "Failed to read the file.", "error");
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleChange = (e) => {
    setResident({ ...resident, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to create this resident?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, create it!',
      cancelButtonText: 'No, cancel!'
    });

    if (!result.isConfirmed) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("https://bned-backend.onrender.com/api/create_resident", resident);
      Swal.fire("Success", response.data, "success");
    } catch (error) {
      console.error("Error adding resident:", error);
      Swal.fire("Error", "Failed to add resident.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Create Resident</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <label>Middle Name</label>
              <input
                type="text"
                name="middle_name"
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <label>Extension Name</label>
              <input
                type="text"
                name="extension_name"
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <label>Age</label>
              <input
                type="number"
                name="age"
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              {/* <label>Address</label>
              <input
                type="text"
                name="address"
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              /> */}
                   <FormControl fullWidth>
                <InputLabel>Purok</InputLabel>
                <Select
                  name="address"
                  value={resident.address}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="P-1">Purok 1</MenuItem>
                  <MenuItem value="P-2">Purok 2</MenuItem>
                  <MenuItem value="P-3">Purok 3</MenuItem>
                  <MenuItem value="P-4">Purok 4</MenuItem>
                  <MenuItem value="P-5">Purok 5</MenuItem>
                  <MenuItem value="P-6">Purok 6</MenuItem>
            
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
             
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="sex"
                  value={resident.sex}
                  onChange={handleChange}
                  required
                >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Marital Status</InputLabel>
                <Select
                  name="status"
                  value={resident.status}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="Single">Single</MenuItem>
                  <MenuItem value="Married">Married</MenuItem>
                  <MenuItem value="Widowed">Widowed</MenuItem>
                  <MenuItem value="Divorced">Divorced</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <label>Birthplace</label>
              <input
                type="text"
                name="birthplace"
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <label>Birthday</label>
              <input
                type="date"
                name="birthday"
                value={resident.birthday}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth height="100px">
                Create Resident
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: "center" }}>
        <Typography variant="h6">Upload Residents Excel File</Typography>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} style={{ margin: "20px 0" }} />
        <Button onClick={handleUpload} disabled={loading} variant="contained" color="secondary">
          {loading ? <CircularProgress size={24} /> : "Upload & Insert"}
        </Button>
        <Button onClick={handleUpdate} disabled={loading} variant="contained" color="secondary" sx={{ ml: 2 }}>
          {loading ? <CircularProgress size={24} /> : "Upload & Update"}
        </Button>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateResident;
