import { JsonRpcProvider } from '@ethersproject/providers';
import { useMemo } from 'react';
import { useNetwork } from 'wagmi';
import { URLS } from '../config/chains';

const useDefaultProvider = () => {
  const { chain } = useNetwork();
  const chainId = useMemo(() => (chain ? chain.id : 1), [chain]);

  return useMemo(() => {
    try {
      return new JsonRpcProvider(URLS[chainId][0], chainId);
    } catch (e) {
      throw new Error('no provider detected');
    }
  }, [chainId]);
};

export default useDefaultProvider;
