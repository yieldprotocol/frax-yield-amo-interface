import Decimal from 'decimal.js';
import { BigNumber, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { IPool } from '../../lib/protocol/types';
import { cleanValue } from '../../utils/appUtils';
import { changeRate, newPoolState, sellBase, calculateRate, sellFYToken, ZERO_DEC } from '../../utils/yieldMath';

const useRatePreview = (
  pool: IPool,
  desiredRate?: number, // looks like .1 for 10%
  baseAmount?: string,
  updatingRate = true,
  increaseRates = true
) => {
  const [ratePreview, setRatePreview] = useState<string>(''); // percentage format (i.e.: 10%)
  const [baseNeeded, setBaseNeeded] = useState<BigNumber>(ethers.constants.Zero);
  const [baseNeeded_, setBaseNeeded_] = useState<string>('');
  const [fyTokenBought, setFyTokenBought] = useState<BigNumber>(ethers.constants.Zero);

  useEffect(() => {
    if (pool) {
      const { baseReserves, fyTokenReserves, getTimeTillMaturity, ts, g1, g2, decimals } = pool;
      const timeTillMaturity = getTimeTillMaturity().toString();

      const _baseNeeded = changeRate(baseReserves, fyTokenReserves, timeTillMaturity, ts, g1, g2, desiredRate || 0);

      setBaseNeeded(_baseNeeded);
      setBaseNeeded_(cleanValue(ethers.utils.formatUnits(_baseNeeded, decimals), 2));

      setRatePreview((desiredRate! * 100).toString());

      // if not increasing rates we buy fyToken and burn it
      // need fyTokenBought for approval
      if (!increaseRates) {
        const fyTokenOut = sellBase(baseReserves, fyTokenReserves, _baseNeeded, timeTillMaturity, ts, g2, decimals); // using base amount as proxy for fyToken in
        setFyTokenBought(fyTokenOut);
      }
    }
  }, [desiredRate, increaseRates, pool]);

  return {
    ratePreview,
    baseNeeded,
    baseNeeded_,
    baseNeededWad: baseNeeded.toString(),
    fyTokenBought,
  };
};

export default useRatePreview;
