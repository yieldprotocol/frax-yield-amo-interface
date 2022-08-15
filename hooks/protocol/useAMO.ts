import { useNetwork } from 'wagmi';
import yieldEnv from '../../config/yieldEnv';
import { FRAX_AMO } from '../../constants';
import useContracts from './useContracts';

const useAMO = () => {
  const contracts = useContracts();
  const { chain } = useNetwork();
  const amoContract = contracts![FRAX_AMO] ?? undefined;
  const amoAddress = yieldEnv.addresses[chain?.id!].FraxAMO as string;

  return {
    amoContract,
    amoAddress,
  };
};

export default useAMO;
