import { ethers, PayableOverrides } from 'ethers';
import { cleanValue, valueAtDigits } from '../../utils/appUtils';
import { calcPoolRatios, fyTokenForMint } from '../../utils/yieldMath';
import { IPool } from '../../lib/protocol/types';
import { AddLiquidityActions } from '../../lib/protocol/liquidity/types';
import useSignature from '../useSignature';
import useTransaction from '../useTransaction';
import { useLocalStorage } from '../useLocalStorage';
import { DEFAULT_SLIPPAGE, SLIPPAGE_KEY } from '../../constants';
import useAMO from '../protocol/useAMO';
import { useAccount } from 'wagmi';

export const useAddLiquidity = (
  pool: IPool | undefined,
  baseInput: string,
  fyTokenInput: string,
  method: AddLiquidityActions
) => {
  const { address: account } = useAccount();
  const { sign } = useSignature();
  const { handleTransact, isTransacting, txSubmitted } = useTransaction();
  const { ladleContract, batch, transferAction, mintWithBaseAction, mintAction, exitETHAction } = useAMO();

  // settings
  const [slippageTolerance] = useLocalStorage(SLIPPAGE_KEY, DEFAULT_SLIPPAGE);

  // description to use in toast
  const description = `Add ${valueAtDigits(baseInput, 4)} ${pool?.base.symbol}${
    method === AddLiquidityActions.MINT ? ` and ${valueAtDigits(fyTokenInput, 4)} ${pool?.fyToken.symbol}` : ''
  } as liquidity`;

  const addLiquidity = async () => {
    if (!pool) throw new Error('no pool'); // prohibit trade if there is no pool
    if (!account) throw new Error('no connected account');

    // pool data
    const {
      address: poolAddress,
      contract: poolContract,
      base,
      fyToken,
      ts,
      g1,
      decimals,
      getTimeTillMaturity,
      totalSupply,
    } = pool;
    const timeTillMaturity = getTimeTillMaturity().toString();
    const [cachedBaseReserves, cachedFyTokenReserves] = await poolContract.getCache();
    const cachedRealReserves = cachedFyTokenReserves.sub(totalSupply);
    const [minRatio, maxRatio] = calcPoolRatios(cachedBaseReserves, cachedRealReserves);

    // input data
    const cleanBaseInput = cleanValue(baseInput || '0', base.decimals);
    const _baseInput = ethers.utils.parseUnits(cleanBaseInput, base.decimals);
    const cleanFyTokenInput = cleanValue(fyTokenInput || '0', fyToken.decimals);
    const _fyTokenInput = ethers.utils.parseUnits(cleanFyTokenInput, base.decimals);

    // check if signature is still required
    const alreadyApprovedBase = (await base.getAllowance(account, ladleContract?.address!)).gte(_baseInput);
    const alreadyApprovedFyToken = (await fyToken.getAllowance(account, ladleContract?.address!)).gte(_fyTokenInput);

    const overrides = {
      gasLimit: 250000,
    };
    const isEth = base.symbol === 'ETH';
    const withEthOverrides = { ...overrides, value: isEth ? _baseInput : undefined } as PayableOverrides;

    const _mint = async () => {
      const permits = await sign([
        {
          target: base,
          spender: ladleContract?.address!,
          amount: _baseInput,
          ignoreIf: alreadyApprovedBase,
        },
        {
          target: fyToken,
          spender: ladleContract?.address!,
          amount: _fyTokenInput,
          ignoreIf: alreadyApprovedFyToken,
        },
      ]);

      return batch(
        [
          ...permits,
          { action: transferAction(base.address, poolAddress, _baseInput)!, ignoreIf: isEth },
          { action: transferAction(fyToken.address, poolAddress, _fyTokenInput)! },
          {
            action: mintAction(
              poolContract,
              account, // minting with eth needs to be sent to ladle
              account,
              minRatio,
              maxRatio
            )!,
          },
          { action: exitETHAction(account)!, ignoreIf: !isEth }, // leftover eth gets sent back to account
        ],
        withEthOverrides
      );
    };

    handleTransact(_mint, description);
  };

  return { addLiquidity, isAddingLiquidity: isTransacting, addSubmitted: txSubmitted };
};
