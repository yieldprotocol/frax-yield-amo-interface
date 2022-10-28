import { useEffect, useState } from 'react';
import { useAccount, useBalance, useNetwork } from 'wagmi';
import { FRAX_ADDRESS } from '../config/assets';
import { IPool } from '../lib/protocol/types';
import { AMOActions } from '../lib/tx/operations';
import useAMO from './protocol/useAMO';

const useInputValidation = (
  input: string | undefined,
  pool: IPool | undefined,
  limits: (number | string | undefined)[],
  action: AMOActions.Fn
) => {
  const { address: account } = useAccount();
  const { address: amoAddress } = useAMO();
  const { chain } = useNetwork();
  const { data: fraxBal } = useBalance({
    addressOrName: amoAddress,
    token: FRAX_ADDRESS,
    chainId: chain?.id,
    enabled: !!(amoAddress && chain),
  });
  const { data: lpTokenBal } = useBalance({ addressOrName: amoAddress, token: pool?.address, enabled: !!pool });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const _input = +input!;

  useEffect(() => {
    if (!account) {
      return setErrorMsg('Please connect');
    }

    if (!pool) {
      return setErrorMsg('Select pool');
    }

    if (!input) {
      return setErrorMsg('Enter an amount');
    }

    if (_input <= 0) {
      return setErrorMsg('Amount must be greater than 0');
    }

    setErrorMsg(null); // reset

    const { isMature } = pool;

    /* Action specific validation */
    switch (action) {
      case AMOActions.Fn.ADD_LIQUIDITY:
        +fraxBal?.formatted! < _input && setErrorMsg(`Insufficient ${fraxBal?.symbol} balance`);
        isMature && setErrorMsg(`Pool matured: can only remove liquidity`);
        break;
      case AMOActions.Fn.REMOVE_LIQUIDITY:
        +lpTokenBal?.formatted! < _input && setErrorMsg(`Insufficient LP token balance`);
        break;
      default:
        setErrorMsg(null);
        break;
    }
  }, [_input, account, action, fraxBal?.formatted, fraxBal?.symbol, input, lpTokenBal?.formatted, pool]);

  return { errorMsg };
};

export default useInputValidation;
