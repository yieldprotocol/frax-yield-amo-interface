import useSWR from 'swr';
import { useNetwork } from 'wagmi';
import { getPools } from '../../lib/protocol';
import { IPoolMap } from '../../lib/protocol/types';
import useDefaultProvider from '../useDefaultProvider';
import useAMO from './useAMO';
import useContracts from './useContracts';

const usePools = () => {
  const { chain } = useNetwork();
  const { amoAddress } = useAMO();
  const provider = useDefaultProvider();
  const contractMap = useContracts();

  const { data, error } = useSWR(
    provider && chain?.id && amoAddress ? `/pools/${chain?.id}/${amoAddress}` : null,
    () => getPools(provider!, contractMap!, chain?.id, amoAddress),
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
