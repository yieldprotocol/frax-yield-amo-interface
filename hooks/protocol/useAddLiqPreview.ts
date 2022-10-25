import { calcPoolRatios, mint } from '@yield-protocol/ui-math';
import { BigNumber, ethers } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { DEFAULT_SLIPPAGE, SLIPPAGE_KEY } from '../../constants';
import { calculateSlippage, splitLiquidity } from '../../utils/yieldMath';
import { useLocalStorage } from '../useLocalStorage';
import usePool from './usePool';

const useAddLiqPreview = (poolAddress: string, input: string) => {
  const { data } = usePool(poolAddress);

  const [slippageTolerance] = useLocalStorage(SLIPPAGE_KEY, DEFAULT_SLIPPAGE);

  const [lpTokenPreview, setLpTokenPreview] = useState<string>('');
  const [baseNeeded, setBaseNeeded] = useState<BigNumber>(ethers.constants.Zero);
  const [baseNeeded_, setBaseNeeded_] = useState<string>('');
  const [fyTokenNeeded, setFyTokenNeeded] = useState<BigNumber>(ethers.constants.Zero);
  const [fyTokenNeeded_, setFyTokenNeeded_] = useState<string>('');
  const [minRatio, setMinRatio] = useState<BigNumber>();
  const [maxRatio, setMaxRatio] = useState<BigNumber>();

  useEffect(() => {
    (async () => {
      if (data) {
        const { totalSupply, decimals, baseReserves, fyTokenReserves } = data;
        const _input = ethers.utils.parseUnits(input || '0', decimals);
        const realReserves = fyTokenReserves.sub(totalSupply);

        const [baseToPool, fyTokenToBorrow] = splitLiquidity(baseReserves, realReserves, _input, true) as [
          BigNumber,
          BigNumber
        ];
        const fyTokenToBorrowWithSlippage = BigNumber.from(calculateSlippage(fyTokenToBorrow, undefined, true));

        // estimate lp tokens minted based on reserves
        const [minted] = mint(baseReserves, realReserves, totalSupply, baseToPool, true);

        setBaseNeeded(baseToPool);
        setBaseNeeded_(formatUnits(baseToPool, decimals));
        setFyTokenNeeded(fyTokenToBorrowWithSlippage);
        setFyTokenNeeded_(formatUnits(fyTokenToBorrowWithSlippage, decimals));
        setLpTokenPreview(formatUnits(minted, decimals));

        // calculate min and max ratios
        const [minRatio, maxRatio] = calcPoolRatios(baseReserves, realReserves, +slippageTolerance);
        setMinRatio(minRatio);
        setMaxRatio(maxRatio);
      }
    })();
  }, [data, input, slippageTolerance]);

  return { lpTokenPreview, fyTokenNeeded, fyTokenNeeded_, baseNeeded, baseNeeded_, minRatio, maxRatio };
};

export default useAddLiqPreview;
