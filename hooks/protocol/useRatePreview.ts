import { calculateSlippage, sellFYToken } from '@yield-protocol/ui-math';
import { BigNumber, ethers } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { DEFAULT_SLIPPAGE, SLIPPAGE_KEY } from '../../constants';
import { cleanValue, valueAtDigits } from '../../utils/appUtils';
import { changeRate, sellBase } from '../../utils/yieldMath';
import { useLocalStorage } from '../useLocalStorage';
import usePool from './usePool';

const useRatePreview = (
  poolAddress: string,
  desiredRate?: number, // looks like .1 for 10%
  baseAmount?: string,
  updatingRate = true,
  increaseRates = true
) => {
  const { data } = usePool(poolAddress);
  const [ratePreview, setRatePreview] = useState<string>(''); // percentage format (i.e.: 10%)
  const [baseNeeded, setBaseNeeded] = useState<BigNumber>(ethers.constants.Zero);
  const [baseNeeded_, setBaseNeeded_] = useState<string>('');

  const [fyTokenBought, setFyTokenBought] = useState<BigNumber>(ethers.constants.Zero);
  const [fyTokenBought_, setFyTokenBought_] = useState<string>();
  const [minFyTokenBought, setMinFyTokenBought] = useState<BigNumber>(ethers.constants.Zero);
  const [minFyTokenBought_, setMinFyTokenBought_] = useState<string>();

  const [baseBought, setBaseBought] = useState<BigNumber>(ethers.constants.Zero);
  const [baseBought_, setBaseBought_] = useState<string>('');
  const [minBaseBought, setMinBaseBought] = useState<BigNumber>(ethers.constants.Zero);
  const [minBaseBought_, setMinBaseBought_] = useState<string>('');

  useEffect(() => {
    if (data) {
      const { baseReserves, fyTokenReserves, timeTillMaturity, ts, g1, g2, decimals } = data;

      const _baseNeeded = changeRate(baseReserves, fyTokenReserves, timeTillMaturity!, ts, g1, g2, desiredRate || 0);

      setBaseNeeded(_baseNeeded);
      setBaseNeeded_(cleanValue(ethers.utils.formatUnits(_baseNeeded, decimals), 2));

      setRatePreview((desiredRate! * 100).toString());

      // if not increasing rates we buy fyToken and burn it
      // need fyTokenBought for approval
      if (!increaseRates) {
        const fyTokenOut = sellBase(baseReserves, fyTokenReserves, _baseNeeded, timeTillMaturity!, ts, g2, decimals); // using base amount as proxy for fyToken in
        setFyTokenBought(fyTokenOut);
        setFyTokenBought_(valueAtDigits(formatUnits(fyTokenOut, decimals), 2));

        const fyOutwithSlip = BigNumber.from(calculateSlippage(fyTokenOut, undefined, true));
        setMinFyTokenBought(fyOutwithSlip);
        return setMinFyTokenBought_(valueAtDigits(formatUnits(fyOutwithSlip, decimals), 2));
      }

      // if increasing rates, then we can estimate how much base will be bought after minting fyToken
      // base out for now, but should actuall be shares out
      const baseOut = sellFYToken(baseReserves, fyTokenReserves, _baseNeeded, timeTillMaturity!, ts, g2, decimals);
      setBaseBought(baseOut);
      setBaseBought_(valueAtDigits(formatUnits(baseOut, decimals), 2));

      const baseOutwithSlip = BigNumber.from(calculateSlippage(baseOut, undefined, true));
      setMinBaseBought(baseOutwithSlip);
      setMinBaseBought_(valueAtDigits(formatUnits(baseOutwithSlip, decimals), 2));
    }
  }, [data, desiredRate, increaseRates]);

  return {
    ratePreview,
    baseNeeded,
    baseNeeded_,
    fyTokenBought,
    fyTokenBought_,
    baseBought,
    baseBought_,
    minBaseBought,
    minBaseBought_,
    minFyTokenBought,
    minFyTokenBought_,
  };
};

export default useRatePreview;
