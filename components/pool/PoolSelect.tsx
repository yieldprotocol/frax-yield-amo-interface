import { useState } from 'react';
import tw from 'tailwind-styled-components';
import usePools from '../../hooks/protocol/usePools';
import { IPool } from '../../lib/protocol/types';
import Spinner from '../common/Spinner';
import PoolSelectItem from './PoolSelectItem';
import PoolSelectModal from './PoolSelectModal';

const ButtonInner = tw.div`
  h-full w-full dark:bg-gray-900/80 bg-gray-100/50 dark:text-gray-50 text-gray-900 rounded-lg
  flex p-3 gap-3 justify-center
`;

const ButtonOuter = tw.button`w-full flex p-[1px]
rounded-lg gap-3 align-middle items-center hover:opacity-80
`;

interface IPoolSelect {
  pool: IPool | undefined;
  pools?: IPool[];
  setPool?: (pool: IPool) => void;
  poolsLoading?: boolean;
}

const PoolSelect = ({ pools, pool, setPool, poolsLoading }: IPoolSelect) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { error } = usePools();

  return (
    <div className="h-12">
      {pool ? (
        <PoolSelectItem pool={pool} action={pools ? () => setModalOpen(true) : undefined} />
      ) : (
        <ButtonOuter
          onClick={() => setModalOpen(true)}
          disabled={poolsLoading || !pools}
          style={{
            background: `linear-gradient(135deg, #f7953380, #f3705580, #ef4e7b80, #a166ab80, #5073b880, #1098ad80, #07b39b80, #6fba8280)`,
          }}
        >
          <ButtonInner>
            {poolsLoading && <Spinner />}
            {error
              ? 'Error fetching pools'
              : pools
              ? 'Select Series'
              : poolsLoading
              ? 'Series loading...'
              : 'No Series Detected'}
          </ButtonInner>
        </ButtonOuter>
      )}
      {modalOpen && <PoolSelectModal pools={pools!} open={modalOpen} setOpen={setModalOpen} action={setPool!} />}
    </div>
  );
};

export default PoolSelect;
