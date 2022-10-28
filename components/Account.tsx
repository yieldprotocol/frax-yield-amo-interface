import { ConnectButton } from '@rainbow-me/rainbowkit';
import SettingsDropdown from './SettingsDropdown';

const Account = () => (
  <div className="flex justify-end items-center gap-2">
    <ConnectButton accountStatus="full" />
    <SettingsDropdown />
  </div>
);

export default Account;
