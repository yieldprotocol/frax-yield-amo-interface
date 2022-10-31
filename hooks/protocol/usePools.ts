import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { useNetwork } from 'wagmi';
import { getPools } from '../../lib/protocol';
import { IPoolMap } from '../../lib/protocol/types';
import useDefaultProvider from '../useDefaultProvider';
import useTenderly from '../useTenderly';
import useContracts from './useContracts';

const usePools = (pools?: { [chainId: number]: IPoolMap }) => {
  const { chain } = useNetwork();
  const chainId = useMemo(() => (chain ? chain.id : 1), [chain]);
  const provider = useDefaultProvider();

  const { usingTenderly, tenderlyProvider, tenderlyStartBlock } = useTenderly();

  const [poolsToUse, setPoolsToUse] = useState<IPoolMap>();

  useEffect(() => {
    if (pools && pools[chainId]) {
      if (usingTenderly) {
        return setPoolsToUse(pools[0]); // 0 is tenderly chain id
      }

      setPoolsToUse(pools[chainId]);
    }
  }, [chainId, pools, usingTenderly]);

  const contractMap = useContracts(provider);
  const tenderlyContractMap = useContracts(tenderlyProvider!);

  const key = `/pools?chainId=${chainId}&usingTenderly=${usingTenderly}`;

  // don't need to get pools if we already got them from ssr
  const { data, error } = useSWR(
    poolsToUse ? null : key,
    () =>
      getPools(
        provider,
        contractMap!,
        chainId,
        usingTenderly,
        tenderlyContractMap,
        tenderlyStartBlock,
        tenderlyProvider
      ),
    {
      revalidateOnFocus: false,
      dedupingInterval: 3_600_000, // dont duplicate a request w/ same key for 1hr
    }
  );

  return {
    data: poolsToUse || data,
    loading: !data && !error,
    error,
  };
};

export default usePools;
