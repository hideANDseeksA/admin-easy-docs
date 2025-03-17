import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import { CheckCircle, DoneAll, Cancel } from "@mui/icons-material";

const ModernMenu = ({ anchorEl, handleClose, handleAction, selectedRequest }) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleClose}
      sx={{ boxShadow: 3, borderRadius: 2 }}
    >
      <MenuItem onClick={() => handleAction("Approved", selectedRequest)}>
        <ListItemIcon>
          <CheckCircle sx={{ color: "green" }} />
        </ListItemIcon>
        <ListItemText primary="Approve" />
      </MenuItem>

      <MenuItem onClick={() => handleAction("Completed", selectedRequest)}>
        <ListItemIcon>
          <DoneAll sx={{ color: "blue" }} />
        </ListItemIcon>
        <ListItemText primary="Mark as Completed" />
      </MenuItem>

      <Divider />

      <MenuItem onClick={() => handleAction("Cancelled", selectedRequest)}>
        <ListItemIcon>
          <Cancel sx={{ color: "red" }} />
        </ListItemIcon>
        <ListItemText primary="Reject" />
      </MenuItem>
    </Menu>
  );
};

export default ModernMenu;
