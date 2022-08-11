import { ethers } from 'ethers';
import { RemoveLiquidityActions } from '../../lib/protocol/liquidity/types';
import { IPool } from '../../lib/protocol/types';
import { cleanValue, valueAtDigits } from '../../utils/appUtils';
import { calcPoolRatios } from '../../utils/yieldMath';
import useSignature from '../useSignature';
import useTransaction from '../useTransaction';
import { useAccount, usePrepareContractWrite } from 'wagmi';
import useAMO from '../protocol/useAMO';
import useRemoveLiqPreview from '../protocol/useRemoveLiqPreview';

export const useRemoveLiquidity = (pool: IPool | undefined, input: string) => {
  const { address: account } = useAccount();
  const { amoContract, amoAddress } = useAMO();
  const {} = useRemoveLiqPreview(pool!, input);
  const { handleTransact, isTransacting, txSubmitted } = useTransaction();

  const removeLiquidity = async () => {
    if (!pool) throw new Error('no pool'); // prohibit trade if there is no pool

    const { base, address: poolAddress, contract: poolContract, isMature, seriesId, fyToken } = pool;
    const cleanInput = cleanValue(input, base.decimals);
    const _input = ethers.utils.parseUnits(cleanInput, base.decimals);

    const { config, error } = usePrepareContractWrite({
      addressOrName: amoAddress,
      contractInterface: amoContract?.interface!,
      functionName: AMOActions.Fn.ADD_LIQUIDITY,
      args: [pool?.seriesId, baseNeeded, fyTokenNeeded, minRatio, maxRatio] as AMOActions.Args.ADD_LIQUIDITY,
      enabled: !!amoContract?.interface,
    });

    const { write } = useContractWrite(config);

    const [cachedBaseReserves, cachedFyTokenReserves] = await pool.contract.getCache();
    const cachedRealReserves = cachedFyTokenReserves.sub(pool.totalSupply);

    const [minRatio, maxRatio] = calcPoolRatios(cachedBaseReserves, cachedRealReserves);

    const description = `Remove ${valueAtDigits(input, 4)} LP tokens`;
    const overrides = {
      gasLimit: 300000,
    };

    handleTransact(_remove, description);
  };

  return { removeLiquidity, isRemovingLiq: isTransacting, removeSubmitted: txSubmitted };
};
