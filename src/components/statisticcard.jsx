import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { motion } from "framer-motion";

const StatisticCard = ({ title, value, icon, color }) => {
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
          background: color + "20", // Light transparent background based on status color
          borderLeft: `6px solid ${color}`,
          textAlign: "center",
          p: 2
        }}
      >
        <CardContent>
          <span style={{ fontSize: 40, color, marginBottom: 8 }}>{icon}</span>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
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
