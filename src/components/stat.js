import React from "react";
import { Card, Box, Typography, Avatar, useTheme } from "@mui/material";
import { styled } from "@mui/system";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(2),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  minWidth: 280,
  boxShadow: theme.palette.mode === "dark"
    ? "0 2px 8px rgba(255,255,255,0.05)"
    : "0 2px 8px rgba(0,0,0,0.05)",
  backgroundColor: theme.palette.background.paper,
}));

const StatCard = ({ title, value, percentage, icon }) => {
  const theme = useTheme();

  return (
    <StyledCard>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          {value}
        </Typography>
        <Typography
          variant="body2"
        >
          {percentage}
        </Typography>
      </Box>
      <Avatar
        sx={{
          bgcolor: theme.palette.mode === "dark" ? "#2c2c2e" : "#1c1c1e",
          width: 48,
          height: 48,
          borderRadius: 2,
          boxShadow: 3,
          color: "white",
        }}
      >
        {icon}
      </Avatar>
    </StyledCard>
  );
};

export default StatCard;
