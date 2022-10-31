import { useMemo } from 'react';
import { useNetwork } from 'wagmi';

const useChainId = () => {
  const { chain } = useNetwork();
  return useMemo(() => (chain ? chain.id : process.env.defaultChainId), [chain]);
};

export default useChainId;
