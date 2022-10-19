import useSWR from 'swr/immutable';
import { useNetwork } from 'wagmi';
import { getPools } from '../../lib/protocol';
import { IPoolMap } from '../../lib/protocol/types';
import useDefaultProvider from '../useDefaultProvider';
import useTenderly from '../useTenderly';
import useContracts from './useContracts';

const usePools = () => {
  const { chain } = useNetwork();
  const chainId = chain?.id! || 1;
  const provider = useDefaultProvider();

  const { usingTenderly, tenderlyProvider, tenderlyStartBlock } = useTenderly();
  const contractMap = useContracts(provider);
  const tenderlyContractMap = useContracts(tenderlyProvider!);

  const { data, error } = useSWR(`/pools?chainId=${chainId}&usingTenderly=${usingTenderly}`, () =>
    getPools(provider, contractMap!, chainId, usingTenderly, tenderlyContractMap, tenderlyStartBlock)
  );

  return {
    data: data as IPoolMap | undefined,
    loading: !data && !error,
    error,
  };
};

export default usePools;
