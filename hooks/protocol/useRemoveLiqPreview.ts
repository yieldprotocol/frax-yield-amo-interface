import { calcPoolRatios } from '@yield-protocol/ui-math';
import { BigNumber, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { DEFAULT_SLIPPAGE, SLIPPAGE_KEY } from '../../constants';
import { IPool } from '../../lib/protocol/types';
import { burn, newPoolState } from '../../utils/yieldMath';
import { useLocalStorage } from '../useLocalStorage';

const useRemoveLiqPreview = (pool: IPool | undefined, lpTokens: string) => {
  const [slippageTolerance] = useLocalStorage(SLIPPAGE_KEY, DEFAULT_SLIPPAGE);
  const [baseReceived, setBaseReceived] = useState<string>();
  const [fyTokenReceived, setFyTokenReceived] = useState<string>();
  const [minRatio, setMinRatio] = useState<BigNumber>();
  const [maxRatio, setMaxRatio] = useState<BigNumber>();

  useEffect(() => {
    const getPreviewData = async () => {
      if (!pool) return;

      const { totalSupply, decimals, baseReserves, fyTokenReserves } = pool;
      const _lpTokens = ethers.utils.parseUnits(lpTokens || '0', decimals);
      const realReserves = fyTokenReserves.sub(totalSupply);

      const [baseReceived, fyTokenReceived] = burn(baseReserves, realReserves, totalSupply, _lpTokens);

      setBaseReceived(ethers.utils.formatUnits(baseReceived, decimals));
      setFyTokenReceived(ethers.utils.formatUnits(fyTokenReceived, decimals));

      // calculate min and max ratios
      const [minRatio, maxRatio] = calcPoolRatios(baseReserves, fyTokenReserves, +slippageTolerance);
      setMinRatio(minRatio);
      setMaxRatio(maxRatio);
    };

    getPreviewData();
  }, [lpTokens, pool, slippageTolerance]);

  return { baseReceived, fyTokenReceived, minRatio, maxRatio };
};

export default useRemoveLiqPreview;
