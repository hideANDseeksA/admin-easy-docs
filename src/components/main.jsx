

import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useNavigate, Navigate } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import CloudCircleIcon from '@mui/icons-material/CloudCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FileOpen from '@mui/icons-material/FileOpen';
import { isTokenValid } from "../utils/tokenUtils"; // import utility
import {
  Menu,
  MenuItem,
} from "@mui/material";

import Diversity3Icon from '@mui/icons-material/Diversity3';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import useSwalTheme from '../utils/useSwalTheme';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout, ThemeSwitcher } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import SettingsIcon from '@mui/icons-material/Settings';

// Import Pages
import Home from './Home';
import RequestPage from './Requested_Certification';
import GeneratePage from './Certificate_Generator';
import ResidentList from './ResidentList';
import AddResident from './AddResident';
import RequestLogs from './Requested_Certificate_logs';
import { API_URL,headername,keypoint } from '../utils/config';






const NAVIGATION = [
  { kind: 'header', title: 'Main items' },
  { segment: '', title: 'Dashboard', icon: <DashboardIcon /> },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Certificate',
  },
  { segment: 'request', title: 'Requested Certificate', icon: <FileOpen /> },
  {
    segment: 'generate', title: 'Generate Certificate', icon: <DocumentScannerIcon />,
  },
  {
    kind: 'divider',
  },
  { segment: 'residents', title: 'Resident Records', icon: <Diversity3Icon /> },
  { segment: 'add-resident', title: 'Add Resident', icon: <GroupAddIcon /> },
  {
    kind: 'divider',
  },
  { segment: 'logs', title: 'Requested Certificate Logs', icon: <ManageHistoryIcon /> },
];

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function DemoPageContent({ pathname }) {
  const token = localStorage.getItem("authToken");
  const isValid = token && isTokenValid(token);

  if (!isValid) {
    return <Navigate to="/" />
      ;
  }

  switch (pathname) {
    case '/':
      return <Home />;
    case '/request':
      return <RequestPage />;
    case '/generate':
      return <GeneratePage />;
    case '/residents':
      return <ResidentList />;
    case '/add-resident':
      return <AddResident />;
    case '/logs':
      return <RequestLogs />;

    default:
      return <Home />;

  }
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function ToolbarActionsSearch() {
  
   const SwalInstance = useSwalTheme();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Loading...");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
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
    const socket = io(API_URL, {
      extraHeaders: {
    [headername]:keypoint
      },
    });

    socket.emit("getStatus");

    socket.on("Barangay Hall", (data) => {
      if (data?.error) {
        setStatus("Error fetching status");
        console.error("Socket error:", data.details);
      } else {
        setStatus(data || "Unavailable");
      }
    });

    socket.on("status_updated", (data) => {
      setStatus(data.status);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSignOut = () => {
    SwalInstance.fire({
      title: "Are you sure?",
      text: "You will be signed out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, sign out!",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("authToken");
        navigate("/", { replace: true });

        setTimeout(() => {
          window.history.pushState(null, null, window.location.href);
          window.onpopstate = () => {
            window.history.pushState(null, null, window.location.href);
          };
        }, 0);
      }
    });
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = async (newStatus) => {
    setAnchorEl(null);
    if (!checkInternet()) return;
    const result = await SwalInstance.fire({
      title: "Update Barangay Office Status",
      text: "Are you sure you want to update the status?",
      icon: "warning", // 'Notify' is not a valid SweetAlert2 icon
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Update!",
    });
  
    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/api/transaction/update_status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            [headername]:keypoint
          },
          body: JSON.stringify({ status: newStatus }),
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.error || "Failed to update status");
        }
  
        SwalInstance.fire({
          icon: "success",
          title: "Status Updated",
          text: `New status: ${newStatus}`,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Failed to update status:", error.message);
        SwalInstance.fire({
          icon: "error",
          title: "Error",
          text: error.message,
        });
      }
    }
  };
  

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography variant="subtitle2">Status: {status}</Typography>

      <Tooltip title="Sign Out" enterDelay={1000}>
        <div>
          <IconButton aria-label="log out" onClick={handleSignOut}>
            <PowerSettingsNewIcon />
          </IconButton>
        </div>
      </Tooltip>

      <Tooltip title="Update Status" enterDelay={1000}>
        <div>
          <IconButton onClick={handleMenuClick}>
            <SettingsIcon />
          </IconButton>
        </div>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleStatusChange("Open")}>Open</MenuItem>
        <MenuItem onClick={() => handleStatusChange("Closed")}>Closed</MenuItem>
        <MenuItem onClick={() => handleStatusChange("Lunch Break")}>Lunch Break</MenuItem>
      </Menu>

      <ThemeSwitcher />
    </Stack>
  );
}

function CustomAppTitle() {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <CloudCircleIcon fontSize="large" color="primary" />
      <Typography variant="h6">Easy Docs</Typography>
    </Stack>
  );
}



function SidebarFooter({ mini }) {
  return (
    <Typography variant="caption" sx={{ m: 1 }}>
      {mini ? '© Wise One' : `©  Made with love by Wise One`}
    </Typography>
  );
}

SidebarFooter.propTypes = {
  mini: PropTypes.bool.isRequired,
};



function DashboardLayoutSlots(props) {
  const { window } = props;
  const router = useDemoRouter('/');
  const demoWindow = window !== undefined ? window() : undefined;

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout
        defaultSidebarCollapsed
        slots={{
          appTitle: CustomAppTitle,
          toolbarActions: ToolbarActionsSearch,
          sidebarFooter: SidebarFooter,
        }}
      >
        <DemoPageContent pathname={router.pathname} />
      </DashboardLayout>
    </AppProvider>
  );
}

DashboardLayoutSlots.propTypes = {
  window: PropTypes.func,
};

export default DashboardLayoutSlots;
