import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import usePools from '../../hooks/protocol/usePools';
import { IPool } from '../../lib/protocol/types';
import Spinner from '../common/Spinner';
import PoolListItem from './PoolListItem';

const Container = tw.div`p-2 max-w-lg`;

const Pools = () => {
  const { data: pools, loading } = usePools();
  const [poolsList, setPoolsList] = useState<IPool[]>([]);

  useEffect(() => {
    if (pools) {
      const sortedPools = Object.values(pools).sort((a, b) => (a.maturity < b.maturity ? 1 : -1));
      setPoolsList(sortedPools);
    }
  }, [pools]);

  return (
    <Container>
      {!poolsList?.length && loading && (
        <>
          <div>Series loading...</div>
          <Spinner />
        </>
      )}
      {poolsList.map((p) => (
        <PoolListItem pool={p} key={p.address} />
      ))}
    </Container>
  );
};

export default Pools;
