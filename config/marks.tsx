import FRAXMark from '../components/common/logos/FRAXMark';

interface IMark {
  component: JSX.Element;
  color: string;
}

export const marks: { [symbol: string]: IMark } = {
  FRAX: { component: <FRAXMark key="FRAX" />, color: '#000000' },
};
