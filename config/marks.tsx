import DAIMark from '../components/common/logos/DAIMark';
import ETHMark from '../components/common/logos/ETHMark';
import FRAXMark from '../components/common/logos/FRAXMark';
import USDCMark from '../components/common/logos/USDCMark';

interface IMark {
  component: JSX.Element;
  color: string;
}

export const marks: { [symbol: string]: IMark } = {
  DAI: { component: <DAIMark key="DAI" />, color: '#F5AC37' },
  ETH: { component: <ETHMark key="ETH" />, color: '#627EEA' },
  USDC: { component: <USDCMark key="USDC" />, color: '#3E73C4' },
  FRAX: { component: <FRAXMark key="FRAX" />, color: '#000000' },
};
