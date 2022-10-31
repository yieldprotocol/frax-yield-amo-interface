import { JsonRpcProvider } from '@ethersproject/providers';
import { useMemo } from 'react';
import { useNetwork } from 'wagmi';
import rpcUrls from '../config/chains';

const useDefaultProvider = () => {
  const { chain } = useNetwork();
  const chainId = useMemo(() => (chain ? chain.id : 1), [chain]); // default to mainnet

  return useMemo(() => {
    try {
      return new JsonRpcProvider(rpcUrls[chainId]);
    } catch (e) {
      throw new Error('no provider detected');
    }
  }, [chainId]);
};

export default useDefaultProvider;
