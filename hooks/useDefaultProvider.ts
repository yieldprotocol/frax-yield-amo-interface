import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { useMemo } from 'react';
import { useNetwork } from 'wagmi';
import { URLS } from '../config/chains';

const useDefaultProvider = () => {
  const { chain } = useNetwork();
  const chainId = chain?.id || 1;

  return useMemo(() => {
    if (!chainId) return undefined;
    return new StaticJsonRpcProvider(URLS[chainId][0], chainId);
  }, [chainId]);
};

export default useDefaultProvider;
