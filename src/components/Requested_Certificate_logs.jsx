import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Card, CardContent, Grid, Box, Toolbar, TextField, Tooltip, Button
} from '@mui/material';
import Swal from 'sweetalert2';
import DeleteIcon from '@mui/icons-material/Delete';
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
      textAlign: 'center', // Center align table headers
    },
  },
  tableRow: {
    textAlign: 'center', // Center align table headers
    '&:nth-of-type(odd)': {
      backgroundColor: '#f9f9f9',
    },
    '&:hover': {
      backgroundColor: '#e0f7fa',
    },
  },
  tableCell: {
    textAlign: 'center', // Center align table cells
  },
});

const CertificateRequestLogs = () => {
  const [certificateRequests, setCertificateRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        Swal.fire({
          title: 'Loading...',
          text: 'Fetching certificate requests.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const response = await fetch('https://bned-backend.onrender.com/api/get_transaction_history');
        const data = await response.json();
        setCertificateRequests(data.transactions);
        setFilteredRequests(data.transactions);
        Swal.close();
      } catch (error) {
        Swal.close();
        console.error('Error fetching certificate requests:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not fetch certificate request data. Please try again later.',
        });
      }
    };

    fetchData();
  }, []);

  // Filter requests based on search query
  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = certificateRequests.filter(request =>
      Object.values(request).some(value =>
        String(value).toLowerCase().includes(lowercasedQuery)
      )
    );
    setFilteredRequests(filtered);
  }, [searchQuery, certificateRequests]);

  // statistics
  const completedCount = certificateRequests.filter(req => req.status === 'Completed').length;
  const cancelledCount = certificateRequests.filter(req => req.status === 'Cancelled').length;
  const rejectCount = certificateRequests.filter(req => req.status === 'Rejected').length;

  // Handle Delete All
  const deleteAllHistory = async () => {
    try {
      const response = await fetch('https://bned-backend.onrender.com/api/delete_transactions_history', {
        method: 'DELETE',
      });

      const message = await response.text();
      if (response.ok) {
        Swal.fire('Deleted!', message, 'success');
        setCertificateRequests([]);
        setFilteredRequests([]);
      } else {
        console.error('Error:', message);
      }
    } catch (error) {
      console.error('Error deleting history:', error);
    }
  };

  // Confirm Delete with SweetAlert
  const confirmDelete = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this data!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAllHistory(); // If confirmed, delete all book activities
      }
    });
  };

  const showCertificateDetails = (certificateDetails) => {
    const formattedDetails = Object.entries(certificateDetails)
      .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
      .join("<br>");

    Swal.fire({
      title: "Certificate Information",
      html: `<div class='text-left p-4 bg-gray-100 rounded-lg text-sm leading-6' style='text-align: center;'>${formattedDetails}</div>`,
      icon: "info",
      confirmButtonText: "Close",
      customClass: {
        popup: "w-[90%] md:w-[400px] p-6",
        title: "text-lg md:text-xl",
        confirmButton: "text-sm md:text-base px-5 py-2 bg-[#4CAF50] text-white rounded-lg",
      },
    });
  };

  const StatisticCard = ({ title, value, icon }) => (
    <Grid item xs={12} sm={3}>
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

  const classes = useStyles();

  return (
    <Box sx={{ padding: '20px', backgroundColor: '#ffffff', height: '500px', width: '100%' }}>
      <Grid container spacing={2} justifyContent="center" sx={{ marginBottom: "20px" }}>
        <StatisticCard title="Total Request" value={completedCount + cancelledCount + rejectCount} />
        <StatisticCard title="Completed Request" value={completedCount} />
        <StatisticCard title="Cancelled Request" value={cancelledCount} />
        <StatisticCard title="Rejected Request" value={rejectCount} />
      </Grid>

      {/* Search and Delete Actions */}
      <Toolbar sx={{ justifyContent: 'space-between', paddingLeft: 0, paddingRight: 0 }}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            width: '90%',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                border: 'none',
              },
              '&.Mui-focused fieldset': {
                border: 'none',
              },
            },
          }}
        />

        <Tooltip title="Delete All">
          <span>
            <Button 
            sx={{ marginBottom: '10px'}}
              color="error"
              onClick={confirmDelete} // Trigger confirmation dialog
              disabled={certificateRequests.length === 0 || loading}
              variant="outlined" startIcon={<DeleteIcon />}>
              Delete
            </Button>
          </span>
        </Tooltip>
        
      </Toolbar>

      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table stickyHeader>
          <TableHead className={classes.tableHead}>
            <TableRow>
              <TableCell className={classes.tableCell}>Transaction ID</TableCell>
              <TableCell className={classes.tableCell}>Resident ID</TableCell>
              <TableCell className={classes.tableCell}>Resident Email</TableCell>
              <TableCell className={classes.tableCell}>Certificate Type</TableCell>
              <TableCell className={classes.tableCell}>Certificate Details</TableCell>
              <TableCell className={classes.tableCell}>Date Requested</TableCell>
              <TableCell className={classes.tableCell}>Status</TableCell>
              <TableCell className={classes.tableCell}>Date Claimed</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <TableRow key={request.transaction_id} className={classes.tableRow}>
                  <TableCell align='center'>{request.transaction_id}</TableCell>
                  <TableCell align='center'>{request.resident_id}</TableCell>
                  <TableCell align='center'>{request.resident_email}</TableCell>
                  <TableCell align='center'>{request.certificate_type}</TableCell>
                  <TableCell align='center'
                    className={`${classes.tableCell} border p-3 text-blue-600 underline cursor-pointer hover:text-blue-800`}
                    onClick={() => showCertificateDetails(request.certificate_details)}
                  >
                    View Details
                  </TableCell>
                  <TableCell align='center'>{new Date(request.date_requested).toLocaleString()}</TableCell>
                  <TableCell align='center' sx={{
                    fontWeight: 'bold',
                    color: request.status === 'Approved' ? 'green' :
                      request.status === 'Pending' ? 'yellow' :
                        request.status === 'On Process' ? 'orange' :
                          request.status === 'Ready To Claim' ? 'blue' : 'black'
                  }}>
                    {request.status}
                  </TableCell>
                  <TableCell align='center'>{request.date_issued ? new Date(request.date_issued).toLocaleString() : 'N/A'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No history transactions.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CertificateRequestLogs;
