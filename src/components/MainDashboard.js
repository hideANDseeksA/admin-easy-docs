import React, { useState } from 'react';
import Swal from 'sweetalert2';
import {
  Box,
  CssBaseline,
  Toolbar,
  AppBar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Collapse,
} from '@mui/material';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';

import BookIcon from '@mui/icons-material/Book';
import FolderIcon from '@mui/icons-material/Folder';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';

import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

// Import your components
import Home from './Home';
import TransactionLogs from './Requested_Certificate_logs';

import ResidentList from './ResidentList';
import AddResisdent from './AddResident';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import CurrentRequest from './Requested_Certification';
import CertifcateGenerator from './Certificate_Generator';

const drawerWidth = 250;

const MainDashboard = () => {
  const [open, setOpen] = useState(false);
  const [transactionOpen, settransactionOpen] = useState(false);
  const [residentOpen, setresidentOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleBooksClick = () => {
    settransactionOpen(!transactionOpen);
  };
  const handleReportsClick = () => {
    setReportOpen(!reportOpen);
  };

  const handleResearchClick = () => {
    setresidentOpen(!residentOpen);
  };

  const handleSignOut = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to sign out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, sign me out!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        signOut(auth)
          .then(() => {
            Swal.fire('Signed out!', 'You have been signed out successfully.', 'success');
          })
          .catch((error) => {
            Swal.fire('Error!', `Error signing out: ${error.message}`, 'error');
          });
      }
    });
  };

  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />

        {/* AppBar */}
        <AppBar
          position="fixed"
          sx={{
            width: open ? `calc(100% - ${drawerWidth}px)` : '100%',
            marginLeft: open ? `${drawerWidth}px` : 0,
            transition: (theme) =>
              theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Barangay Man-Ogob Easy Docs
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Drawer */}
        <Drawer
          variant="persistent"
          open={open}
          sx={{
            width: 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar /> {/* Optional: To align with AppBar */}
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <List sx={{ flexGrow: 1, padding: 0 }}>
              <ListItem button component={Link} to="/" onClick={toggleDrawer}>
                <ListItemIcon><HomeIcon /></ListItemIcon>
                <ListItemText primary="Home" />
              </ListItem>
           

              <ListItem button onClick={handleBooksClick}>
                <ListItemIcon><BookIcon /></ListItemIcon>
                <ListItemText primary="Transaction" />
                {transactionOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={transactionOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem
                    button
                    component={Link}
                    to="/Transaction/current"
                    onClick={toggleDrawer}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon><AssignmentReturnIcon /></ListItemIcon>
                    <ListItemText primary="Requested Certification" />
                  </ListItem>
                  <ListItem
                    button
                    component={Link}
                    to="/Transaction/approved"
                    onClick={toggleDrawer}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon><AssignmentReturnIcon /></ListItemIcon>
                    <ListItemText primary="Certificate Generator" />
                  </ListItem>
                </List>
              </Collapse>




              <ListItem button onClick={handleResearchClick}>
                <ListItemIcon><FolderIcon /></ListItemIcon>
                <ListItemText primary="Residents Records" />
                {residentOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={residentOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem
                    button
                    component={Link}
                    to="/Residents Records/list"
                    onClick={toggleDrawer}
                    sx={{ pl: 4 }}>
                    <ListItemIcon><FolderCopyIcon /></ListItemIcon>
                    <ListItemText primary="Residents List" />
                  </ListItem>
                  <ListItem
                    button
                    component={Link}
                    to="/Residents Records/add"
                    onClick={toggleDrawer}
                    sx={{ pl: 4 }}>
                    <ListItemIcon><CreateNewFolderIcon /></ListItemIcon>
                    <ListItemText primary="Add || Update Record" />
                  </ListItem>
                </List>
              </Collapse>

              <Divider />

              {/* Reports */}
              <ListItem button onClick={handleReportsClick}>
                <ListItemIcon><BarChartIcon /></ListItemIcon>
                <ListItemText primary="Reports" />
                {reportOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={reportOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
              
                  <ListItem
                    button
                    component={Link}
                    to="/Reports/logs"
                    onClick={toggleDrawer}
                    sx={{ pl: 4 }}>
                    <ListItemIcon><ManageHistoryIcon /></ListItemIcon>
                    <ListItemText primary="Request logs" />
                  </ListItem>
                </List>
              </Collapse>
            </List>

            {/* Sign Out Button at the bottom */}
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<LogoutIcon />}
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </Box>
          </Box>
        </Drawer>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 0,
            transition: (theme) =>
              theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            marginLeft: open ? `${drawerWidth}px` : 0,
            width: '100%',
            height: '100vh',
            boxSizing: 'border-box',
          }}
        >
          <Toolbar />
          <Routes>
            <Route path="/" element={<Home />} />
          
            {/* Nested Routes for Books */}
            <Route path="/Transaction">
              <Route path="current" element={<CurrentRequest />} />
              <Route path="approved" element={<CertifcateGenerator />} />
            </Route>

         

            <Route path="/Residents Records">
              <Route path="list" element={<ResidentList />} />
              <Route path="add" element={<AddResisdent />} />
          
            </Route>


            <Route path="/reports">
              <Route path="logs" element={<TransactionLogs />} />
            </Route>


            {/* Optionally, add a fallback route */}
            <Route path="*" element={<Typography variant="h4">Page Not Found</Typography>} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
};

export default MainDashboard;
