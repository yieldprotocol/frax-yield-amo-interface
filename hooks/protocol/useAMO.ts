import { useEffect, useState } from 'react';
import { useNetwork } from 'wagmi';
import yieldEnv from '../../config/yieldEnv';
import { FRAX_AMO } from '../../constants';
import { AMO } from '../../contracts/types';
import useDefaultProvider from '../useDefaultProvider';
import useTenderly from '../useTenderly';
import useContracts from './useContracts';

const useAMO = () => {
  const { usingTenderly, tenderlyProvider } = useTenderly();
  const provider = useDefaultProvider();
  const contracts = useContracts(provider!);
  const tenderlyContracts = useContracts(tenderlyProvider);
  const { chain } = useNetwork();
  const [amoContract, setAmoContract] = useState<AMO>();
  const [amoAddress, setAmoAddress] = useState<string>();

  console.log('🦄 ~ file: useAMO.ts ~ line 17 ~ useAMO ~ amoContract', amoContract);
  useEffect(() => {
    console.log('🦄 ~ file: useAMO.ts ~ line 15 ~ useAMO ~ tenderlyContracts', tenderlyContracts);
    setAmoContract((usingTenderly ? tenderlyContracts : contracts)![FRAX_AMO] as AMO);
  }, [contracts, tenderlyContracts, usingTenderly]);

  useEffect(() => {
    if (!chain?.id) return;
    const amoAddress = yieldEnv.addresses[chain.id][FRAX_AMO] as string;
    if (amoAddress) setAmoAddress(amoAddress);
  }, [chain?.id]);

  return {
    amoContract,
    amoAddress,
  };
};

export default useAMO;
