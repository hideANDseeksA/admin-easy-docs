import React, { useEffect, useState } from "react";
import axios from "axios";
import useSwalTheme from '../utils/useSwalTheme';
import * as XLSX from "xlsx"; // Import XLSX
import EditResidentModal from "./EditResidentModal";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import decrypt from '../utils/aes';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import HomeIcon from '@mui/icons-material/Diversity3';
import { API_URL,headername,keypoint } from '../utils/config';
import { FaUsers, FaMale, FaFemale } from "react-icons/fa";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Box,
  Button,
  MenuItem,
  Select,
  InputLabel,
  IconButton,
  FormControl,
} from "@mui/material";
import { makeStyles } from '@mui/styles';
import { DataGrid } from '@mui/x-data-grid'; // Import DataGrid

const useStyles = makeStyles({
  tableContainer: {
    maxHeight: '450px',
    overflow: 'auto',
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f1f1',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#888',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: '#555',
    },
  },
  tableHead: {
    backgroundColor: '#f5f5f5',
    '& th': {
      fontWeight: 'bold',
      color: '#333',
    },
  },
  tableRow: {
    '&:nth-of-type(odd)': {
      backgroundColor: '#f9f9f9',
    },
    '&:hover': {
      backgroundColor: '#e0f7fa',
    },
  },
  tableCell: {
    textAlign: 'center',
  },
  residentListActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px', // 2 * 8px
    marginBottom: '16px', // 2 * 8px
  },
  filterControl: {
    flex: 1,
    height: '55px',
  },
  searchField: {
    flex: 5,
    height: '55px',
  },
  downloadButton: {
    height: '55px',
  },
});

const ResidentList = () => {
  const [residents, setResidents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [sex, setSex] = useState("");
  const [purok, setPurok] = useState("");
  const SwalInstance = useSwalTheme();
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


  const fetchResidents = async () => {
    SwalInstance.fire({
      title: "Loading...",
      text: "Fetching residents, please wait.",
      allowOutsideClick: false,
      didOpen: () => {
        SwalInstance.showLoading();
      },
    });

    try {
      const response = await axios.get(`${API_URL}/api/residents/get`, {
        headers: {
          [headername]:keypoint
        },
      });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid response from server");
      }

      // 🔑 Decrypt only specific encrypted fields
      const decryptedResidents = response.data.map(resident => ({
        resident_id: decrypt(resident.resident_id),
        first_name: decrypt(resident.first_name), // Decrypt if encrypted
        middle_name: decrypt(resident.middle_name), // Decrypt if encrypted
        last_name: decrypt(resident.last_name), // Decrypt if encrypted
        extension_name: decrypt(resident.extension_name), // Not encrypted
        age: resident.age, // Not encrypted
        address: decrypt(resident.address), // Decrypt if encrypted
        sex: resident.sex === "M" ? "Male" : resident.sex === "F" ? "Female" : resident.sex, // Convert M/F to Male/Female
        status: decrypt(resident.status), // Decrypt if encrypted
        birthplace: decrypt(resident.birthplace), // Decrypt if encrypted
        birthday: new Date(decrypt(resident.birthday)).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        }), // Format as Jan. 17, 2001
        vote: resident.voting_status === true ? "ACTIVE" : "NOT ACTIVE",
        vulnerable_status: decrypt(resident.vulnerable_status),
        date_added: resident.date_added
      }));

      setResidents(decryptedResidents);
      SwalInstance.close();
    } catch (error) {
      console.error("Error fetching residents:", error);
      SwalInstance.fire({
        icon: "error",
        title: "Oops...",
        text: error.message || "Something went wrong while fetching the residents!",
      });
    }
  };

  useEffect(() => {
    fetchResidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);




  const deleteResident = async (residentId) => {
    if (!checkInternet()) return;
    SwalInstance.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        SwalInstance.fire({
          title: "Deleting...",
          text: "Please wait while the resident is being deleted.",
          allowOutsideClick: false,
          didOpen: () => {
            SwalInstance.showLoading();
          },
        });

        try {
          await axios.delete(`${API_URL}/api/residents/delete_residents/${residentId}`, {
            headers: {
              [headername]:keypoint
            }
          });
          fetchResidents();
          SwalInstance.close();
          SwalInstance.fire("Deleted!", "The resident has been removed.", "success");
        } catch (error) {
          console.error("Error deleting resident:", error);
          SwalInstance.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong while deleting the resident!",
          });
        }
      }
    });
  };

  const [open, setOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);

  const handleEditClick = (residents) => {
    setSelectedResident(residents);
    setOpen(true);
  };

  // Download Excel Function
  const downloadExcel = () => {
    if (!checkInternet()) return;
    const worksheet = XLSX.utils.json_to_sheet(residents);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Residents");

    // Save Excel file
    XLSX.writeFile(workbook, "Barangay_Residents.xlsx");
  };



  const StatisticCard = ({ title, value, icon }) => (
    <Grid item xs={12} sm={4}>
      <Card variant="outlined" className="stat-box">
        <CardContent style={{ textAlign: "center" }}>
          <span className="icon" style={{ display: "block", marginBottom: "8px" }}>
            {icon}
          </span>
          <Typography variant="h6" style={{ fontWeight: "bold" }}>{title}</Typography>
          <Typography variant="body1" style={{ fontSize: "1.2em" }}>{value}</Typography>
        </CardContent>
      </Card>
    </Grid>
  );

  // Filter residents based on search query and other criteria
  const filteredResidents = residents.filter((resident) => {
    const matchesSearchQuery = resident.resident_id.toString().includes(searchQuery) ||
      resident.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.vulnerable_status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.last_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAgeRange = ageRange ? (ageRange === "below_18" ? resident.age < 18 : ageRange === "18_60" ? resident.age >= 18 && resident.age <= 60 : resident.age > 60) : true;
    const matchesSex = sex ? resident.sex === sex : true;
    const matchesPurok = purok ? resident.address.includes(purok) : true;

    return matchesSearchQuery && matchesAgeRange && matchesSex && matchesPurok;
  });

  // Update statistics based on filtered residents
  const totalResidents = filteredResidents.length;
  const maleResidents = filteredResidents.filter((r) => r.sex === "Male").length;
  const femaleResidents = filteredResidents.filter((r) => r.sex === "Female").length;

  // Sort residents based on sort criteria
  const sortCriteria = { key: "resident_id", order: "asc" }; // Example static criteria
  const sortedResidents = [...filteredResidents].sort((a, b) => {
    if (sortCriteria.key) {
      const aValue = a[sortCriteria.key];
      const bValue = b[sortCriteria.key];
      if (aValue < bValue) return sortCriteria.order === "asc" ? -1 : 1;
      if (aValue > bValue) return sortCriteria.order === "asc" ? 1 : -1;
      return 0;
    }
    return 0;
  });

  const classes = useStyles();

  const columns = [
    { field: 'resident_id', headerName: 'Resident ID', width: 150 },
    { field: 'first_name', headerName: 'First Name', width: 150 },
    { field: 'middle_name', headerName: 'Middle Name', width: 150 },
    { field: 'last_name', headerName: 'Last Name', width: 150 },
    { field: 'extension_name', headerName: 'Suffix', width: 100, },
    { field: 'age', headerName: 'Age', align: 'center', headerAlign: 'center', width: 100 },
    { field: 'address', headerName: 'Purok', align: 'center', headerAlign: 'center', width: 100 },
    { field: 'sex', headerName: 'Sex', align: 'center', headerAlign: 'center', width: 100 },
    { field: 'status', headerName: 'Status', align: 'center', headerAlign: 'center', width: 150 },
    { field: 'birthplace', headerName: 'Birthplace', width: 150 },
    { field: 'birthday', headerName: 'Birthday', width: 150 },
    {
      field: 'vote',
      headerName: 'Voting Status',
      width: 150, align: 'center', headerAlign: 'center',
      renderCell: (params) => {
        const voteStatus = params.row.vote;
        let backgroundColor = 'transparent';  // Default background color

        // If vote is 'Active', apply a background color
        if (voteStatus === 'ACTIVE') {
          backgroundColor = 'green';  // Set the background color for Active vote
        } else {
          backgroundColor = 'red';
        }

        return (
          <div style={{ backgroundColor, padding: '5px', color: 'white' }}>
            {voteStatus}
          </div>
        );
      }
    },
    { field: 'vulnerable_status', headerName: 'Vulnerable Sector', align: 'center', headerAlign: 'center', width: 150 },
    { field: 'date_added', headerName: 'Date Added', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <>
          <IconButton color="error" onClick={() => deleteResident(params.row.resident_id)} className="delete-button">
            <DeleteIcon />
          </IconButton>

          <IconButton onClick={() => handleEditClick(params.row)} className="edit-button">
            <EditIcon />
          </IconButton>

        </>
      ),
    },
  ];
    const CustomNoRowsOverlay = () => (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <SentimentDissatisfiedIcon sx={{ fontSize: 40, color: '#3D4751' }} />
        <Box sx={{ mt: 2 }}>No Data Available</Box>
      </Box>
    );

  return (
    <Box sx={{ padding: '20px', height: '500px', width: '100%' }}>
     <Typography variant="h4" gutterBottom>Barangay Residents</Typography>
      <Grid container spacing={2} alignItems="center" justifyContent="flex-start" sx={{ marginBottom: "20px" }}>
        <Grid item xs={12} sm="auto">
          <Box display="flex" alignItems="center" gap={0.5} sx={{ minHeight: "40px" }}>
            <HomeIcon fontSize="medium" color="primary" />
            <Typography variant="subtitle1" fontWeight="bold">Dashboard / Residents List</Typography>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={2} justifyContent="center" sx={{ marginBottom: "20px" }}>
        <StatisticCard title="Total Residents" value={totalResidents} icon={<FaUsers />} />
        <StatisticCard title="Male Residents" value={maleResidents} icon={<FaMale />} />
        <StatisticCard title="Female Residents" value={femaleResidents} icon={<FaFemale />} />
      </Grid>

      {/* Search Bar & Download Button */}
      <div className={classes.residentListActions}>
        <TextField
          label="Search residents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={classes.searchField}
        />
        <FormControl className={classes.filterControl}>
          <InputLabel>Age Range</InputLabel>
          <Select
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value)}
            label="Age Range"
          >
            <MenuItem value=""><em>None</em></MenuItem>
            <MenuItem value="below_18">Below 18</MenuItem>
            <MenuItem value="18_60">18-60</MenuItem>
            <MenuItem value="above_60">Above 60</MenuItem>
          </Select>
        </FormControl>
        <FormControl className={classes.filterControl}>
          <InputLabel>Sex</InputLabel>
          <Select
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            label="Sex"
          >
            <MenuItem value=""><em>None</em></MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
          </Select>
        </FormControl>
        <FormControl className={classes.filterControl}>
          <InputLabel>Purok</InputLabel>
          <Select
            value={purok}
            onChange={(e) => setPurok(e.target.value)}
            label="Purok"
          >
            <MenuItem value=""><em>None</em></MenuItem>
            <MenuItem value="1">Purok 1</MenuItem>
            <MenuItem value="2">Purok 2</MenuItem>
            <MenuItem value="3">Purok 3</MenuItem>
            <MenuItem value="4">Purok 4</MenuItem>
            <MenuItem value="5">Purok 5</MenuItem>
            <MenuItem value="6 A">Purok 6-A</MenuItem>
            <MenuItem value="6 B">Purok 6-B</MenuItem>
            <MenuItem value="7 A">Purok 7-A</MenuItem>
            <MenuItem value="7 B">Purok 7-B</MenuItem>
            <MenuItem value="8 A">Purok 8-A</MenuItem>
            <MenuItem value="8 B">Purok 8-B</MenuItem>
            <MenuItem value="9">Purok 9</MenuItem>
            <MenuItem value="10">Purok 10</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={downloadExcel}
          className={classes.downloadButton}
        >
          Download Excel
        </Button>
      </div>

      {/* Residents Table */}
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={sortedResidents}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          getRowId={(row) => row.resident_id}
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
          }}

        />
      </div>

      <EditResidentModal
        open={open}
        handleClose={() => setOpen(false)}
        resident={selectedResident}
        fetchResidents={fetchResidents}
      />
    </Box>
  );
};

export default ResidentList;