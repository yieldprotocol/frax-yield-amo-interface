import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { IPool } from '../../lib/protocol/types';
import { burn, newPoolState } from '../../utils/yieldMath';

const useRemoveLiqPreview = (pool: IPool | undefined, lpTokens: string) => {
  const [baseReceived, setBaseReceived] = useState<string>();
  const [fyTokenReceived, setFyTokenReceived] = useState<string>();

  useEffect(() => {
    const getPreviewData = async () => {
      if (!pool) return;

      const { totalSupply, decimals, baseReserves, fyTokenReserves } = pool;
      const _lpTokens = ethers.utils.parseUnits(lpTokens || '0', decimals);
      const realReserves = fyTokenReserves.sub(totalSupply);

      const [baseReceived, fyTokenReceived] = burn(baseReserves, realReserves, totalSupply, _lpTokens);

      setBaseReceived(ethers.utils.formatUnits(baseReceived, decimals));
      setFyTokenReceived(ethers.utils.formatUnits(fyTokenReceived, decimals));
    };

    getPreviewData();
  }, [lpTokens, pool]);

  return { baseReceived, fyTokenReceived };
};

export default useRemoveLiqPreview;
