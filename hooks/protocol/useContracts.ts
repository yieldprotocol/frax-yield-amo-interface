import { JsonRpcSigner } from '@ethersproject/providers';
import { useMemo } from 'react';
import { FRAX_AMO, LADLE } from '../../constants';
import { getContracts } from '../../lib/protocol';
import { Provider } from '../../lib/protocol/types';
import useChainId from '../useChainId';

export const CONTRACTS_TO_FETCH = [LADLE, FRAX_AMO];

const useContracts = (providerOrSigner: Provider | JsonRpcSigner) => {
  const chainId = useChainId();
  return useMemo(() => getContracts(providerOrSigner, chainId), [providerOrSigner, chainId]);
};
export default useContracts;
