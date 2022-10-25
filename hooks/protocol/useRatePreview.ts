import { BigNumber, ethers } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { cleanValue } from '../../utils/appUtils';
import { changeRate, sellBase } from '../../utils/yieldMath';
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

  useEffect(() => {
    if (data) {
      console.log('🦄 ~ file: useRatePreview.ts ~ line 26 ~ useEffect ~ data', data);
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
      }
    }
  }, [data, desiredRate, increaseRates]);

  return {
    ratePreview,
    baseNeeded,
    baseNeeded_,
    fyTokenBought,
  };
};

export default useRatePreview;
