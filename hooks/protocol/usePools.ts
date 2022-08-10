import useSWR from 'swr';
import { useNetwork } from 'wagmi';
import yieldEnv from '../../config/yieldEnv';
import { FRAX_AMO } from '../../constants';
import { getPools } from '../../lib/protocol';
import { IPoolMap } from '../../lib/protocol/types';
import useDefaultProvider from '../useDefaultProvider';
import useContracts from './useContracts';

const usePools = () => {
  const { chain } = useNetwork();
  const amoAddress = yieldEnv.addresses[chain?.id!][FRAX_AMO];
  const provider = useDefaultProvider();
  const contractMap = useContracts();

  const { data, error } = useSWR(
    provider ? `/pools/${chain?.id}/${amoAddress}` : null,
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
