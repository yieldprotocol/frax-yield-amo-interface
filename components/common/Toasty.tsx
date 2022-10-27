import { XMarkIcon } from '@heroicons/react/20/solid';
import { ToastContainer } from 'react-toastify';
import { useColorTheme } from '../../hooks/useColorTheme';
import 'react-toastify/dist/ReactToastify.css';

const Toasty = () => {
  const { theme } = useColorTheme();

  return (
    <ToastContainer
      toastClassName={() =>
        'bg-gray-300 dark:bg-gray-900 text-gray-800 dark:text-gray-50 relative flex p-3 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer'
      }
      position="bottom-right"
      pauseOnHover
      closeOnClick
      closeButton={({ closeToast }) => (
        <XMarkIcon height="1rem" width="1rem" color={theme === 'dark' ? '#e4e4e7' : '#18181b'} onClick={closeToast} />
      )}
      autoClose={5000}
    />
  );
};

export default Toasty;
