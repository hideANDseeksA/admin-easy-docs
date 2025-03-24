import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper,  IconButton, Grid, Menu, MenuItem, Box, TextField, InputAdornment
} from '@mui/material';
import { MoreVert,Search } from '@mui/icons-material';
import Swal from 'sweetalert2';
import notificationSound from '../sounds/notification.wav';
import { FaCheckCircle, FaClock, FaCog, FaClipboardCheck } from "react-icons/fa";
import StatisticCard from "./statisticcard"; 


const CertificateRequestTable = () => {
  const [certificateRequests, setCertificateRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
  
        const response = await fetch('https://bned-backend.onrender.com/api/get_transaction');
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
    const intervalId = setInterval(fetchData, 120000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const filtered = certificateRequests.filter(request =>
      request.transaction_id.toString().includes(searchQuery) ||
      request.resident_id.toString().includes(searchQuery) ||
      request.resident_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.certificate_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRequests(filtered);
  }, [searchQuery, certificateRequests]);

  // statistics
  const approveCount= certificateRequests.filter(req => req.status === 'Approved').length;
  const pendingCount = certificateRequests.filter(req => req.status === 'Pending').length;
  const processingCount = certificateRequests.filter(req => req.status === 'On Process').length;
  const readyCount = certificateRequests.filter(req => req.status === 'Ready To Claim').length;

  useEffect(() => {
    if (pendingCount > 0) {
      const notificationAudio = new Audio(notificationSound);
      Swal.fire({
        title: 'New request!',
        text: 'Admin users have new certificate requests.',
        icon: 'info',
        confirmButtonText: 'OK'
      });
      notificationAudio.play().catch(error => console.error('Error playing sound:', error));
    }
  }, [pendingCount]);

  const handleMenuOpen = (event, request) => {
    setAnchorEl(event.currentTarget);
    setSelectedRequest(request);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRequest(null);
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
  
  const handleAction = async (actionType) => {
    if (!selectedRequest) return;
    handleMenuClose();
  
    if (selectedRequest.status === 'Approved' && actionType !== 'Completed') {
      Swal.fire({
        title: "Notice",
        text: "This request is already Approved.",
        icon: "warning",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-[#4CAF50] text-white px-4 py-2 rounded-lg",
        },
      });
      return; // Prevent further processing
    } else if (selectedRequest.status === 'On Process') {
      Swal.fire({
        title: "Notice",
        text: "This request is already On Process.",
        icon: "warning",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-[#4CAF50] text-white px-4 py-2 rounded-lg",
        },
      });
      return; // Prevent further processing
    } else if (selectedRequest.status === 'Ready To Claim' && actionType !== 'Completed') {
      Swal.fire({
        title: "Notice",
        text: "This request is already Ready To Claim.",
        icon: "warning",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-[#4CAF50] text-white px-4 py-2 rounded-lg",
        },
      });
      return; // Prevent further processing
    }
  
    const actionMessage = actionType === 'Approved' ? 'approve' : actionType === 'Ready to Claim' ? 'mark as ready to claim' : actionType === 'Completed' ? 'complete' : 'Rejecte';
    const result = await Swal.fire({
      title: `Are you sure you want to ${actionMessage} this request?`,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      icon: 'warning',
    });
  
    if (result.isConfirmed) {
      Swal.fire({
        title: 'Processing...',
        text: 'Please wait while we update the request.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
  
      try {
        const requestBody = { status: actionType };
        if (actionType === 'Completed') {
          requestBody.date_issued = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })).toISOString();
        } else {
          requestBody.date_issued = null;
        }
  
        const response = await fetch(`https://bned-backend.onrender.com/certificate_transaction/${selectedRequest.transaction_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
        if (!response.ok) throw new Error('Failed to update request');
  
        if (actionType === 'Approved') {
          setCertificateRequests(prevRequests => prevRequests.map(req => 
            req.transaction_id === selectedRequest.transaction_id ? { ...req, status: actionType } : req
          ));
          setFilteredRequests(prevRequests => prevRequests.map(req => 
            req.transaction_id === selectedRequest.transaction_id ? { ...req, status: actionType } : req
          ));
        } else {
          setCertificateRequests(prevRequests => prevRequests.filter(req => req.transaction_id !== selectedRequest.transaction_id));
          setFilteredRequests(prevRequests => prevRequests.filter(req => req.transaction_id !== selectedRequest.transaction_id));
        }
  
        if (actionType === 'Approved' || actionType === 'Reject') {
          await fetch('https://bned-backend.onrender.com/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: selectedRequest.resident_email,
              requestId: selectedRequest.transaction_id,
              status: actionType === 'Approved' ? "Ready To Claim" : "Rejected",
              message:
                actionType === "Approved"
                  ? `We would like to inform you that your ${selectedRequest.certificate_type} has been approved. Please wait for further updates on your request.`
                  : `We regret to inform you that your ${selectedRequest.certificate_type} request has been rejected. Please contact the admin for more information why your request has been rejected.`,
            }),
          });
        }
        
  
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `Request has been ${actionMessage}d.`,
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error updating request:', error);
        Swal.fire('Error!', 'Failed to update request. Please try again.', 'error');
      }
    }
  };

   

  return (
 
    <Box sx={{ padding: '20px', backgroundColor: '#ffffff', height: '500px', width: '100%' }}>
      <Grid container spacing={2} justifyContent="center" sx={{ marginBottom: "20px" }}>
         {/* Approved Requests */}
      <Grid item xs={12} sm={3}>
        <StatisticCard 
          title="Approved Request" 
          value={approveCount} 
          icon={<FaCheckCircle />} 
          color="#2ecc71" // Green
        />
      </Grid>

      {/* Pending Requests */}
      <Grid item xs={12} sm={3}>
        <StatisticCard 
          title="Pending Request" 
          value={pendingCount} 
          icon={<FaClock />} 
          color="#f39c12" // Orange
        />
      </Grid>

      {/* On Process Requests */}
      <Grid item xs={12} sm={3}>
        <StatisticCard 
          title="On Process Request" 
          value={processingCount} 
          icon={<FaCog />} 
          color="#3498db" // Blue
        />
      </Grid>

      {/* Ready to Claim Requests */}
      <Grid item xs={12} sm={3}>
        <StatisticCard 
          title="Ready to Claim" 
          value={readyCount} 
          icon={<FaClipboardCheck />} 
          color="#9b59b6" // Purple
        />
      </Grid>
      </Grid>

    <TextField
      variant="outlined"
      placeholder="Search..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search style={{ color: "#888" }} />
          </InputAdornment>
        ),
        sx: {
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
          "&:hover": {
            backgroundColor: "#f3f3f3",
          },
          "&.Mui-focused": {
            backgroundColor: "#fff",
            border: "1px solid #1976d2",
          },
      
        },
        marginBottom:"20 px",
      }}
    />


      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5', marginTop:'10px' }}>
            <TableRow>
              <TableCell align="center">Transaction ID</TableCell>
              <TableCell align="center">Resident ID</TableCell>
              <TableCell align="center">Resident Email</TableCell>
              <TableCell align="center">Certificate Type</TableCell>
              <TableCell align="center">Certificate Details</TableCell>
              <TableCell align="center">Date Requested</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <TableRow key={request.transaction_id} hover>
                  <TableCell align="center">{request.transaction_id}</TableCell>
                  <TableCell align="center">{request.resident_id}</TableCell>
                  <TableCell align="center">{request.resident_email}</TableCell>
                  <TableCell align="center">{request.certificate_type}</TableCell>
                  <TableCell
                    className="border p-3 text-blue-600 underline cursor-pointer hover:text-blue-800"
                    onClick={() => showCertificateDetails(request.certificate_details)}
                    align="center">
                    View Details
                  </TableCell>
                  <TableCell align="center">{new Date(request.date_requested).toLocaleString()}</TableCell>
                  <TableCell align="center" sx={{ fontWeight:'bold',
                    color: request.status === 'Approved' ? 'green' :
                           request.status === 'Pending' ? 'yellow' :
                           request.status === 'On Process' ? 'orange' :
                           request.status === 'Ready To Claim' ? 'blue' : 'black'
                  }}>
                    {request.status}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={(e) => handleMenuOpen(e, request)}>
                      <MoreVert />
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                      <MenuItem onClick={() => handleAction('Approved')}>Approve</MenuItem>
                      <MenuItem onClick={() => handleAction('Completed')}>Completed</MenuItem>
                      <MenuItem onClick={() => handleAction('Reject')}>Reject</MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CertificateRequestTable;