import { InformationCircleIcon } from '@heroicons/react/solid';
import { ReactNode, useState } from 'react';
import { useColorTheme } from '../../hooks/useColorTheme';
import Popover from './PopOver';

interface IInfoIcon {
  height?: string;
  width?: string;
  infoText: string;
  icon?: boolean;
  children?: ReactNode;
}

const InfoIcon = ({ height, width, infoText, icon, children }: IInfoIcon) => {
  const { theme } = useColorTheme();
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {icon && (
        <InformationCircleIcon
          className="hover:cursor-help"
          height={height || '1rem'}
          width={width || '1rem'}
          color={theme === 'dark' ? '#d1d5db' : '#3f3f46'}
        />
      )}
      {children}
      <Popover open={isHovered}>
        <div className="flex p-2 dark:bg-gray-700 bg-gray-500/50 rounded-lg">
          <div className="dark:text-gray-300 text-xs w-full whitespace-nowrap">{infoText}</div>
        </div>
      </Popover>
    </div>
  );
};

export default InfoIcon;
