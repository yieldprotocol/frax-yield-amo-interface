import tw from 'tailwind-styled-components';
import { IPool } from '../../lib/protocol/types';
import AssetLogo from '../common/AssetLogo';

type ButtonProps = {
  $selectable: boolean;
};

const Inner = tw.div`
  h-full w-full dark:bg-black/80 bg-gray-200/70 dark:text-gray-50 text-gray-900 rounded-lg
  flex p-3 gap-3
`;

const Outer = tw.button<ButtonProps>`${(p: any) =>
  p.$selectable ? 'hover:opacity-80' : 'cursor-default'} w-full flex p-[1px]
rounded-lg gap-3 align-middle items-center`;

interface IPoolSelectItem {
  pool: IPool;
  action?: (pool: IPool) => void;
}

const PoolSelectItem = ({ pool, action }: IPoolSelectItem) => (
  <Outer
    style={{
      background: pool.alternateColor,
    }}
    key={pool.address}
    onClick={() => action && action!(pool)}
    $selectable={!!action}
  >
    <Inner>
      <AssetLogo image={pool.base.symbol} />
      {pool.displayName}
    </Inner>
  </Outer>
);

export default PoolSelectItem;
