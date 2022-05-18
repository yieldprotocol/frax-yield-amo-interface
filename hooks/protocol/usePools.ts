import useSWR from 'swr';
// import { useNetwork } from 'wagmi';
import yieldEnv from '../../config/yieldEnv';
import { FRAX_AMO } from '../../constants';
import { getPools } from '../../lib/protocol';
import { IPoolMap } from '../../lib/protocol/types';
import useDefaultProvider from '../useDefaultProvider';
import useContracts from './useContracts';

const usePools = () => {
  const chainId = 1;
  const amoAddress = yieldEnv.addresses[chainId][FRAX_AMO];
  // const { activeChain } = useNetwork();
  const provider = useDefaultProvider();
  const contractMap = useContracts();

  const { data, error } = useSWR(
    provider ? `/pools/${chainId}/${amoAddress}` : null,
    () => getPools(provider!, contractMap!, chainId, amoAddress),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    data: data as IPoolMap | undefined,
    loading: !data && !error,
    error,
  };
};

export default usePools;
