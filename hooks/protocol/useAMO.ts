import { useMemo } from 'react';
import yieldEnv from '../../config/yieldEnv';
import { FRAX_AMO, TIMELOCK } from '../../constants';
import { AMO__factory } from '../../contracts/types';
import useChainId from '../useChainId';
import useDefaultProvider from '../useDefaultProvider';
import useTenderly from '../useTenderly';

const useAMO = () => {
  const { usingTenderly, tenderlyProvider } = useTenderly();
  const provider = useDefaultProvider();
  const chainId = useChainId();

  // set the amo's timelock address
  const timelockAddress = useMemo(() => {
    return yieldEnv.addresses[chainId][TIMELOCK] as string;
  }, [chainId]);

  // set the amo contract
  const contract = useMemo(() => {
    return AMO__factory.connect(
      yieldEnv.addresses[chainId][FRAX_AMO],
      usingTenderly ? tenderlyProvider.getSigner(timelockAddress) : provider
    );
  }, [chainId, provider, tenderlyProvider, timelockAddress, usingTenderly]);

  // set the amo address
  const address = useMemo(() => {
    if (!chainId) return;
    return yieldEnv.addresses[chainId][FRAX_AMO] as string;
  }, [chainId]);

  return {
    contract,
    contractInterface: contract.interface,
    address,
    timelockAddress,
  };
};

export default useAMO;
