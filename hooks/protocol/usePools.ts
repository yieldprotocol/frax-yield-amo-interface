import useSWR from 'swr';
import { getPools } from '../../lib/protocol';
import { IPoolMap } from '../../lib/protocol/types';
import useChainId from '../useChainId';
import useDefaultProvider from '../useDefaultProvider';
import useTenderly from '../useTenderly';
import useContracts from './useContracts';

const usePools = (pools?: { [chainId: number]: IPoolMap | undefined }) => {
  const chainId = useChainId();
  const provider = useDefaultProvider();
  const { usingTenderly, tenderlyProvider, tenderlyStartBlock } = useTenderly();
  const contractMap = useContracts(provider);
  const tenderlyContractMap = useContracts(tenderlyProvider!);

  const key = `/pools?chainId=${chainId}&usingTenderly=${usingTenderly}`;

  const { data, error } = useSWR(
    pools && pools[chainId] ? null : key, // don't need to get pools if we already got them from ssr
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
      fallbackData: pools && pools[chainId],
    }
  );

  return {
    data,
    loading: !data && !error,
    error,
  };
};

export default usePools;
