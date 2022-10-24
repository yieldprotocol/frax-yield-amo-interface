import { useMemo } from 'react';
import { useNetwork } from 'wagmi';
import yieldEnv from '../../config/yieldEnv';
import { FRAX_AMO, TIMELOCK } from '../../constants';
import { AMO__factory } from '../../contracts/types';
import useDefaultProvider from '../useDefaultProvider';
import useTenderly from '../useTenderly';

const useAMO = () => {
  const { usingTenderly, tenderlyProvider } = useTenderly();
  const provider = useDefaultProvider();
  const { chain } = useNetwork();
  const chainId = chain?.id! || 1;

  // set the amo's timelock address
  const timelockAddress = useMemo(() => {
    return (yieldEnv.addresses as any)[chainId][TIMELOCK] as string;
  }, [chainId]);

  // set the amo contract
  const contract = useMemo(() => {
    return AMO__factory.connect(
      (yieldEnv.addresses as any)[chainId][FRAX_AMO],
      usingTenderly ? tenderlyProvider.getSigner(timelockAddress) : provider
    );
  }, [chainId, provider, tenderlyProvider, timelockAddress, usingTenderly]);

  // set the amo address
  const address = useMemo(() => {
    if (!chainId) return;
    return (yieldEnv.addresses as any)[chainId][FRAX_AMO] as string;
  }, [chainId]);

  return {
    contract,
    contractInterface: contract.interface,
    address,
    timelockAddress,
  };
};

export default useAMO;
