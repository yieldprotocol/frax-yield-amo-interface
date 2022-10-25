import { ReactNode } from 'react';
import tw from 'tailwind-styled-components';
import Spinner from './Spinner';

const Style = tw.button`flex gap-3 items-center justify-center bg-primary-400/70 h-full w-full px-4 py-2.5 dark:text-white text-gray-50 rounded-lg hover:opacity-80`;

interface IButton {
  action: () => void;
  disabled?: boolean;
  loading?: boolean;
  children?: ReactNode;
}

const Button = ({ action, disabled, loading, children }: IButton) => (
  <Style onClick={action} disabled={disabled}>
    {loading && <Spinner />}
    {children}
  </Style>
);

export default Button;
