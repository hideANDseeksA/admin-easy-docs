import React, { useEffect, useState } from 'react';
import {
  Paper, IconButton, Grid, Menu, MenuItem, Box, TextField, Typography, Alert, Stack, Divider, Collapse
} from '@mui/material';
import { MoreVert, CheckCircle, DoneAll, Cancel } from '@mui/icons-material';
import useSwalTheme from '../utils/useSwalTheme';
import { io } from 'socket.io-client';
import notificationSound from '../sounds/notification.wav';
import StatCard from './stat';
import HomeIcon from '@mui/icons-material/Description';
import { DataGrid } from '@mui/x-data-grid';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SearchIcon from '@mui/icons-material/Search';
import TaskIcon from '@mui/icons-material/Task';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import HourglassFullIcon from '@mui/icons-material/HourglassFull';
import { API_URL,headername,keypoint } from '../utils/config';




const CertificateRequestTable = () => {
  const SwalInstance = useSwalTheme();
  const [certificateRequests, setCertificateRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showSearch, setShowSearch] = useState(false);



  useEffect(() => {
    const socket = io(API_URL, {
      extraHeaders: {
        'x-api-key': 'a4c7d3f19e0b5c62a6e9842fbd3c7dfe8c5b3a9c2e6d7f3a5b1c9d0f8e6a4b7c'
      }
    });
  
    let isUnmounting = false; // 🔸 Add this flag
  
    SwalInstance.fire({
      title: 'Loading...',
      text: 'Fetching certificate requests. Please wait.',
      allowOutsideClick: false,
      didOpen: () => {
        SwalInstance.showLoading();
      },
    });

    socket.emit('register', { role: 'admin' });
    socket.emit("getAllTransactions");
  
    socket.on('transactions', (data) => {
      setCertificateRequests(data);
      setFilteredRequests(data);
      SwalInstance.close();
    });
  
    socket.on('new_transaction', (newTransaction) => {
      setCertificateRequests(prev => [newTransaction, ...prev]);
      setFilteredRequests(prev => [newTransaction, ...prev]);
    });
  
    socket.on('remove_transaction', ({ transaction_id }) => {
      setCertificateRequests(prev => prev.filter(req => req.transaction_id !== transaction_id));
      setFilteredRequests(prev => prev.filter(req => req.transaction_id !== transaction_id));
    });
  
    socket.on("transaction_updated", ({ transaction_id, status }) => {
      setCertificateRequests(prev =>
        prev.map(req =>
          req.transaction_id === transaction_id ? { ...req, status } : req
        )
      );
      setFilteredRequests(prev =>
        prev.map(req =>
          req.transaction_id === transaction_id ? { ...req, status } : req
        )
      );
    });
  
    socket.on('disconnect', () => {
      if (!isUnmounting) { // 🔸 Only show alert if not unmounting
        SwalInstance.close();
        SwalInstance.fire({
          title: 'Network Issue',
          text: 'Connection lost. Please check your network.',
          icon: 'error',
          confirmButtonText: 'Retry',
          customClass: {
            popup: 'max-w-[90vw] sm:max-w-md',
            title: 'text-base sm:text-lg md:text-xl',
            htmlContainer: 'text-sm sm:text-base',
            confirmButton: 'bg-[#4CAF50] text-white px-4 py-2 rounded-lg text-sm sm:text-base',
          },
        });
      }
    });
  
    return () => {
      isUnmounting = true; // 🔸 Set before disconnecting
      socket.disconnect();
    };
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  

  useEffect(() => {
    const filtered = certificateRequests.filter(request =>
      (request.transaction_id.toString().includes(searchQuery) ||
        request.resident_id.toString().includes(searchQuery) ||
        request.resident_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.certificate_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.status.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (request.status === 'Pending' || request.status === 'Ready To Claim')
    );
    setFilteredRequests(filtered);
  }, [searchQuery, certificateRequests]);

  const approveCount = certificateRequests.filter(req => req.status === 'Approved').length;
  const pendingCount = certificateRequests.filter(req => req.status === 'Pending').length;
  const processingCount = certificateRequests.filter(req => req.status === 'On Process').length;
  const readyCount = certificateRequests.filter(req => req.status === 'Ready To Claim').length;


  useEffect(() => {
    if (pendingCount > 0) {
      const notificationAudio = new Audio(notificationSound);
      setShowAlert(true);
      notificationAudio.play().catch(error => console.error('Error playing sound:', error));

      setTimeout(() => setShowAlert(false), 5000);
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
      .map(
        ([key, value]) => `
          <div style="margin-bottom: 8px;">
            <span style="font-weight: 600;">${key}:</span>
            <span style="margin-left: 6px;">${value}</span>
          </div>`
      )
      .join("");
  
    SwalInstance.fire({
      title: "Certificate Information",
      html: `
        <div style="
          text-align: left;
          padding: 1rem;
          border-radius: 10px;
          font-size: 15px;
          line-height: 1.8;
          max-height: 250px;
          overflow-y: auto;
        ">
          ${formattedDetails}
        </div>
      `,
      icon: "info",
      confirmButtonText: "Close",
      customClass: {
        popup: "swal2-popup-custom",
        title: "swal2-title-custom",
        confirmButton: "swal2-confirm-custom",
      },
      showClass: {
        popup: "swal2-show animate__animated animate__fadeInDown",
      },
      hideClass: {
        popup: "swal2-hide animate__animated animate__fadeOutUp",
      },
    });
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

  const handleAction = async (actionType) => {
    if (!checkInternet()) return;
    if (!selectedRequest) return;
    handleMenuClose();



    if (selectedRequest.status === 'Pending' && actionType === 'Completed') {
      SwalInstance.fire({
        title: "Notice",
        text: "This request is not ready to claim yet.",
        icon: "warning",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-[#4CAF50] text-white px-4 py-2 rounded-lg",
        },
      });
      return;
    } else if (selectedRequest.status === 'On Process') {
      SwalInstance.fire({
        title: "Notice",
        text: "This request is already On Process.",
        icon: "warning",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-[#4CAF50] text-white px-4 py-2 rounded-lg",
        },
      });
      return;
    } else if (selectedRequest.status === 'Ready To Claim' && actionType !== 'Completed') {
      SwalInstance.fire({
        title: "Notice",
        text: "This request is already Ready To Claim.",
        icon: "warning",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-[#4CAF50] text-white px-4 py-2 rounded-lg",
        },
      });
      return;
    }

    const actionMessage = actionType === 'Approved' ? 'approve' : actionType === 'Completed' ? 'complete' : 'Reject';
    const result = await SwalInstance.fire({
      title: `Are you sure you want to ${actionMessage} this request?`,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      icon: 'warning',
    });

    if (result.isConfirmed) {
      SwalInstance.fire({
        title: 'Processing...',
        text: 'Please wait while we update the request.',
        allowOutsideClick: false,
        didOpen: () => {
          SwalInstance.showLoading();
        }
      });

      try {
        const requestBody = { status: actionType };
        if (actionType !== 'Completed') {
          requestBody.date_issued = null;
        } else {
          requestBody.date_issued = new Date().toISOString(); 
        }
        

        const response = await fetch(`${API_URL}/api/transaction/certificate_transaction/${selectedRequest.transaction_id}`, {
          method: 'PUT',
          headers: {
            "Content-Type": "application/json",
            [headername]:keypoint
          },
          body: JSON.stringify(requestBody),
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
          await fetch(`${API_URL}/api/transaction/send-notification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                  [headername]:keypoint
             },
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

        SwalInstance.fire({
          icon: 'success',
          title: 'Success!',
          text: `Request has been ${actionMessage}d.`,
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error updating request:', error);
        SwalInstance.fire('Error!', 'Failed to update request. Please try again.', 'error');
      }
    }
  };

  const CustomNoRowsOverlay = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <SentimentDissatisfiedIcon sx={{ fontSize: 40, color: '#3D4751' }} />
      <Box sx={{ mt: 2 }}>No Data Available</Box>
    </Box>
  );
  const columns = [
    { field: 'transaction_id', headerName: 'Transaction ID', flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'resident_id', headerName: 'Resident ID', flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'resident_email', headerName: 'Resident Email', flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'certificate_type', headerName: 'Certificate Type', flex: 1.2, align: 'center', headerAlign: 'center' },
    {
      field: 'certificate_details',
      headerName: 'Certificate Details',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <div
          className="border p-3 text-blue-600 underline cursor-pointer hover:text-blue-800"
          onClick={() => showCertificateDetails(params.value)}
        >
          View Details
        </div>
      ),
    },
    {
      field: 'date_requested',
      headerName: 'Date Requested',
      flex: 1,
      align: 'center',
      headerAlign: 'center',

    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <span
          style={{
            fontWeight: 'bold',
            color:

              params.value === 'Pending'
                ? 'red'

                : 'blue',
          }}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <div>
          <IconButton
            onClick={(e) => handleMenuOpen(e, params.row)}
            sx={{
              color: 'primary.main',
              transition: '0.3s',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
            }}
          >
            <MoreVert />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                borderRadius: 2,
                minWidth: 180,
                boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
              },
            }}
          >
            <MenuItem onClick={() => handleAction('Approved')}>
              <CheckCircle sx={{ color: 'green', mr: 1 }} />
              Approve
            </MenuItem>

            <MenuItem onClick={() => handleAction('Completed')}>
              <DoneAll sx={{ color: 'blue', mr: 1 }} />
              Completed
            </MenuItem>

            <Divider />

            <MenuItem onClick={() => handleAction('Reject')} sx={{ color: 'red' }}>
              <Cancel sx={{ color: 'red', mr: 1 }} />
              Reject
            </MenuItem>
          </Menu>
        </div>
      ),
    },
  ];

  return (
    <Box sx={{ padding: '20px', height: '500px', width: '100%' }}>
      <Typography variant="h4" gutterBottom>Requested Certificates</Typography>
      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{ marginBottom: "10px" }}
      >
        {/* Left Side: Title */}
        <Grid item xs={12} sm={6}>
          <Box display="flex" alignItems="center" gap={0.5} sx={{ minHeight: "40px" }}>
            <HomeIcon fontSize="medium" color="primary" />
            <Typography variant="subtitle1" fontWeight="bold">Dashboard / Requested Certificates</Typography>
          </Box>
        </Grid>

        {/* Right Side: Search Button + Field */}
        <Grid item xs={12} sm={6}>
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            sx={{ width: '100%', marginBottom: "10px" }}
          >
            <Box
              display="flex"
              alignItems="center"
              sx={{
                maxWidth: '100%',
                transition: 'all 0.3s ease',
              }}
            >
              <IconButton
                type="button"
                aria-label="search"
                onClick={() => setShowSearch(!showSearch)}
                sx={(theme) => ({
                  backgroundColor:
                    theme.palette.mode === 'dark' ? '#424242' : '#f9f9f9',
                  color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                  '&:hover': {
                    backgroundColor:
                      theme.palette.mode === 'dark' ? '#616161' : '#e0e0e0',
                  },
                })}
              >
                <SearchIcon />
              </IconButton>

              <Collapse in={showSearch} orientation="horizontal">
                <TextField
                  label="Search..."
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    ml: 1,
                    borderRadius: 2,
                    minWidth: '200px',
                    maxWidth: '300px', // optional for cleaner expansion
                    width: '100%',
                  }}
                />
              </Collapse>
            </Box>
          </Box>
        </Grid>
      </Grid>




      <Grid container spacing={2} justifyContent="center" sx={{ marginBottom: "20px" }}>
        <Stack sx={{ width: '100%', mb: 2 }} spacing={2}>
          {showAlert && (
            <Alert variant="outlined" severity="info">
              New request! Admin users have new certificate requests.
            </Alert>
          )}
        </Stack>

        <Grid item xs={12} sm={3}>
          <StatCard
            title="Approved"
            value={approveCount}
            percentage="Total requested waiting to process "
            icon={<MarkEmailReadIcon sx={{ color: "#fff" }} />}

          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <StatCard
            title="Pending"
            value={pendingCount}
            percentage="Total requested waiting to approved "
            icon={<HourglassEmptyIcon sx={{ color: "#fff" }} />}

          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <StatCard
            title="Processing"
            value={processingCount}
            percentage="Total request has been processed "
            icon={<HourglassFullIcon sx={{ color: "#fff" }} />}

          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <StatCard
            title="Claimable"
            value={readyCount}
            percentage="Total request ready to claim"
            icon={<TaskIcon sx={{ color: "#fff" }} />}

          />
        </Grid>
      </Grid>
      <Paper>
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={filteredRequests}
            columns={columns}
            getRowId={(row) => row.transaction_id}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            slots={{ noRowsOverlay: CustomNoRowsOverlay }} />
        </div>
      </Paper>
    </Box>
  );
};

export default CertificateRequestTable;
