// StatsDisplay.js
import React from 'react';
import { Card, CardContent, Grid, Typography } from '@mui/material';

const StatsDisplay = ({ totalRequest, approved, pendingRequests }) => {
  return (
    <Grid container spacing={2} justifyContent="center" sx={{ marginBottom: '20px' }}>
      <Grid item xs={12} sm={4}>
        <Card variant="outlined" className="stat-box">
          <CardContent style={{ textAlign: 'center' }}>
            <Typography variant="h6">Total Requests</Typography>
            <Typography variant="body1">{totalRequest}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Card variant="outlined" className="stat-box">
          <CardContent style={{ textAlign: 'center' }}>
            <Typography variant="h6">Approved</Typography>
            <Typography variant="body1">{approved}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Card variant="outlined" className="stat-box">
          <CardContent style={{ textAlign: 'center' }}>
            <Typography variant="h6">Pending Requests</Typography>
            <Typography variant="body1">{pendingRequests}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default StatsDisplay;
