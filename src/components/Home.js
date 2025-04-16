import React, { useEffect, useState } from 'react';
import {
    Grid, Box, Card, Typography,
} from '@mui/material';
import { FaArrowsDownToPeople } from "react-icons/fa6";
import { FaPeopleGroup } from "react-icons/fa6";
import { IoPeopleSharp } from "react-icons/io5";
import StatisticCard from "./statisticcard";
import { PieChart } from '@mui/x-charts/PieChart';
import HomeIcon from '@mui/icons-material/Home';
import TransactionChart from './chat'; 
import axios from "axios";
import useSwalTheme from '../utils/useSwalTheme';
import Table from './user';

import { API_URL,headername,keypoint } from '../utils/config';

const Home = () => {
  const [data, setData] = useState({
    total_residents: 0,
    active_voters: 0,
    non_active_voters: 0,
    vulnerable_count: 0,
    male_count: 0,  // Add male count
    female_count: 0,  // Add female count
  });
  const SwalInstance = useSwalTheme();

  useEffect(() => {
    // Show loading SweetAlert when the request starts
    SwalInstance.fire({
      title: 'Loading...',
      text: 'Fetching data from the server',
      allowOutsideClick: false,
      didOpen: () => {
        SwalInstance.showLoading();
      }
    });

    // Fetch data from the API
    axios.get(`${API_URL}/api/residents/get-summary`,{
        headers: {
            [headername]:keypoint
          },
    })
      .then(response => {
        setData(response.data); // Set the response data to state
        SwalInstance.close(); // Close the loading SweetAlert
      })
      .catch(err => {
        SwalInstance.close(); // Close the loading SweetAlert
        SwalInstance.fire({
          icon: 'error',
          title: 'Error fetching data',
          text: 'There was an issue fetching the data. Please try again.',
        });
        console.error("Error fetching data:", err);
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pieChartData = [
    { label: 'Male', value: data.male_count, color: '#3498db' },
    { label: 'Female', value: data.female_count, color: '#e74c3c' },
  ];

  return (
    <Box sx={{ padding: '20px', height: 'auto', width: '100%' }}>
      <Typography variant="h4" gutterBottom>Welcome Back</Typography>
      <Grid container spacing={2} alignItems="center" justifyContent="flex-start" sx={{ marginBottom: "20px" }}>
        <Grid item xs={12} sm="auto">
          <Typography variant="subtitle1">Good day, Admin! Let’s assist our residents efficiently.</Typography>
        </Grid>
        <Grid item xs={12} sm="auto">
          <Box display="flex" alignItems="center" gap={0.5} sx={{ minHeight: "40px" }}>
            <HomeIcon fontSize="medium" color="primary" />
            <Typography variant="subtitle1" fontWeight="bold">Dashboard / Home</Typography>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={3} justifyContent="center" sx={{ marginBottom: "20px" }}>
        <Grid item xs={12} sm={2}>
          <StatisticCard title="Total Residents" value={data.total_residents} icon={<FaPeopleGroup />} color="#2ecc71" />
        </Grid>
        <Grid item xs={12} sm={2}>
          <StatisticCard title="Resident Active Voters" value={data.active_voters} icon={<IoPeopleSharp />}  color="#3498db"/>
        </Grid>
        <Grid item xs={12} sm={2}>
          <StatisticCard title="Resident Non Voters" value={data.non_active_voters} icon={<IoPeopleSharp />} color="#FF0000" />
        </Grid>
        <Grid item xs={12} sm={2}>
          <StatisticCard title="Vulnerable Residents" value={data.vulnerable_count} icon={<FaArrowsDownToPeople />} color="#9b59b6" />
        </Grid>
        <Grid item xs={12} sm={4}>
        <Card sx={{ padding: '20px', borderRadius: 3, boxShadow: 3 }}>
          <Typography variant="h6" gutterBottom>Gender Distribution</Typography>
          <PieChart
            label
            series={[{
              data: pieChartData,
              innerRadius: 30,
              
              paddingAngle: 5,
              cornerRadius: 5,
          
              highlightScope: { fade: 'global', highlight: 'item' },
              faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
            }]}
            height={150}
            sx={{
              '& .MuiPieSlice-root': {
                transition: 'transform 0.3s ease',
                ':hover': {
                  transform: 'scale(1.1)',
                },
              },
              '& .MuiPieSlice-label': {
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#333',
              },
            }}
          />
        </Card>
      
      </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ marginTop: '20px' }}>
  <Grid item xs={12} md={6}>
    <Card sx={{ padding: '20px', height: '100%' }}>
      <Typography variant="h6" gutterBottom>Certification Overview</Typography>
      <TransactionChart />
    </Card>
  </Grid>
  <Grid item xs={12} md={6}>
    <Card sx={{ padding: '20px', height: '100%' }}>
      <Typography variant="h6" gutterBottom>User Table</Typography>
      <Table />
    </Card>
  </Grid>
</Grid>

    </Box>
  );
};

export default Home;
