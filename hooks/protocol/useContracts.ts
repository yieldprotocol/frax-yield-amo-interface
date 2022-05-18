import { useMemo } from 'react';
import { CAULDRON, FRAX_AMO, LADLE } from '../../constants';
import { getContracts } from '../../lib/protocol';
import useDefaultProvider from '../useDefaultProvider';

export const CONTRACTS_TO_FETCH = [CAULDRON, LADLE, FRAX_AMO];

const useContracts = () => {
  const provider = useDefaultProvider();
  // const { activeChain } = useNetwork();
  const chainId = 1;
  return useMemo(() => getContracts(provider!, chainId), [provider, chainId]);
};

export default useContracts;
