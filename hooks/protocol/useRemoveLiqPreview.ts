import { calcPoolRatios } from '@yield-protocol/ui-math';
import { BigNumber, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { DEFAULT_SLIPPAGE, SLIPPAGE_KEY } from '../../constants';
import { burn } from '../../utils/yieldMath';
import { useLocalStorage } from '../useLocalStorage';
import usePool from './usePool';

const useRemoveLiqPreview = (poolAddress: string, lpTokens: string) => {
  const { data } = usePool(poolAddress);
  const [slippageTolerance] = useLocalStorage(SLIPPAGE_KEY, DEFAULT_SLIPPAGE);
  const [baseReceived, setBaseReceived] = useState<string>();
  const [fyTokenReceived, setFyTokenReceived] = useState<string>();
  const [minRatio, setMinRatio] = useState<BigNumber>();
  const [maxRatio, setMaxRatio] = useState<BigNumber>();

  useEffect(() => {
    const getPreviewData = async () => {
      if (data) {
        const { totalSupply, decimals, baseReserves, fyTokenReserves } = data;
        const _lpTokens = ethers.utils.parseUnits(lpTokens || '0', decimals);
        const realReserves = fyTokenReserves.sub(totalSupply);

        const [baseReceived, fyTokenReceived] = burn(baseReserves, realReserves, totalSupply, _lpTokens);

        setBaseReceived(ethers.utils.formatUnits(baseReceived, decimals));
        setFyTokenReceived(ethers.utils.formatUnits(fyTokenReceived, decimals));

        // calculate min and max ratios
        const [minRatio, maxRatio] = calcPoolRatios(baseReserves, realReserves, +slippageTolerance);
        setMinRatio(minRatio);
        setMaxRatio(maxRatio);
      }
    };
    getPreviewData();
  }, [data, lpTokens, slippageTolerance]);

  return { baseReceived, fyTokenReceived, minRatio, maxRatio };
};

export default useRemoveLiqPreview;
