import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, Typography, Button
} from '@mui/material';
import Swal from 'sweetalert2';
import StatsDisplay from './StatsDisplay';

const CertificateGenerator = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  const showCertificateDetails = (certificateDetails) => {
    const formattedDetails = Object.entries(certificateDetails)
      .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
      .join("<br>");

    Swal.fire({
      title: "<h2 class='text-lg font-semibold'>Certificate Information</h2>",
      html: `<div class='text-left p-4 bg-gray-100 rounded-lg text-sm leading-6'>${formattedDetails}</div>`,
      icon: "info",
      confirmButtonText: "Close",
      customClass: {
        popup: "w-[90%] md:w-[400px] p-6",
        title: "text-lg md:text-xl",
        confirmButton: "text-sm md:text-base px-5 py-2 bg-[#4CAF50] text-white rounded-lg",
      },
    });
  };

  // Fetch Transactions from API
  const fetchData = async () => {
    try {
      Swal.fire({
        title: 'Loading...',
        text: 'Fetching transaction data.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const response = await fetch('https://bned-backend.onrender.com/api/get_transaction');
      const data = await response.json();

      console.log("API Response:", data); // Debugging

      const transactions = data.transactions || [];

      setTransactions(transactions);
      setFilteredTransactions(transactions);

      Swal.close();
    } catch (error) {
      Swal.close();
      console.error('Error fetching transaction data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not fetch transaction data. Please try again later.',
      });
    }
  };

  useEffect(() => {
    const approvedFiltered = transactions.filter(t => t.status === 'Approved' || t.status ==='On Process');
  
    const filtered = approvedFiltered.filter((transaction) =>
      transaction.transaction_id.toString().includes(searchTerm) ||
      (transaction.resident_email && transaction.resident_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.date_requested && transaction.date_requested.includes(searchTerm))
    );
  
    setFilteredTransactions(filtered);
  }, [searchTerm, transactions]);
  

  const approvedRequests = transactions.filter(t => t.status === 'Approved').length;
  const totalRequests = transactions.length;
  const pendingRequests = transactions.filter(t => t.status === 'Pending').length;

  const handleAction = async (transactionId, actionType) => {
    const transaction = transactions.find(t => t.transaction_id === transactionId);

    if (actionType === 'Generate') {
      if (transaction.status === 'On Process') {
        Swal.fire({
          icon: 'info',
          title: 'Notice',
          text: 'The document has already been generated.',
        });
        return;
      }
  
      const result = await Swal.fire({
        title: 'Are you sure you want to generate the certificate?',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        icon: 'question',
      });
  
      if (result.isConfirmed) {
        // First, update the status to "On Process"
        try {
          const updateResponse = await fetch(`https://bned-backend.onrender.com/certificate_transaction/${transactionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: "On Process" })
          });
  
          if (!updateResponse.ok) {
            throw new Error('Failed to update transaction status.');
          }
  
          // Refresh transactions after status update
          await fetchData();
  
          // Now, generate the certificate
          generateCertificate(transaction.certificate_details);
          
        } catch (error) {
          console.error("Error updating status:", error);
          Swal.fire('Error!', 'Failed to update transaction status. Please try again.', 'error');
        }
      }
      return;
    }
  
    if (actionType === 'Ready To Claim' && transaction.status !== 'On Process') {
      Swal.fire({
        icon: 'info',
        title: 'Notice',
        text: 'Only transactions that has been processed can be remark as ready to claim!".',
      });
      return;
    }
  
    const result = await Swal.fire({
      title: `Are you sure you want to mark this request as "${actionType}"?`,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      icon: 'warning',
    });
  
    if (result.isConfirmed) {
      Swal.fire({
        title: 'Processing...',
        text: 'Please wait while we update the transaction status.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
  
      try {
        const response = await fetch(`https://bned-backend.onrender.com/certificate_transaction/${transactionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: actionType, date_issued: null }) // "Ready To Claim"
        });
  
        if (!response.ok) {
          throw new Error('Failed to update transaction');
        }
  
        await fetchData(); // Refresh transactions
  
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `The request has been marked as "${actionType}".`,
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error updating transaction:', error);
        Swal.fire('Error!', 'Failed to update transaction. Please try again.', 'error');
      }
    }
  };
  
  const generateCertificate = async (certificateDetails) => {
    if (!certificateDetails.templateName) {
      certificateDetails.templateName = certificateDetails.template;
    }
  
    const requestData = { templateName: certificateDetails.templateName };
  
    const TEMPLATE_FIELDS = {
      indigency: ["fullName", "age", "purok", "maritalStatus","purpose"],
      good_moral: ["fullName", "age", "purok", "maritalStatus","purpose"],
      clearance: ["name", "purpose", "date_issued"]
    };
  
    // Ensure correct field names
    TEMPLATE_FIELDS[certificateDetails.templateName].forEach((field) => {
 
        requestData[field] = certificateDetails[field];
      
    });
  
    console.log("Request Data:", requestData); // Debugging
  
    try {
      Swal.fire({
        title: 'Generating Certificate...',
        text: 'Please wait while we generate the certificate.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
  
      const response = await fetch("https://bned-backend.onrender.com/api/generate-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      });
  
      if (!response.ok) {
        throw new Error(await response.text());
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${certificateDetails.fullName +" "+ certificateDetails.templateName}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  
      Swal.close();
    } catch (error) {
      Swal.close();
      alert("Error: " + error.message);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Certificate Requests
      </Typography>
      <StatsDisplay
        totalRequest={totalRequests}
        approved={approvedRequests}
        pendingRequests={pendingRequests}
      />
      <TextField
        label="Search..."
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          width: '100%',
          marginBottom: '10px',
          '& .MuiOutlinedInput-root': { '& fieldset': { border: 'none' } }
        }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center"><strong>Transaction ID</strong></TableCell>
              <TableCell align="center"><strong>Resident ID</strong></TableCell>
              <TableCell align="center"><strong>Email</strong></TableCell>
              <TableCell align="center"><strong>Certification</strong></TableCell>
              <TableCell align="center"><strong>Date Requested</strong></TableCell>
              <TableCell align="center"><strong>Certificate Details</strong></TableCell>
              <TableCell align="center"><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.transaction_id} hover>
                  <TableCell align="center">{transaction.transaction_id}</TableCell>
                  <TableCell align="center">{transaction.resident_id}</TableCell>
                  <TableCell align="center">{transaction.resident_email || 'N/A'}</TableCell>
                  <TableCell align="center">{transaction.certificate_type}</TableCell>
                  <TableCell align="center">{new Date(transaction.date_requested).toLocaleString()}</TableCell>
                  <TableCell
                    align="center"
                    onClick={() => showCertificateDetails(transaction.certificate_details)}
                    style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                  >
                    View Details
                  </TableCell>

                  <TableCell align="center">{transaction.status}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={() => handleAction(transaction.transaction_id, 'Generate')}
                      style={{ marginRight: '10px' }}
                    >
                      Generate
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleAction(transaction.transaction_id, 'Ready To Claim')}
                    >
                      Completed
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default CertificateGenerator;
