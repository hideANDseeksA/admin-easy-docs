import React, { useEffect, useState } from 'react';
import {
  Typography,  Grid, Box, Toolbar, TextField, Tooltip, Button,
  IconButton
} from '@mui/material';
import useSwalTheme from '../utils/useSwalTheme';
import StatCard  from './stat';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid } from '@mui/x-data-grid';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import SearchIcon from '@mui/icons-material/Search';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import AllInboxIcon from "@mui/icons-material/AllInbox";
import CancelIcon from "@mui/icons-material/Cancel";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { API_URL,headername,keypoint } from '../utils/config';


const CertificateRequestLogs = () => {
  const [certificateRequests, setCertificateRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading] = useState(false);
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




  useEffect(() => {
    const fetchData = async () => {
      try {
        SwalInstance.fire({ title: 'Loading...', text: 'Fetching certificate requests.', allowOutsideClick: false, didOpen: () => SwalInstance.showLoading() });

        const response = await fetch(`${API_URL}/api/transaction/history`, {
          headers: {
          [headername]:keypoint
          },
        });
        const data = await response.json();

        const transactionsWithId = data.transactions.map((item, index) => ({
          ...item,
          unique_id: `${item.transaction_id}-${index}` // Or use a UUID here
        }));

        setCertificateRequests(transactionsWithId);
        setFilteredRequests(transactionsWithId);
        SwalInstance.close();
      } catch (error) {
        SwalInstance.close();
        console.error('Error fetching certificate requests:', error);
        SwalInstance.fire({ icon: 'error', title: 'Error', text: 'Could not fetch certificate request data. Please try again later.' });
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const response = await fetch(`${API_URL}/api/transaction/history`, {
        method: 'DELETE',
        headers:{
                 [headername]:keypoint
        }

      });

      const message = await response.text();
      if (response.ok) {
        SwalInstance.fire('Deleted!', message, 'success');
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
    if (!checkInternet()) return;
    SwalInstance.fire({
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
  
  
  

  const downloadMonthlySummary = async () => {
    if (!checkInternet()) return;
    const result = await SwalInstance.fire({
      title: "Download Summary?",
      text: "This will download the  Certificate Summary as a .docx file.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, download it!",
    });
  
    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/api/transaction/summary/monthly/download`, {
          headers: {
            [headername]:keypoint
          },
        });
  
        if (!response.ok) throw new Error("Failed to download document");
  
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
  
        const link = document.createElement("a");
        link.href = url;
        link.download = "monthly_certificate_summary.docx";
        link.click();
  
        window.URL.revokeObjectURL(url);
  
        SwalInstance.fire("Downloaded!", "The document has been saved to your device.", "success");
      } catch (err) {
        console.error("Download error:", err);
        SwalInstance.fire("Error", "Something went wrong while downloading.", "error");
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
      field: 'date_action',
      headerName: 'Date Action',
      flex: 1,
      align: 'center',
      headerAlign: 'center',

    }

  ];

  return (
    <Box sx={{ padding: '20px', height: '500px', width: '100%' }}>

      <Typography variant="h4" gutterBottom>Requested Certificates Logs</Typography>
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
            <ManageHistoryIcon fontSize="medium" color="primary" />
            <Typography variant="subtitle1" fontWeight="bold">Dashboard / History</Typography>
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
              <Toolbar
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap', // responsive
                  gap: 2,            // spacing between items
                  paddingY: 2,
                }}
              >
                {/* Left side: Search */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SearchIcon fontSize="medium" color="primary" />
                  <TextField
                    label="Search"
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ minWidth: '200px' }}
                  />
                </Box>

                {/* Right side: Delete button */}
                <Tooltip title="Delete All">
                  <span>
                    <Button
                      color="error"
                      size="medium"
                      onClick={confirmDelete}
                      disabled={certificateRequests.length === 0 || loading}
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      sx={{ minWidth: '120px' }}
                    >
                      Delete
                    </Button>
                  </span>
                </Tooltip>
                <IconButton title="Dowload Summary" color="primary" onClick={downloadMonthlySummary}>
                  <DownloadForOfflineIcon fontSize="large" />
                </IconButton>
              </Toolbar>

            </Box>
          </Box>
        </Grid>
      </Grid>
          <Grid container spacing={2} justifyContent="center" sx={{ marginBottom: "20px" }}>
              
              <Grid item xs={12} sm={3}>
                <StatCard
                  title="Total "
                  value={completedCount + cancelledCount + rejectCount}
                  percentage="Over All Request"
                  icon={<AllInboxIcon sx={{ color: "#fff" }} />}
      
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <StatCard
                  title="Completed"
                  value={completedCount}
                  percentage="Total requested that completed"
                  icon={<CheckCircleIcon sx={{ color: "#fff" }} />}
      
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <StatCard
                  title="Cancel"
                  value={cancelledCount}
                  percentage="Total request has been cancelled"
                  icon={<CancelIcon sx={{ color: "#fff" }} />}
      
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <StatCard
                  title="Reject"
                  value={rejectCount}
                  percentage="Total request has been rejected"
                  icon={<DoNotDisturbIcon sx={{ color: "#fff" }} />}
      
                />
              </Grid>
            </Grid>


      <div style={{ height: 440, width: '100%' }}>

        <DataGrid
          rows={filteredRequests}
          columns={columns}
          getRowId={(row) => row.unique_id}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
          }} />
      </div>

    </Box>
  );
};

export default CertificateRequestLogs;
