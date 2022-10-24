import { signERC2612Permit } from 'eth-permit';
import { useProvider } from 'wagmi';
import { LADLE } from '../constants';
import { Ladle } from '../contracts/types';
import { LadleActions } from '../lib/tx/operations';
import { IDomain } from '../lib/tx/types';
import useContracts from './protocol/useContracts';
import useTenderly from './useTenderly';

const useSignature = () => {
  const provider = useProvider();
  const { usingTenderly, tenderlyProvider } = useTenderly();
  const contracts = useContracts(usingTenderly ? tenderlyProvider : provider);

  const sign = async (domain: IDomain, account: string, spender: string, amount: string) => {
    const { v, r, s, value, deadline } = await signERC2612Permit(provider, domain, account, spender, amount);
    console.log('🦄 ~ file: useSignature.ts ~ line 17 ~ sign ~ r', r);
    console.log('🦄 ~ file: useSignature.ts ~ line 18 ~ sign ~ value', value);
    console.log('🦄 ~ file: useSignature.ts ~ line 17 ~ sign ~ v', v);

    const ladle = contracts![LADLE] as Ladle;

    const args = [
      domain.verifyingContract,
      spender,
      value,
      deadline,
      v < 27 ? v + 27 : v, // handle ledger signing ( 00 is 27 or  01 is 28 )
      r,
      s,
    ] as LadleActions.Args.FORWARD_PERMIT;

    await ladle.forwardPermit(...args);
  };

  return { sign };
};

export default useSignature;
