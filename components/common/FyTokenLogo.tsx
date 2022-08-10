import { IPool } from '../../lib/protocol/types';
import YieldMark from './YieldMark';

interface IFyTokenLogo {
  pool: IPool | undefined;
  height?: string | number;
  width?: string | number;
}

const FyTokenLogo = ({ pool, height, width }: IFyTokenLogo) => (
  <div className="rounded-full p-[1px] dark:text-gray-50" style={{ background: pool?.color! }}>
    <div className="p-1 bg-gray-50/80 rounded-full">
      <YieldMark height={height || 14} width={width || 14} colors={[pool?.startColor!, pool?.endColor!]} />
    </div>
  </div>
);

export default FyTokenLogo;
