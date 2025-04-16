import React from "react";
import { Card, CardContent, Typography, useTheme } from "@mui/material";
import { motion } from "framer-motion";

const StatisticCard = ({ title, value, icon, color }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  // Create a background color that adjusts to dark/light mode
  const backgroundColor = isDarkMode
    ? `${color}50` // lighter transparent color for dark mode
    : `${color}20`; // slightly stronger for light mode

  const textColor = isDarkMode ? "#fff" : "#333";

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <Card
        variant="outlined"
        sx={{
          minWidth: 200,
          borderRadius: 3,
          boxShadow: 3,
          background: backgroundColor,
          borderLeft: `6px solid ${color}`,
          textAlign: "center",
          p: 2,
        }}
      >
        <CardContent>
          <span style={{ fontSize: 40, color, marginBottom: 8 }}>{icon}</span>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: textColor }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: "bold", color }}>
            {value}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatisticCard;
