import { useMemo } from 'react';
import { useNetwork } from 'wagmi';
import { CAULDRON, FRAX_AMO, LADLE } from '../../constants';
import { getContracts } from '../../lib/protocol';
import { Provider } from '../../lib/protocol/types';

export const CONTRACTS_TO_FETCH = [CAULDRON, LADLE, FRAX_AMO];

const useContracts = (provider: Provider) => {
  const { chain } = useNetwork();
  const chainId = chain?.id! || 1;
  return useMemo(() => getContracts(provider, chainId), [provider, chainId]);
};

export default useContracts;
