import { JsonRpcProvider } from '@ethersproject/providers';
import { useMemo } from 'react';
import rpcUrls from '../config/chains';
import useChainId from './useChainId';

const useDefaultProvider = () => {
  const chainId = useChainId();

  return useMemo(() => {
    try {
      return new JsonRpcProvider(rpcUrls[chainId]);
    } catch (e) {
      throw new Error('no provider detected');
    }
  }, [chainId]);
};

export default useDefaultProvider;
