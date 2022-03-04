import { XIcon } from '@heroicons/react/solid';
import { useColorTheme } from '../../hooks/useColorTheme';

interface ICloseButton {
  action: () => void;
  height?: string;
  width?: string;
}
const CloseButton = ({ action, height, width }: ICloseButton) => {
  const { theme } = useColorTheme();
  return (
    <XIcon
      className="hover:cursor-pointer"
      height={height || '1rem'}
      width={width || '1rem'}
      color={theme === 'dark' ? '#e4e4e7' : '#18181b'}
      onClick={action}
    />
  );
};

export default CloseButton;
