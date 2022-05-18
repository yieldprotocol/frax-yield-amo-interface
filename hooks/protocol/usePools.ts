import useSWR from 'swr';
import { useAccount, useNetwork } from 'wagmi';
import { getPools } from '../../lib/protocol';
import { IPoolMap } from '../../lib/protocol/types';
import useDefaultProvider from '../useDefaultProvider';
import useContracts from './useContracts';

const usePools = () => {
  const { data: account } = useAccount();
  const { activeChain } = useNetwork();
  const provider = useDefaultProvider();
  const contractMap = useContracts();

  const { data, error } = useSWR(
    provider ? `/pools/${activeChain?.id!}/${account?.address}` : null,
    () => getPools(provider!, contractMap!, activeChain?.id!, account?.address!),
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
