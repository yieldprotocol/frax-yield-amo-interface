// import InfoDropdown from './InfoDropdown';

import { ConnectButton } from '@rainbow-me/rainbowkit';

const Account = () => (
  <div className="flex justify-end items-center">
    <ConnectButton accountStatus="full" />
    {/* <InfoDropdown /> */}
  </div>
);

export default Account;
