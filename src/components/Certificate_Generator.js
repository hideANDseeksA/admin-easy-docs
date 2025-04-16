import React, { useEffect, useState } from 'react';
import {
  TextField, Typography, IconButton, Grid, Collapse, Box
} from '@mui/material';
import useSwalTheme from '../utils/useSwalTheme';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid } from '@mui/x-data-grid';
import { CheckCircle, AdfScanner } from '@mui/icons-material';
import StatCard from './stat';
import TaskIcon from '@mui/icons-material/Task';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import { API_URL,headername,keypoint } from '../utils/config';
import { io } from 'socket.io-client';
const CertificateGenerator = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const SwalInstance = useSwalTheme();
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




  useEffect(() => {
    const socket = io(API_URL, {
      extraHeaders: {
   [headername]:keypoint
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
    socket.emit("getAllTransactions");

    socket.on('transactions', (data) => {
      setTransactions(data);
      setFilteredTransactions(data);
      SwalInstance.close();
    });

    socket.on('new_transaction', (newTransaction) => {
      setTransactions(prevRequests => [newTransaction, ...prevRequests]);
      setFilteredTransactions(prevRequests => [newTransaction, ...prevRequests]);
    });

    socket.on('remove_transaction', ({ transaction_id }) => {
      setTransactions(prevRequests => prevRequests.filter(req => req.transaction_id !== transaction_id));
      setFilteredTransactions(prevRequests => prevRequests.filter(req => req.transaction_id !== transaction_id));
    });

    socket.on("transaction_updated", ({ transaction_id, status }) => {
      setTransactions(prevRequests =>
        prevRequests.map(req =>
          req.transaction_id === transaction_id ? { ...req, status } : req
        )
      );
      setFilteredTransactions(prevRequests =>
        prevRequests.map(req =>
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
    const approvedFiltered = transactions.filter(t => t.status === 'Approved' || t.status === 'On Process');

    const filtered = approvedFiltered.filter((transaction) =>
      transaction.transaction_id.toString().includes(searchTerm) ||
      transaction.resident_id.toString().includes(searchTerm) ||
      (transaction.resident_email && transaction.resident_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.date_requested && transaction.date_requested.includes(searchTerm))
    );

    setFilteredTransactions(filtered);
  }, [searchTerm, transactions]);


  const approvedRequests = transactions.filter(t => t.status === 'Approved').length;
  const totalRequests = transactions.length;
  const processRequests = transactions.filter(t => t.status === 'On Process').length;

  const handleAction = async (transactionId, actionType) => {
    if (!checkInternet()) return;
    const transaction = transactions.find(t => t.transaction_id === transactionId);

    if (actionType === 'Generate') {
      if (transaction.status === 'On Processs') {
        SwalInstance.fire({
          icon: 'info',
          title: 'Notice',


          text: 'The document has already been generated.',
        });
        return;
      }

      const result = await SwalInstance.fire({
        title: 'Are you sure you want to generate the certificate?',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        icon: 'question',
      });

      if (result.isConfirmed) {
        // First, update the status to "On Process"


        try {
          const updateResponse = await fetch(`${API_URL}/api/transaction/certificate_transaction/${transactionId}`, {
            method: 'PUT',
            headers: {
              "Content-Type": "application/json",
              [headername]:keypoint
            },
            body: JSON.stringify({ status: "On Process", date_issued: null })
          });

          if (!updateResponse.ok) {
            throw new Error('Failed to update transaction status.');
          }

     


          await fetch(`${API_URL}/api/transaction/send-notification`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              [headername]:keypoint
             },
            body: JSON.stringify({
              email: transaction.resident_email,
              requestId: transaction.transaction_id,
              status: "On Process",
              message: "We would like to inform you that your " + transaction.certificate_type + "  is now on process. Please wait for until we finished processing the certificate you have been requested"
            })
          });
  


          // Now, generate the certificate
          generateCertificate(transaction.certificate_details);
       

        } catch (error) {
          SwalInstance.fire('Error!', 'Failed to update transaction status. Please try again.', 'error');
        }
      }
      return;
    }

    if (actionType === 'Ready To Claim' && transaction.status !== 'On Process') {
      SwalInstance.fire({
        icon: 'info',
        title: 'Notice',
        text: 'Only transactions that has been processed can be remark as ready to claim!".',
      });
      return;
    }

    const result = await SwalInstance.fire({
      title: `Notice`,
      text: `Are you sure you want to mark this request as ready to claimed?`,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      icon: 'question',
    });

    if (result.isConfirmed) {
      SwalInstance.fire({
        title: 'Processing...',
        text: 'Please wait while we update the transaction status.',
        allowOutsideClick: false,
        didOpen: () => SwalInstance.showLoading(),
      });

      try {
        const response = await fetch(`${API_URL}/api/transaction/certificate_transaction/${transactionId}`, {
          method: 'PUT',
          headers: {
            "Content-Type": "application/json",
            [headername]:keypoint
          },
          body: JSON.stringify({ status: actionType, date_issued: null }) // "Ready To Claim"
        });

        if (!response.ok) {
          throw new Error('Failed to update transaction');
        }


        await fetch(`${API_URL}/api/transaction/send-notification`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            [headername]:keypoint
           },
          body: JSON.stringify({
            email: transaction.resident_email,
            requestId: transaction.transaction_id,
            status: "Ready To Claim",
            message: "We would like to inform you that your " + transaction.certificate_type + "  is now ready to claim. You can now claim your certificate at the Barangay hall."
          })
        });




        SwalInstance.fire({
          icon: 'success',
          title: 'Success!',
          text: `The request has been marked as "${actionType}".`,
          timer: 2000,
          showConfirmButton: false


        });
      } catch (error) {
        console.error('Error updating transaction:', error);
        SwalInstance.fire('Error!', 'Failed to update transaction. Please try again.', 'error');
      }
    }
  };

  const CustomNoRowsOverlay = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <SentimentDissatisfiedIcon sx={{ fontSize: 40, color: '#3D4751' }} />
      <Box sx={{ mt: 2 }}>No Data Available</Box>
    </Box>
  );
  const Regenerate = async (transactionId) => {
    if (!checkInternet()) return;
    const transaction = transactions.find(t => t.transaction_id === transactionId);
    const result = await SwalInstance.fire({
      title: 'Notice!',
      text: 'This request is already generated!, Are you sure you want to regenerate this certificate?',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      icon: 'warning',
    });

    if (result.isConfirmed) {
      generateCertificate(transaction.certificate_details);
    }

  }
  const generateCertificate = async (certificateDetails) => {
    if (!certificateDetails.templateName) {
      certificateDetails.templateName = certificateDetails.template;
    }

    const requestData = { templateName: certificateDetails.templateName };

    const TEMPLATE_FIELDS = {
      indigency: ["fullName", "age", "purok", "maritalStatus", "purpose"],
      goodmoral: ["fullName", "age", "purok", "purpose"],
      residency: ["fullName", "purok", "maritalStatus", "purpose"],
      nstp: ["fullName", "program", "schoolyear", "serialnumber", "school"],
      ownership: ["fullName", "purok", "maritalStatus", "property", "propertyDescription", "purpose"]
    };

    // Ensure correct field names
    TEMPLATE_FIELDS[certificateDetails.templateName].forEach((field) => {

      requestData[field] = certificateDetails[field];

    });

    console.log("Request Data:", requestData); // Debugging

    try {
      SwalInstance.fire({
        title: 'Generating Certificate...',
        text: 'Please wait while we generate the certificate.',
        allowOutsideClick: false,
        didOpen: () => SwalInstance.showLoading()
      });

      const response = await fetch(`${API_URL}/api/generate/certificates`, {
        method: "POST",
        headers: {
          [headername]:keypoint,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${certificateDetails.fullName + " " + certificateDetails.templateName}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      SwalInstance.close();
    } catch (error) {
      SwalInstance.close();
      alert("Error: " + error.message);
    }
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
  




  const columns = [
    { field: 'transaction_id', headerName: 'Transaction ID', flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'resident_id', headerName: 'Resident ID', flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'resident_email', headerName: 'Resident Email', flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'certificate_type', headerName: 'Certification', flex: 1.5, align: 'center', headerAlign: 'center' },
    {
      field: 'date_requested',
      headerName: 'Date Requested',
      flex: 1,
      align: 'center',
      headerAlign: 'center',

    },
    {
      field: 'certificate_details',
      headerName: 'Certificate Details',
      flex: 1, align: 'center', headerAlign: 'center',
      renderCell: (params) => (
        <span
          onClick={() => showCertificateDetails(params.value)}
          style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
        >
          View Details
        </span>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1, align: 'center', headerAlign: 'center',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1, align: 'center', headerAlign: 'center',
      renderCell: (params) => {
        const transaction = params.row;

        return (
          <div>
            {transaction.status === 'Approved' && (
              <IconButton
                variant="contained"
                color="warning"
                onClick={() => handleAction(transaction.transaction_id, 'Generate')}
                style={{ marginRight: 8 }}
              >
                <AdfScanner sx={{ color: 'orange', mr: 1 }} />
              </IconButton>
            )}

            {transaction.status === 'On Process' && (
              <IconButton
                variant="contained"
                color="primary"
                onClick={() => Regenerate(transaction.transaction_id)}
                style={{ marginRight: 8 }}
              >
                <AdfScanner sx={{ color: 'blue', mr: 1 }} />

              </IconButton>
            )}

            <IconButton
              variant="contained"
              color="success"
              onClick={() => handleAction(transaction.transaction_id, 'Ready To Claim')}
            >
              <CheckCircle sx={{ color: 'green', mr: 1 }} />
            </IconButton>
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '20px' }}>

      <Typography variant="h4" gutterBottom>Generate Certificates</Typography>
      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{ marginBottom: "20px" }}
      >
        {/* Left Side: Title */}
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" fontWeight="bold">
            Dashboard / Generate Certificates
          </Typography>
        </Grid>

        {/* Right Side: Search Button + Field */}
        <Grid item xs={12} sm={6}>
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            sx={{ width: '100%' }}
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total"
            value={totalRequests}
            percentage="Total requested certificates "
            icon={<FolderCopyIcon sx={{ color: "#fff" }} />}
        
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Approved"
            value={approvedRequests}
            percentage="Total request waiting to process"
            icon={<WatchLaterIcon sx={{ color: "#fff" }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="On Process"
            value={processRequests}
            percentage="Total request that processed"
            icon={<TaskIcon sx={{ color: "#fff" }} />}
           
          />
        </Grid>
      </Grid>




      <div style={{ height: 400, width: '100%' }}>

        <DataGrid
          rows={filteredTransactions}
          columns={columns}
          getRowId={(row) => row.transaction_id}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
          }} />
      </div>

    </div>
  );
};

export default CertificateGenerator;
