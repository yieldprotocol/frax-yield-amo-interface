import { useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { useNetwork } from 'wagmi';
import { getPools } from '../../lib/protocol';
import { IPoolMap } from '../../lib/protocol/types';
import useDefaultProvider from '../useDefaultProvider';
import useTenderly from '../useTenderly';
import useContracts from './useContracts';

const usePools = () => {
  const { chain } = useNetwork();
  const chainId = useMemo(() => (chain ? chain.id : 1), [chain]);
  const provider = useDefaultProvider();

  const { usingTenderly, tenderlyProvider, tenderlyStartBlock } = useTenderly();
  const contractMap = useContracts(provider);
  const tenderlyContractMap = useContracts(tenderlyProvider!);

  const { data, error } = useSWR(
    `/pools?chainId=${chainId}&usingTenderly=${usingTenderly}`,
    () => getPools(provider, contractMap!, chainId, usingTenderly, tenderlyContractMap, tenderlyStartBlock),
    {
      revalidateOnFocus: false,
      dedupingInterval: 3_600_000, // dont duplicate a request w/ same key for 1hr
    }
  );

  return {
    data: data as IPoolMap | undefined,
    loading: !data && !error,
    error,
  };
};

export default usePools;
