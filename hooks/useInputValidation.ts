import { useEffect, useState } from 'react';
import { useAccount, useBalance, useNetwork } from 'wagmi';
import { AddLiquidityActions, RemoveLiquidityActions } from '../lib/protocol/liquidity/types';
import { TradeActions } from '../lib/protocol/trade/types';
import { IPool } from '../lib/protocol/types';
import useAddLiqPreview from './protocol/useAddLiqPreview';
import useTradePreview from './protocol/useTradePreview';

const useInputValidation = (
  input: string | undefined,
  pool: IPool | undefined,
  limits: (number | string | undefined)[],
  action: TradeActions | AddLiquidityActions | RemoveLiquidityActions,
  secondaryInput: string = '', // this is the "to" amount when trading
  isEth = false // if the asset is eth
) => {
  const { address: account } = useAccount();
  const { chain } = useNetwork();
  const { data: balance } = useBalance({ addressOrName: account, chainId: chain?.id });
  const ethBalance = balance?.formatted;
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const _input = parseFloat(input!);
  const _secondaryInput = parseFloat(secondaryInput!);

  const aboveMax = !!limits[1] && _input > parseFloat(limits[1].toString());
  const belowMin = !!limits[0] && _input < parseFloat(limits[0].toString());

  const tradeAction = action === TradeActions.SELL_BASE || action === TradeActions.SELL_FYTOKEN ? action : undefined;
  const { maxBaseIn, maxBaseOut, maxFyTokenIn, maxFyTokenOut } = useTradePreview(
    pool,
    tradeAction!,
    input!,
    secondaryInput
  );

  // calculate the fyTokenNeeded for minting with both base and fyToken; only used with MINT
  const { fyTokenNeeded, baseNeeded } = useAddLiqPreview(
    pool!,
    input!,
    action === AddLiquidityActions.MINT ? AddLiquidityActions.MINT : undefined
  );

  // when minting with base, check if you can trade for fyToken
  const { canTradeForFyToken } = useAddLiqPreview(
    pool!,
    input!,
    action === AddLiquidityActions.MINT_WITH_BASE ? AddLiquidityActions.MINT_WITH_BASE : undefined
  );

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

    const { base, fyToken, isMature } = pool;
    const baseBalance = isEth ? ethBalance! : parseFloat(pool.base.balance_);
    const fyTokenBalance = parseFloat(pool.fyToken.balance_);
    const lpTokenBalance = parseFloat(pool.lpTokenBalance_);

    /* Action specific validation */
    switch (action) {
      case TradeActions.SELL_BASE:
      case TradeActions.BUY_FYTOKEN:
        aboveMax && setErrorMsg(`Max tradable ${base.symbol} is ${limits[1]} `);
        baseBalance < _input && setErrorMsg(`Insufficient ${base.symbol} balance`);
        +maxBaseIn! < _input && setErrorMsg(`Max tradable ${base.symbol} is ${maxBaseIn}`);
        +maxFyTokenOut! < _secondaryInput && setErrorMsg(`Max fy${base.symbol} out is ${maxFyTokenOut}`);
        isMature && setErrorMsg(`Pool matured: can only redeem fy${base.symbol}`);
        break;
      case TradeActions.SELL_FYTOKEN:
      case TradeActions.BUY_BASE:
        aboveMax && setErrorMsg(`Max tradable ${fyToken.symbol} is ${limits[1]} `);
        fyTokenBalance < _input && setErrorMsg(`Insufficient ${fyToken.symbol} balance`);
        +maxFyTokenIn! < _input && !isMature && setErrorMsg(`Max fy${base.symbol} in is ${maxFyTokenIn} `);
        +maxBaseOut! < _secondaryInput && !isMature && setErrorMsg(`Max ${base.symbol} out is ${maxBaseOut}`);
        break;
      case AddLiquidityActions.MINT_WITH_BASE:
        baseBalance < _input && setErrorMsg(`Insufficient ${base.symbol} balance`);
        !canTradeForFyToken && setErrorMsg(`Can't trade for ${base.symbol}. Use ${fyToken.symbol}.`);
        isMature && setErrorMsg(`Pool matured: can only remove liquidity`);
        break;
      case AddLiquidityActions.MINT:
        base.balance.lt(baseNeeded) && setErrorMsg(`Insufficient ${base.symbol} balance`);
        fyToken.balance.lt(fyTokenNeeded) && setErrorMsg(`Insufficient ${fyToken.symbol} balance`);
        break;
      case RemoveLiquidityActions.BURN_FOR_BASE:
      case RemoveLiquidityActions.BURN:
        lpTokenBalance < _input && setErrorMsg(`Insufficient LP token balance`);
        break;
      default:
        setErrorMsg(null);
        break;
    }
  }, [
    account,
    pool,
    input,
    action,
    aboveMax,
    _input,
    belowMin,
    limits,
    fyTokenNeeded,
    maxFyTokenIn,
    maxBaseOut,
    maxBaseIn,
    maxFyTokenOut,
    _secondaryInput,
    isEth,
    ethBalance,
    canTradeForFyToken,
    baseNeeded,
  ]);

  return { errorMsg };
};

export default useInputValidation;
