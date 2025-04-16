// useSwalTheme.js
import Swal from 'sweetalert2';
import { useTheme } from '@mui/material';

const useSwalTheme = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return Swal.mixin({
    background: isDark ? "#1e1e1e" : "#fff",
    color: isDark ? "#fff" : "#000",
    customClass: {
      popup: "w-[90%] md:w-[400px] p-6",
      title: "text-lg md:text-xl",
      confirmButton: "text-sm md:text-base px-5 py-2 bg-[#4CAF50] text-white rounded-lg",
    },
  });
};

export default useSwalTheme;
