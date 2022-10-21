import { useMemo } from 'react';
import useSWR from 'swr';
import { useNetwork } from 'wagmi';
import { USE_TENDERLY_KEY } from '../../constants';
import { getPools } from '../../lib/protocol';
import { IPoolMap } from '../../lib/protocol/types';
import useDefaultProvider from '../useDefaultProvider';
import { useLocalStorage } from '../useLocalStorage';
import useTenderly from '../useTenderly';
import useContracts from './useContracts';

const usePools = () => {
  const { chain } = useNetwork();
  const chainId = useMemo(() => (chain ? chain.id : 1), [chain]);
  const provider = useDefaultProvider();

  const { tenderlyProvider, tenderlyStartBlock } = useTenderly();
  const [usingTenderly] = useLocalStorage(USE_TENDERLY_KEY, JSON.stringify(false));
  const contractMap = useContracts(provider);
  const tenderlyContractMap = useContracts(tenderlyProvider!);

  const key = `/pools?chainId=${chainId}&usingTenderly=${usingTenderly}`;

  const { data, error } = useSWR(
    key,
    () => getPools(provider, contractMap!, chainId, usingTenderly as boolean, tenderlyContractMap, tenderlyStartBlock),
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
