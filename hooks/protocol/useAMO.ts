import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { useNetwork } from 'wagmi';
import yieldEnv from '../../config/yieldEnv';
import { FRAX_AMO } from '../../constants';
import { AMO } from '../../contracts/types';
import { showAllocations } from '../../lib/protocol';
import useContracts from './useContracts';

const useAMO = () => {
  const contracts = useContracts();
  const { chain } = useNetwork();
  const [amoContract, setAmoContract] = useState<AMO>();
  const [amoAddress, setAmoAddress] = useState<string>();

  useEffect(() => {
    if (!contracts) return;
    const amoContract = contracts[FRAX_AMO] as AMO;
    if (amoContract) setAmoContract(amoContract);
  }, [contracts]);

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
