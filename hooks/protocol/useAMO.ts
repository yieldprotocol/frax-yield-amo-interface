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
  const contracts = useContracts(provider);
  const tenderlyContracts = useContracts(tenderlyProvider);
  const { chain } = useNetwork();
  const chainId = chain?.id! || 1;
  const [amoContract, setAmoContract] = useState<AMO>();
  const [amoAddress, setAmoAddress] = useState<string>();
  const [timelockAddress, setTimelockAddress] = useState<string>();

  // set the amo contract
  useEffect(() => {
    if (usingTenderly && tenderlyContracts) {
      return setAmoContract(tenderlyContracts[FRAX_AMO] as AMO);
    } else if (contracts) {
      setAmoContract(contracts[FRAX_AMO] as AMO);
    }
  }, [contracts, tenderlyContracts, usingTenderly]);

  // set the amo address
  useEffect(() => {
    if (!chainId) return;
    const amoAddress = yieldEnv.addresses[chainId][FRAX_AMO] as string;
    if (amoAddress) setAmoAddress(amoAddress);
  }, [chainId]);

  // set the amo's timelock address
  useEffect(() => {
    (async () => {
      if (amoContract) {
        setTimelockAddress(await amoContract.timelockAddress());
      }
    })();
  }, [amoContract]);

  return {
    amoContract,
    amoAddress,
    timelockAddress,
  };
};

export default useAMO;
