import { BigNumber, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { DEFAULT_SLIPPAGE, SLIPPAGE_KEY } from '../../constants';
import { AddLiquidityActions } from '../../lib/protocol/liquidity/types';
import { IPool } from '../../lib/protocol/types';
import { fyTokenForMint, mint, mintWithBase, splitLiquidity } from '../../utils/yieldMath';
import { useLocalStorage } from '../useLocalStorage';

const useAddLiqPreview = (pool: IPool, baseAmount: string, method: AddLiquidityActions | undefined) => {
  const [lpTokenPreview, setLpTokenPreview] = useState<string>();
  const [fyTokenNeeded, setFyTokenNeeded] = useState<string>();
  const [canTradeForFyToken, setCanTradeForFyToken] = useState<boolean>(false);
  const [slippageTolerance] = useLocalStorage(SLIPPAGE_KEY, DEFAULT_SLIPPAGE);
  const slippageTolerance_ = +slippageTolerance / 100; // find better way (currently slippage in localStorage looks like "1" for "1%")

  useEffect(() => {
    (async () => {
      if (pool && baseAmount !== '' && method) {
        const { totalSupply, decimals, contract, getTimeTillMaturity, ts, g1 } = pool;
        const timeTillMaturity = getTimeTillMaturity().toString();

        const _baseAmount = ethers.utils.parseUnits(baseAmount || '0', decimals);
        const [cachedBaseReserves, cachedFyTokenReserves] = await contract.getCache();
        const cachedRealReserves = cachedFyTokenReserves.sub(totalSupply);

        // if minting with both base and fyToken, calculate how much fyToken is needed
        try {
          if (method === AddLiquidityActions.MINT) {
            const [, _fyTokenNeeded] = splitLiquidity(cachedBaseReserves, cachedRealReserves, _baseAmount);
            setFyTokenNeeded(ethers.utils.formatUnits(_fyTokenNeeded, decimals));

            const [minted] = mint(
              cachedBaseReserves,
              cachedRealReserves,
              totalSupply,
              BigNumber.from(_fyTokenNeeded),
              false
            );
            setLpTokenPreview(ethers.utils.formatUnits(minted, decimals));
          } else {
            // minting with base
            const [fyTokenToBuy] = fyTokenForMint(
              cachedBaseReserves,
              cachedRealReserves,
              cachedFyTokenReserves,
              _baseAmount,
              timeTillMaturity,
              ts,
              g1,
              decimals,
              slippageTolerance_
            );

            const [minted] = mintWithBase(
              cachedBaseReserves,
              cachedFyTokenReserves,
              cachedRealReserves,
              fyTokenToBuy,
              timeTillMaturity,
              ts,
              g1,
              decimals
            );

            setCanTradeForFyToken(true);
            setLpTokenPreview(ethers.utils.formatUnits(minted, decimals));
          }
        } catch (e) {
          setCanTradeForFyToken(false);
          console.log(e);
        }
      }
    })();
  }, [baseAmount, method, pool, slippageTolerance_]);

  return { lpTokenPreview, fyTokenNeeded, canTradeForFyToken };
};

export default useAddLiqPreview;
