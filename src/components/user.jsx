import * as React from 'react';
import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';

import useSwalTheme  from '../utils/useSwalTheme';
import { API_URL,headername,keypoint } from '../utils/config';
import {
  GridRowModes,
  DataGrid,
  GridActionsCellItem,
  GridRowEditStopReasons,
} from '@mui/x-data-grid';

export default function FullFeaturedCrudGrid() {
  const [rows, setRows] = React.useState([]);
  const [rowModesModel, setRowModesModel] = React.useState({});
  const SwalInstance = useSwalTheme();

  // Fetch user data from the API
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/get_user`,{
            headers: {
                "Content-Type": "application/json",
                [headername]:keypoint
              }
        }); // Replace PORT with your server's port
       
        const data = await response.json();
        // Map the API data to expected DataGrid format
        const formattedData = data.map((user) => ({
          id: user.user_id,
          email: user.email,
          verified: user.verified === true?"VERIFIED":"NOT VERIFIED",
        }));
        setRows(formattedData);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchData();
  }, []);

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
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



  const handleDeleteClick = (id) => async () => {
    if (!checkInternet()) return;
    const confirmation = await SwalInstance.fire({
      title: 'Are you sure?',
      text: 'This user will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });
  
    if (!confirmation.isConfirmed) return;
  
    // Show loading spinner
    SwalInstance.fire({
      title: 'Deleting...',
      allowOutsideClick: false,
      didOpen: () => {
        SwalInstance.showLoading();
      },
    });
  
    try {
      const response = await fetch(`${API_URL}/api/auth/delete_user`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          [headername]:keypoint
        },
        body: JSON.stringify({ user_id: id }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
  
      SwalInstance.fire('Deleted!', 'User has been removed.', 'success');
      setRows((prevRows) => prevRows.filter((row) => row.id !== id));
  
    } catch (error) {
      console.error('Delete failed:', error);
      SwalInstance.fire('Error', 'Failed to delete user.', 'error');
    }
  };
  

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const processRowUpdate = async (newRow) => {
    if (!checkInternet()) return;
    const updatedRow = { ...newRow, isNew: false };
  
    // Show confirmation dialog before proceeding
    const confirmation = await SwalInstance.fire({
      title: 'Are you sure?',
      text: 'Do you want to save the changes?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'Cancel',
    });
  
    if (!confirmation.isConfirmed) {
      // User canceled update — revert to original
      return rows.find((row) => row.id === newRow.id);
    }
  
    // Show loading spinner
    SwalInstance.fire({
      title: 'Saving...',
      allowOutsideClick: false,
      didOpen: () => {
        SwalInstance.showLoading();
      },
    });
  
    try {
      const response = await fetch(`${API_URL}/api/auth/update_user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          [headername]:keypoint
        },
        body: JSON.stringify({
          user_id: updatedRow.id,
          email: updatedRow.email,
        }),
      });
  
      const result = await response.json();
      SwalInstance.close(); // Hide loading
  
      if (!response.ok) {
        SwalInstance.fire('Error', result.error || 'Failed to update user.', 'error');
        return rows.find((row) => row.id === newRow.id);
      }
  
      SwalInstance.fire('Success', 'User updated successfully!', 'success');
  
      return {
        id: updatedRow.id,
        email: result.user.email,
        verified: result.user.verified ? "VERIFIED" : "NOT VERIFIED",
      };
  
    } catch (error) {
      console.error('API error:', error);
      SwalInstance.close();
      SwalInstance.fire('Error', 'Something went wrong. Please try again.', 'error');
      return rows.find((row) => row.id === newRow.id);
    }
  };
  
  

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns = [
    { field: 'id', headerName: 'Resident ID', flex: 1, editable: false },
    { field: 'email', headerName: 'Email', flex: 2, editable: true },
    { field: 'verified', headerName: 'Verified',flex: 1, editable: false },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{ color: 'primary.main' }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Box
      sx={{
        height: 450,
        width: '100%',
        '& .actions': { color: 'text.secondary' },
        '& .textPrimary': { color: 'text.primary' },
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        autoHeight={false}
      />
    </Box>
  );
}
