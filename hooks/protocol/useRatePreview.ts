import { BigNumber, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { IPool } from '../../lib/protocol/types';
import { cleanValue } from '../../utils/appUtils';
import { changeRate } from '../../utils/yieldMath';

const useRatePreview = (pool: IPool, desiredRate?: number, baseAmount?: string) => {
  const [ratePreview, setRatePreview] = useState<string>();
  const [baseNeeded, setBaseNeeded] = useState<BigNumber>();
  const [baseNeeded_, setBaseNeeded_] = useState<string>();

  const [func, setFunc] = useState<string>();

  useEffect(() => {
    if (pool) {
      const { baseReserves, fyTokenReserves, getTimeTillMaturity, ts, g1, g2, decimals, interestRate } = pool;

      const _baseNeeded = changeRate(
        baseReserves,
        fyTokenReserves,
        getTimeTillMaturity().toString(),
        ts,
        g1,
        g2,
        desiredRate || 0
      );

      setBaseNeeded(_baseNeeded);
      setBaseNeeded_(cleanValue(ethers.utils.formatUnits(_baseNeeded, decimals), 2));

      setFunc(+interestRate / 100 > desiredRate! ? 'decreaseRates' : 'increaseRates');
    } else {
      setBaseNeeded(ethers.constants.Zero);
      setBaseNeeded_('');
      setFunc(undefined);
    }
  }, [desiredRate, pool]);

  return { ratePreview, baseNeeded_, func };
};

export default useRatePreview;
