import { XMarkIcon } from '@heroicons/react/20/solid';
import { useColorTheme } from '../../hooks/useColorTheme';

interface ICloseButton {
  action: () => void;
  height?: string;
  width?: string;
}
const CloseButton = ({ action, height, width }: ICloseButton) => {
  const { theme } = useColorTheme();
  return (
    <XMarkIcon
      className="hover:cursor-pointer"
      height={height || '1.5rem'}
      width={width || '1.5rem'}
      color={theme === 'dark' ? '#e4e4e7' : '#18181b'}
      onClick={action}
    />
  );
};

export default CloseButton;
