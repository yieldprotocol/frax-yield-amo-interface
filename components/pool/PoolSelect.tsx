import { FC, useState } from 'react';
import tw from 'tailwind-styled-components';
import { IPool, IPoolMap } from '../../lib/protocol/types';
import PoolSelectItem from './PoolSelectItem';
import PoolSelectModal from './PoolSelectModal';

const ButtonInner = tw.div`
  h-full w-full dark:bg-gray-900/80 bg-gray-100/80 dark:text-gray-50 text-gray-900 rounded-lg
  flex p-3 gap-3 justify-center
`;

const ButtonOuter = tw.button`w-full flex p-[1px]
rounded-lg gap-3 align-middle items-center hover:opacity-80
`;

interface IPoolSelect {
  pools: IPoolMap | undefined;
  pool: IPool | undefined;
  setPool: (pool: IPool) => void;
  poolsLoading?: boolean;
}

const PoolSelect: FC<IPoolSelect> = ({ pools, pool, setPool, poolsLoading }) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  return (
    <div className="h-12">
      {pool ? (
        <PoolSelectItem pool={pool} action={() => setModalOpen(true)} />
      ) : (
        <ButtonOuter
          onClick={() => setModalOpen(true)}
          disabled={poolsLoading}
          style={{
            background: `linear-gradient(135deg, #f7953380, #f3705580, #ef4e7b80, #a166ab80, #5073b880, #1098ad80, #07b39b80, #6fba8280)`,
          }}
        >
          <ButtonInner>{poolsLoading ? 'Pools loading...' : 'Select Pool'}</ButtonInner>
        </ButtonOuter>
      )}
      {modalOpen && <PoolSelectModal pools={pools!} open={modalOpen} setOpen={setModalOpen} action={setPool} />}
    </div>
  );
};

export default PoolSelect;
