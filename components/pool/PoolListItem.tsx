import Link from 'next/link';
import { FC } from 'react';
import tw from 'tailwind-styled-components';

const Container = tw.button`w-full my-1.5 dark:hover:bg-gray-700/50 hover:bg-gray-400/50 dark:bg-gray-800/80 bg-gray-300 rounded-md shadow-md`;
const Inner = tw.div`align-middle text-left p-5`;

interface IPoolItem {}

const PoolListItem: FC<IPoolItem> = () => {
  const poolId = 1;
  return (
    <Link href={`/pool/${poolId}`} passHref>
      <Container>
        <Inner>
          <div className="font-bold">fyToken/Token Pool</div>
          <div className="flex gap-5 mt-3">
            <div className="text-sm">fyToken: balance</div>
            <div className="text-sm">token: balance</div>
          </div>
        </Inner>
      </Container>
    </Link>
  );
};

export default PoolListItem;
