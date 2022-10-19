import { JsonRpcSigner } from '@ethersproject/providers';
import { useMemo } from 'react';
import { useNetwork } from 'wagmi';
import { CAULDRON, FRAX_AMO, LADLE } from '../../constants';
import { getContracts } from '../../lib/protocol';
import { Provider } from '../../lib/protocol/types';

export const CONTRACTS_TO_FETCH = [CAULDRON, LADLE, FRAX_AMO];

const useContracts = (providerOrSigner: Provider | JsonRpcSigner) => {
  const { chain } = useNetwork();
  const chainId = useMemo(() => chain?.id! ?? 1, [chain?.id]);
  return useMemo(() => getContracts(providerOrSigner, chainId), [providerOrSigner, chainId]);
};
export default useContracts;
