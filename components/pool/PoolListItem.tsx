import Link from 'next/link';
import { FC } from 'react';
import tw from 'tailwind-styled-components';
import { IPool } from '../../lib/protocol/types';
import { cleanValue } from '../../utils/appUtils';
import AssetLogo from '../common/AssetLogo';
import FyTokenLogo from '../common/FyTokenLogo';

const Container = tw.button`w-full my-1.5 dark:hover:opacity-80 hover:bg-gray-400/50 dark:bg-gray-800/80 bg-gray-300 rounded-md shadow-md`;
const Inner = tw.div`align-middle text-left p-3`;
const PoolDataWrap = tw.div`my-2 flex items-center gap-3`;
const PoolDataLabel = tw.div`dark:text-gray-400 text-gray-500`;
const PoolData = tw.div`font-medium dark:text-gray-100 text-gray-800`;
const Header = tw.div`text-lg font-bold text-left justify-items-start align-middle dark:text-gray-50`;

const ItemInner = tw.div`
  h-full w-full dark:bg-black/80 bg-gray-200/70 dark:text-gray-50 text-gray-900 rounded-lg
  flex gap-3 px-5 p-1
`;

const ItemOuter = tw.div`
  hover:opacity-80 w-full flex p-[1px] rounded-lg gap-3 align-middle items-center
`;

interface IPoolListItem {
  pool: IPool;
}

const PoolListItem: FC<IPoolListItem> = ({ pool }) => (
  <Link href={`/pool/${pool.address}`} passHref>
    <Container>
      <ItemOuter
        style={{
          background: pool.alternateColor,
        }}
      >
        <ItemInner>
          <div className="z-0 relative items-center flex">
            <FyTokenLogo pool={pool} height={20} width={20} />
          </div>
          <div className="z-1 -ml-5 items-center flex">
            <AssetLogo image={pool.base.symbol} styleProps="h-[31px] w-[31px] rounded-full" />
          </div>
          <Inner>
            <Header>{pool.displayName}</Header>
            <PoolDataWrap>
              <PoolDataLabel>LP Token Balance:</PoolDataLabel>
              <PoolData>{cleanValue(pool.lpTokenBalance_, pool.base.digitFormat)}</PoolData>
            </PoolDataWrap>
          </Inner>
        </ItemInner>
      </ItemOuter>
    </Container>
  </Link>
);

export default PoolListItem;
