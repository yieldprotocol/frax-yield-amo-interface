import { ethers } from 'ethers';
import { useMemo } from 'react';
import { useNetwork } from 'wagmi';
import { URLS } from '../config/chains';

const useDefaultProvider = () => {
  const { activeChain } = useNetwork();
  const chainId = activeChain?.id;

  return useMemo(
    () => (chainId ? new ethers.providers.StaticJsonRpcProvider(URLS[chainId][0], chainId) : undefined),
    [chainId]
  );
};

export default useDefaultProvider;
