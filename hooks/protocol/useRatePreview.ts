import Decimal from 'decimal.js';
import { BigNumber, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { IPool } from '../../lib/protocol/types';
import { cleanValue } from '../../utils/appUtils';
import { changeRate, newPoolState, sellBase, calculateRate, sellFYToken, ZERO_DEC } from '../../utils/yieldMath';

const useRatePreview = (
  pool: IPool,
  desiredRate?: number,
  baseAmount?: string,
  updatingRate = true,
  increaseRates = true
) => {
  const [ratePreview, setRatePreview] = useState<string>(''); // percentage format (i.e.: 10%)
  const [baseNeeded, setBaseNeeded] = useState<BigNumber>();
  const [baseNeeded_, setBaseNeeded_] = useState<string>('');

  const [func, setFunc] = useState<string>();

  useEffect(() => {
    if (pool) {
      const {
        baseReserves,
        fyTokenReserves,
        getTimeTillMaturity,
        ts,
        g1,
        g2,
        decimals,
        interestRate,
        totalSupply,
        timeStretchYears_,
      } = pool;
      const timeTillMaturity = getTimeTillMaturity().toString();

      if (updatingRate) {
        const _baseNeeded = changeRate(baseReserves, fyTokenReserves, timeTillMaturity, ts, g1, g2, desiredRate || 0);

        setBaseNeeded(_baseNeeded);
        setBaseNeeded_(cleanValue(ethers.utils.formatUnits(_baseNeeded, decimals), 2));

        setFunc(+interestRate / 100 > desiredRate! ? 'decreaseRates' : 'increaseRates');
      } else {
        // if changing base amount input, estimate the change in base and fyToken reserves based on rate change direction
        setBaseNeeded_(baseAmount!);
        const _baseAmount = ethers.utils.parseUnits(baseAmount || '0', decimals);

        let newBaseReserves: BigNumber;
        let newFyTokenReserves: BigNumber;

        if (increaseRates) {
          // estimate base out
          const baseOut = sellFYToken(baseReserves, fyTokenReserves, _baseAmount, timeTillMaturity, ts, g2, decimals); // using base amount as proxy for fyToken in

          // estimate new reserves after swap
          const { baseReserves: _newBaseReserves, fyTokenVirtualReserves: _newFyTokenVirtualReserves } = newPoolState(
            baseOut.mul(-1),
            _baseAmount,
            baseReserves,
            fyTokenReserves,
            totalSupply
          );

          newBaseReserves = _newBaseReserves;
          newFyTokenReserves = _newFyTokenVirtualReserves;
        } else {
          // estimate fyToken out
          const fyTokenOut = sellBase(baseReserves, fyTokenReserves, _baseAmount, timeTillMaturity, ts, g1, decimals);

          // estimate new reserves after swap
          const { baseReserves: _newBaseReserves, fyTokenVirtualReserves: _newFyTokenReserves } = newPoolState(
            _baseAmount,
            fyTokenOut.mul(-1),
            baseReserves,
            fyTokenReserves,
            totalSupply
          );

          newBaseReserves = _newBaseReserves;
          newFyTokenReserves = _newFyTokenReserves;
        }

        const newRate = calculateRate(newFyTokenReserves, newBaseReserves, new Decimal(timeStretchYears_));
        setRatePreview(cleanValue((newRate.gt(ZERO_DEC) ? newRate : ZERO_DEC).mul(100).toString(), 2));

        setFunc(+newRate > +interestRate! ? 'increaseRates' : 'decreaseRates');
      }
    } else {
      setBaseNeeded(ethers.constants.Zero);
      setBaseNeeded_('');
      setFunc(undefined);
    }
  }, [baseAmount, desiredRate, increaseRates, pool, updatingRate]);

  return { ratePreview, baseNeeded_, func };
};

export default useRatePreview;
