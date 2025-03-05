import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import * as XLSX from "xlsx"; // Import XLSX
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
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { makeStyles } from '@mui/styles';

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
    minWidth: 120,
    height: '55px',
  },
  searchField: {
    flex: 1,
    height: '55px',
  },
  downloadButton: {
    height: '55px',
  },
});

const ResidentList = () => {
  const [residents, setResidents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortCriteria, setSortCriteria] = useState({ key: "", order: "asc" });
  const [ageRange, setAgeRange] = useState("");
  const [sex, setSex] = useState("");
  const [purok, setPurok] = useState("");

  const fetchResidents = async () => {
    Swal.fire({
      title: "Loading...",
      text: "Fetching residents, please wait.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await axios.get("https://bned-backend.onrender.com/api/get_resident");
      setResidents(response.data);
      Swal.close();
    } catch (error) {
      console.error("Error fetching residents:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong while fetching the residents!",
      });
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  const deleteResident = async (residentId) => {
    Swal.fire({
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
        Swal.fire({
          title: "Deleting...",
          text: "Please wait while the resident is being deleted.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          await axios.delete(`https://bned-backend.onrender.com/api/delete_residents/${residentId}`);
          fetchResidents();
          Swal.close();
          Swal.fire("Deleted!", "The resident has been removed.", "success");
        } catch (error) {
          console.error("Error deleting resident:", error);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong while deleting the resident!",
          });
        }
      }
    });
  };

  const editResident = async (residentId, residentData) => {
    const { value: formValues } = await Swal.fire({
      title: 'Edit Resident',
      html:
        `<div style="display: grid; column-gap: 20px; row-gap: 10px; grid-template-columns: repeat(2, 1fr); width: 600px;">` +
        `<input id="swal-input1" class="swal2-input" placeholder="First Name" value="${residentData.first_name}" style="width: 100%;">` +
        `<input id="swal-input2" class="swal2-input" placeholder="Middle Name" value="${residentData.middle_name}" style="width: 100%;">` +
        `<input id="swal-input3" class="swal2-input" placeholder="Last Name" value="${residentData.last_name}" style="width: 100%;">` +
        `<input id="swal-input4" class="swal2-input" placeholder="Extension Name" value="${residentData.extension_name || ''}" style="width: 100%;">` +
        `<input id="swal-input5" class="swal2-input" placeholder="Age" value="${residentData.age}" style="width: 100%;">` +
        `<input id="swal-input6" class="swal2-input" placeholder="Address" value="${residentData.address}" style="width: 100%;">` +
        `<input id="swal-input7" class="swal2-input" placeholder="Sex" value="${residentData.sex}" style="width: 100%;">` +
        `<input id="swal-input8" class="swal2-input" placeholder="Status" value="${residentData.status}" style="width: 100%;">` +
        `<input id="swal-input9" class="swal2-input" placeholder="Birthplace" value="${residentData.birthplace}" style="width: 100%;">` +
        `<input id="swal-input10" class="swal2-input" placeholder="Birthday" value="${residentData.birthday}" style="width: 100%;">` +
        `</div>`,
        width:"750px",
      focusConfirm: false,
      preConfirm: () => {
        return {
          first_name: document.getElementById('swal-input1').value,
          middle_name: document.getElementById('swal-input2').value,
          last_name: document.getElementById('swal-input3').value,
          extension_name: document.getElementById('swal-input4').value,
          age: document.getElementById('swal-input5').value,
          address: document.getElementById('swal-input6').value,
          sex: document.getElementById('swal-input7').value,
          status: document.getElementById('swal-input8').value,
          birthplace: document.getElementById('swal-input9').value,
          birthday: document.getElementById('swal-input10').value,
        };
      },
      showCancelButton: true,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'edit-resident-popup',
        confirmButton: 'edit-resident-confirm-button',
        cancelButton: 'edit-resident-cancel-button'
      }
    });

    if (formValues) {
      const confirmUpdate = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to update this resident's information?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, update it!",
        cancelButtonText: "Cancel",
      });

      if (confirmUpdate.isConfirmed) {
        Swal.fire({
          title: "Updating...",
          text: "Please wait while the resident's information is being updated.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          await axios.put(`https://bned-backend.onrender.com/api/update_resident/${residentId}`, formValues);
          fetchResidents();
          Swal.close();
          Swal.fire("Updated!", "The resident's information has been updated.", "success");
        } catch (error) {
          console.error("Error updating resident:", error);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong while updating the resident!",
          });
        }
      }
    }
  };

  // Download Excel Function
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(residents);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Residents");

    // Save Excel file
    XLSX.writeFile(workbook, "Barangay_Residents.xlsx");
  };

  // Statistics
  const totalResidents = residents.length;
  const maleResidents = residents.filter((r) => r.sex === "M").length;
  const femaleResidents = residents.filter((r) => r.sex === "F").length;

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
      resident.last_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAgeRange = ageRange ? (ageRange === "below_18" ? resident.age < 18 : ageRange === "18_60" ? resident.age >= 18 && resident.age <= 60 : resident.age > 60) : true;
    const matchesSex = sex ? resident.sex === sex : true;
    const matchesPurok = purok ? resident.address.toLowerCase().includes(purok) : true;

    return matchesSearchQuery && matchesAgeRange && matchesSex && matchesPurok;
  });

  // Sort residents based on sort criteria
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

  const handleSort = (key) => {
    setSortCriteria((prev) => ({
      key,
      order: prev.key === key && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  const classes = useStyles();

  return (
    <Box sx={{ padding: '20px', backgroundColor: '#ffffff', height: '500px', width: '100%' }}>
      <h2 className="section-title">Barangay Residents</h2>

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
          sx={{ 
              backgroundColor: "transparent",
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                border: "none",
              },
            },
          }}
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
            <MenuItem value="M">Male</MenuItem>
            <MenuItem value="F">Female</MenuItem>
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
            <MenuItem value="6">Purok 6</MenuItem>
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
 
                  <TableContainer component={Paper} className={classes.tableContainer}>
                    <Table stickyHeader>
                      <TableHead className={classes.tableHead}>
            <TableRow>
              <TableCell  className={classes.tableCell}>Resident ID</TableCell>
              <TableCell  className={classes.tableCell}>First Name</TableCell>
              <TableCell  className={classes.tableCell}>Middle Name</TableCell>
              <TableCell  className={classes.tableCell}>Last Name</TableCell>
              <TableCell  className={classes.tableCell}>Suffix</TableCell>
              <TableCell  className={classes.tableCell} onClick={() => handleSort("age")}>Age</TableCell>
              <TableCell  className={classes.tableCell} onClick={() => handleSort("address")}>Purok</TableCell>
              <TableCell  className={classes.tableCell} onClick={() => handleSort("sex")}>Sex</TableCell>
              <TableCell  className={classes.tableCell}>Status</TableCell>
              <TableCell  className={classes.tableCell}>Birthplace</TableCell>
              <TableCell  className={classes.tableCell}>Birthday</TableCell>
              <TableCell  className={classes.tableCell}>Date Added</TableCell>
              <TableCell  className={classes.tableCell}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedResidents.length > 0 ? (
              sortedResidents.map((resident) => (
                <TableRow  className={classes.tableCell} key={resident.resident_id}>
                  <TableCell  className={classes.tableCell}>{resident.resident_id}</TableCell>
                  <TableCell  className={classes.tableCell}>{resident.first_name}</TableCell>
                  <TableCell  className={classes.tableCell}>{resident.middle_name}</TableCell>
                  <TableCell  className={classes.tableCell}>{resident.last_name}</TableCell>
                  <TableCell  className={classes.tableCell}>{resident.extension_name ? resident.extension_name : "N/A"}</TableCell>
                  <TableCell  className={classes.tableCell}>{resident.age}</TableCell>
                  <TableCell  className={classes.tableCell}>{resident.address}</TableCell>
                  <TableCell  className={classes.tableCell}>{resident.sex}</TableCell>
                  <TableCell  className={classes.tableCell}>{resident.status}</TableCell>
                  <TableCell  className={classes.tableCell}>{resident.birthplace}</TableCell>
                  <TableCell  className={classes.tableCell}>{resident.birthday}</TableCell>
                  <TableCell  className={classes.tableCell}>{resident.date_added}</TableCell>
                  <TableCell  className={classes.tableCell}>
                    <Button color="error" onClick={() => deleteResident(resident.resident_id)} className="delete-button">
                      Delete
                    </Button>
                    <Button onClick={() => editResident(resident.resident_id, resident)} className="edit-button">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={13} align="center">No residents found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ResidentList;
