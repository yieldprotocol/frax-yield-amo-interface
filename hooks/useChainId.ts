import { useMemo } from 'react';
import { useNetwork } from 'wagmi';

// only to be used for reading data
const useChainId = () => {
  const { chain } = useNetwork();
  return useMemo(() => (chain ? chain.id : +process.env.defaultChainId! || 1), [chain]);
};

export default useChainId;
