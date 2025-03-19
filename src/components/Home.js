import React, { useEffect, useState } from 'react';
import {
    Grid, Box, Card, Typography
} from '@mui/material';
import Swal from 'sweetalert2';
import { FaCheckCircle, FaClock, FaCog, FaClipboardCheck } from "react-icons/fa";
import StatisticCard from "./statisticcard";
import { BarChart } from '@mui/x-charts/BarChart';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import { dataset, valueFormatter } from './weather';
import { PieChart } from '@mui/x-charts/PieChart';
import { desktopOS, valueFormatters } from './data';
import HomeIcon from '@mui/icons-material/Home';

const Home = () => {
    const [certificateRequests, setCertificateRequests] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [filteredRequests, setFilteredRequests] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                Swal.fire({
                    title: 'Loading...',
                    text: 'Fetching certificate requests.',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading(),
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

    const approveCount = certificateRequests.filter(req => req.status === 'Approved').length;
    const pendingCount = certificateRequests.filter(req => req.status === 'Pending').length;
    const processingCount = certificateRequests.filter(req => req.status === 'On Process').length;
    const readyCount = certificateRequests.filter(req => req.status === 'Ready To Claim').length;

    const chartSetting = {
        yAxis: [{ label: 'Number of Request', margin: '10px' }],
        height: 300,
        sx: {
            [`.${axisClasses.left} .${axisClasses.label}`]: { transform: 'translate(-10px, 0)' },
            [`.${axisClasses.left}`]: { marginLeft: '20px' },
        },
    };

    return (
        <Box sx={{ padding: '20px', backgroundColor: '#ffffff', height: '500px', width: '100%' }}>
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
                    <StatisticCard title="Approved Request" value={approveCount} icon={<FaCheckCircle />} color="#2ecc71" />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <StatisticCard title="Pending Request" value={pendingCount} icon={<FaClock />} color="#f39c12" />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <StatisticCard title="On Process Request" value={processingCount} icon={<FaCog />} color="#3498db" />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <StatisticCard title="Claimable Request" value={readyCount} icon={<FaClipboardCheck />} color="#9b59b6" />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ padding: '20px' }}>
                        <Typography variant="h6" gutterBottom>Vulnerable Sectors</Typography>
                        <PieChart
                            label
                            series={[{
                                data: desktopOS,
                                highlightScope: { fade: 'global', highlight: 'item' },
                                faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                                valueFormatters,
                            }]}
                            height={200}
                        />
                    </Card>
                </Grid>
            </Grid>

            <Card sx={{ padding: '20px', marginTop: '20px' }}>
                <Typography variant="h6" gutterBottom>Certification Overview Over Months</Typography>
                <BarChart
                    dataset={dataset}
                    xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
                    series={[
                        { dataKey: 'london', label: 'Completed', valueFormatter },
                        { dataKey: 'paris', label: 'Cancelled', valueFormatter },
                        { dataKey: 'newYork', label: 'Rejected', valueFormatter },
                    ]}
                    {...chartSetting}
                    sx={{ width: '100%' }}
                />
            </Card>
        </Box>
    );
};

export default Home;