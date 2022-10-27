import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import usePools from '../../hooks/protocol/usePools';
import { IPool } from '../../lib/protocol/types';
import PoolListItem from './PoolListItem';

const Container = tw.div`p-2 max-w-lg`;

const Pools = () => {
  const { data: pools, loading } = usePools();
  const [poolsList, setPoolsList] = useState<IPool[]>([]);

  useEffect(() => {
    if (pools) {
      const filteredPools = Object.values(pools);
      const sortedPools = filteredPools.sort((a, b) => (a.maturity < b.maturity ? 1 : -1));
      setPoolsList(sortedPools);
    }
  }, [pools]);

  if (loading) return null;

  return (
    <Container>
      {!poolsList?.length && <div>Your pool positions will show here.</div>}
      {poolsList.map((p) => (
        <PoolListItem pool={p} key={p.address} />
      ))}
    </Container>
  );
};

export default Pools;
