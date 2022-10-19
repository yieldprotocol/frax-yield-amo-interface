import { useEffect, useState } from 'react';
import { useAccount, useBalance, useNetwork } from 'wagmi';
import { FRAX_ADDRESS } from '../constants';
import { IPool } from '../lib/protocol/types';
import { AMOActions } from '../lib/tx/operations';
import useAddLiqPreview from './protocol/useAddLiqPreview';
import useAMO from './protocol/useAMO';

const useInputValidation = (
  input: string | undefined,
  pool: IPool | undefined,
  limits: (number | string | undefined)[],
  action: AMOActions.Fn
) => {
  const { address: account } = useAccount();
  const { amoAddress } = useAMO();
  const { chain } = useNetwork();
  const { data: balance } = useBalance({
    addressOrName: amoAddress,
    token: FRAX_ADDRESS,
    chainId: chain?.id,
    enabled: !!(amoAddress && chain),
  });
  const ethBalance = balance?.formatted;
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const _input = parseFloat(input!);

  const aboveMax = !!limits[1] && _input > parseFloat(limits[1].toString());
  const belowMin = !!limits[0] && _input < parseFloat(limits[0].toString());

  // calculate the fyTokenNeeded for minting with both base and fyToken; only used with MINT
  const { fyTokenNeeded, baseNeeded } = useAddLiqPreview(pool!, input!);

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

    const { base, isMature } = pool;
    const lpTokenBalance = parseFloat(pool.lpTokenBalance_);

    /* Action specific validation */
    switch (action) {
      case AMOActions.Fn.ADD_LIQUIDITY:
        +balance?.formatted! < _input && setErrorMsg(`Insufficient ${base.symbol} balance`);
        isMature && setErrorMsg(`Pool matured: can only remove liquidity`);
        break;
      case AMOActions.Fn.REMOVE_LIQUIDITY:
        lpTokenBalance < _input && setErrorMsg(`Insufficient LP token balance`);
        break;
      default:
        setErrorMsg(null);
        break;
    }
  }, [_input, account, action, balance?.formatted, input, pool]);

  return { errorMsg };
};

export default useInputValidation;
