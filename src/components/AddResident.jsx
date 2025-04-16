import React, { useState} from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import useSwalTheme from '../utils/useSwalTheme';
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
  Stack,
  Snackbar,
  Alert,
  TextField,
  Grid,
} from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from "dayjs";  // Import Dayjs for date formatting
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { API_URL,headername,keypoint } from '../utils/config';

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
    birthday: "",
    vote: "",
    sector: "",
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const SwalInstance = useSwalTheme();



  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

  const convertExcelDate = (serial) => {
    if (!serial || isNaN(serial)) return serial;
    const excelStartDate = new Date(Date.UTC(1899, 11, 30));
    const convertedDate = new Date(excelStartDate.getTime() + serial * 86400000);
    return convertedDate.toISOString().split("T")[0];
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      SwalInstance.fire({
        title: "File Selected",
        text: `You have selected: ${selectedFile.name}`,
        icon: "info",
        confirmButtonText: "OK",
      });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      SwalInstance.fire("Error", "Please select an Excel file first.", "error");
      return;
    }


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
      return;
    }


    const result = await SwalInstance.fire({
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

    SwalInstance.fire({
      title: 'Uploading...',
      text: 'Please wait while the file is being uploaded.',
      allowOutsideClick: false,
      didOpen: () => {
        SwalInstance.showLoading();
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
        const response = await axios.post(`${API_URL}/api/residents/bulk/create`, {

          residents: jsonData,
        }, {
          headers: {
            [headername]:keypoint,
          },
        }
        );
        SwalInstance.fire("Success", response.data, "success");
      } catch (error) {
        console.error("Error uploading residents:", error);
        SwalInstance.fire("Error", "Error uploading residents.", "error");
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      SwalInstance.fire("Error", "Failed to read the file.", "error");
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleUpdate = async () => {
    if (!file) {
      SwalInstance.fire("Error", "Please select an Excel file first.", "error");
      return;
    }
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
      return;
    }

    const result = await SwalInstance.fire({
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

    SwalInstance.fire({
      title: 'Updating...',
      text: 'Please wait while the file is being updated.',
      allowOutsideClick: false,
      didOpen: () => {
        SwalInstance.showLoading();
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
        await axios.put(`${API_URL}/api/residents/bulk/update`, {
          residents: jsonData, },{
         
            headers: {
              [headername]:keypoint
      }});

        SwalInstance.fire("Success", "Update successful!", "success");
      } catch (error) {
        console.error("Error updating residents:", error);
        SwalInstance.fire("Error", "Error updating residents.", "error");
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      SwalInstance.fire("Error", "Failed to read the file.", "error");
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleChange = (e) => {
    setResident({ ...resident, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      return;
    }

    const result = await SwalInstance.fire({
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
      const response = await axios.post(`${API_URL}/api/residents/create`, resident, {
        headers: {
         [headername]:keypoint
        },
      });
      SwalInstance.fire("Success", response.data, "success");
    } catch (error) {
      console.error("Error adding resident:", error);
      SwalInstance.fire("Error", "Failed to add resident.", "error");
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
              <TextField
                fullWidth
                label="First Name"
                name="first_name"
                value={resident.first_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Middle Name"
                name="middle_name"
                value={resident.middle_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="last_name"
                value={resident.last_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Extension Name (Jr, Sr, etc.)"
                name="extension_name"
                value={resident.extension_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                name="age"
                value={resident.age}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Purok</InputLabel>
                <Select
                  name="address"
                  value={resident.address}
                  onChange={handleChange}
                >
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
                <Select
                  name="sex"
                  value={resident.sex}
                  onChange={handleChange}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Marital Status</InputLabel>
                <Select
                  name="status"
                  value={resident.status}
                  onChange={handleChange}
                >
                  <MenuItem value="Single">Single</MenuItem>
                  <MenuItem value="Married">Married</MenuItem>
                  <MenuItem value="Widowed">Widowed</MenuItem>
                  <MenuItem value="Divorced">Divorced</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Birthplace"
                name="birthplace"
                value={resident.birthplace}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Birthday"
                  name="birthday"
                  value={resident.birthday ? dayjs(resident.birthday) : null}
                  onChange={(newValue) => handleChange({ target: { name: 'birthday', value: newValue ? newValue.format("YYYY-MM-DD") : '' } })}
                  format="YYYY-MM-DD"
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Grid>

           <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vulnerable Sector"
                name="sector"
                value={resident.sector}
                onChange={handleChange}
                required 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Voting Status</InputLabel>
                <Select
                  name="vote"
                  value={resident.vote}
                  onChange={handleChange}
                >
                  <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                  <MenuItem value="NOT ACTIVE">NOT ACTIVE</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Create Resident"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: "center", borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          Upload Residents Excel File
        </Typography>

        <Stack direction="column" alignItems="center" spacing={2}>
          {/* Upload Button */}
          <Button
            component="label"
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            sx={{
              px: 3, py: 1.5,
              fontSize: "1rem",
              borderRadius: "25px",
              textTransform: "none",
              transition: "0.3s",
              '&:hover': { backgroundColor: '#1565c0' },
            }}
          >
            Upload File
            <VisuallyHiddenInput type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
          </Button>

          {/* Upload Actions */}
          <Stack direction="row" spacing={2}>
            <Button
              onClick={handleUpload}
              disabled={loading}
              variant="contained"
              color="success"
              sx={{ borderRadius: "20px", px: 3 }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Upload & Insert"}
            </Button>

            <Button
              onClick={handleUpdate}
              disabled={loading}
              variant="contained"
              color="secondary"
              sx={{ borderRadius: "20px", px: 3 }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Upload & Update"}
            </Button>
          </Stack>
        </Stack>
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
