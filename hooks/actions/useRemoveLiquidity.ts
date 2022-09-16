import { ethers } from 'ethers';
import { IPool } from '../../lib/protocol/types';
import { cleanValue, valueAtDigits } from '../../utils/appUtils';
import { calcPoolRatios } from '../../utils/yieldMath';
import useTransaction from '../useTransaction';
import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi';
import useAMO from '../protocol/useAMO';
import useRemoveLiqPreview from '../protocol/useRemoveLiqPreview';
import { AMOActions } from '../../lib/tx/operations';
import useTenderly from '../useTenderly';

export const useRemoveLiquidity = (pool: IPool, input: string) => {
  const { address: account } = useAccount();
  const { amoContract, amoAddress, timelockAddress } = useAMO();
  const { usingTenderly } = useTenderly();
  const { minRatio, maxRatio } = useRemoveLiqPreview(pool!, input);
  const { handleTransact, isTransacting, txSubmitted } = useTransaction();
  const { base, address: poolAddress, contract: poolContract, isMature, seriesId, fyToken } = pool;

  const cleanInput = cleanValue(input, base.decimals);
  const _input = ethers.utils.parseUnits(cleanInput, base.decimals);

  const { config, error } = usePrepareContractWrite({
    addressOrName: amoAddress!,
    contractInterface: amoContract?.interface!,
    functionName: AMOActions.Fn.REMOVE_LIQUIDITY,
    args: [pool?.seriesId, _input, minRatio, maxRatio] as AMOActions.Args.REMOVE_LIQUIDITY,
    enabled: !!(amoContract?.interface && amoAddress),
    overrides: { gasLimit: usingTenderly ? 20_000_000 : undefined },
  });

  const { write } = useContractWrite(config);

  const description = `Remove ${valueAtDigits(input, 4)} LP tokens`;

  const removeLiquidity = async () => {
    if (error) {
      console.log('🦄 ~ file: useRemoveLiquidity.ts ~ line 36 ~ removeLiquidity ~ error', error);
    }
    handleTransact(() => write?.()!, description);
  };

  return { removeLiquidity, isRemovingLiq: isTransacting, removeSubmitted: txSubmitted };
};
