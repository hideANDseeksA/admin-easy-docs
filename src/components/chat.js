import React, { useEffect, useState } from 'react';
import { Card, Typography, Select, MenuItem, FormControl, InputLabel, Grid } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import Swal from 'sweetalert2';
import { API_URL,headername,keypoint } from '../utils/config';
const TransactionChart = () => {
    const currentYear = new Date().getFullYear(); // Get the current year
    const [timeFrame, setTimeFrame] = useState("monthly");
    const [selectedYear, setSelectedYear] = useState(currentYear.toString()); // Default to current year
    const [chartData, setChartData] = useState({ yearlyData: [], monthlyData: [], weeklyData: [] });

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                Swal.fire({
                    title: 'Loading...',
                    text: 'Fetching transaction history...',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading(),
                });

                const response = await fetch(`${API_URL}/api/transaction/graph-history`,{
                    headers: {
                        [headername]:keypoint
                      }
                }); // Replace with your API URL
              
                const data = await response.json();

                const convertToNumbers = (dataArray) => 
                    dataArray.map(item => ({
                        ...item,
                        completed: Number(item.completed),
                        cancelled: Number(item.cancelled),
                        rejected: Number(item.rejected)
                    }));

                setChartData({
                    yearlyData: convertToNumbers(data.yearlyData),
                    monthlyData: convertToNumbers(data.monthlyData),
                    weeklyData: convertToNumbers(data.weeklyData),
                });

                Swal.close();
            } catch (error) {
                Swal.close();
                console.error('Error fetching chart data:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Could not fetch chart data. Please try again later.',
                });
            }
        };

        fetchChartData();
    }, []);

    // Extract unique years from the dataset
    const availableYears = [...new Set([...chartData.monthlyData, ...chartData.weeklyData].map(d => d.year))];

    // Filter data based on selected time frame and year
    const selectedData = timeFrame === "yearly"
        ? chartData.yearlyData
        : chartData[timeFrame + "Data"].filter(d => d.year === selectedYear);

    return (
        <Card sx={{ padding: '20px', marginTop: '20px' }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>Time Frame</InputLabel>
                        <Select value={timeFrame} onChange={(e) => {
                            setTimeFrame(e.target.value);
                            setSelectedYear(availableYears[0] || currentYear.toString()); // Reset year selection
                        }}>
                            <MenuItem value="yearly">Yearly</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                            <MenuItem value="weekly">Weekly</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {timeFrame !== "yearly" && (
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Year</InputLabel>
                            <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                                {availableYears.map(year => (
                                    <MenuItem key={year} value={year}>{year}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                )}
            </Grid>

            <Typography variant="h6" sx={{ marginTop: 2 }}>Transaction Overview</Typography>
            
            <LineChart
                xAxis={[
                    {
                        scaleType: 'band',
                        dataKey: timeFrame === 'yearly' ? 'year' 
                                : timeFrame === 'monthly' ? 'month' 
                                : 'week',
                    },
                ]}
                series={[
                    { dataKey: 'completed', label: 'Completed', color: '#2ecc71' },
                    { dataKey: 'cancelled', label: 'Cancelled', color: '#f39c12' },
                    { dataKey: 'rejected', label: 'Rejected', color: '#e74c3c' },
                ]}
                dataset={selectedData}
                height={300}
                sx={{ width: '100%' }}
            />
        </Card>
    );
};

export default TransactionChart;
