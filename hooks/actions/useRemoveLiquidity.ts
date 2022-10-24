import { ethers } from 'ethers';
import { IPool } from '../../lib/protocol/types';
import { cleanValue, valueAtDigits } from '../../utils/appUtils';
import useTransaction from '../useTransaction';
import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi';
import useAMO from '../protocol/useAMO';
import useRemoveLiqPreview from '../protocol/useRemoveLiqPreview';
import { AMOActions } from '../../lib/tx/operations';
import useTenderly from '../useTenderly';

export const useRemoveLiquidity = (pool: IPool | undefined, input: string) => {
  const { address: account } = useAccount();
  const { address: amoAddress, contractInterface, contract: amoContract } = useAMO();
  const { usingTenderly } = useTenderly();
  const { minRatio, maxRatio } = useRemoveLiqPreview(pool!, input);
  const { handleTransact, isTransacting, txSubmitted } = useTransaction();

  const cleanInput = cleanValue(input || '0', pool?.decimals);
  const _input = ethers.utils.parseUnits(cleanInput, pool?.decimals);
  const args = [pool?.seriesId, _input, minRatio, maxRatio] as AMOActions.Args.REMOVE_LIQUIDITY;

  const { config, error } = usePrepareContractWrite({
    addressOrName: amoAddress!,
    contractInterface,
    functionName: AMOActions.Fn.REMOVE_LIQUIDITY,
    args,
    enabled: !!(contractInterface && amoAddress && !usingTenderly),
  });

  const { write } = useContractWrite(config);

  const removeLiquidity = async () => {
    if (!account) throw new Error('no connected account');
    if (!pool) throw new Error('no pool');

    if (error && !usingTenderly) {
      console.log('🦄 ~ file: useAddLiquidity.ts ~ line 36 ~ addLiquidity ~ error', error);
      return;
    }

    if (!write && !usingTenderly) {
      console.log('🦄 ~ file: useAddLiquidity.ts ~ line 38 ~ addLiquidity ~ !write');
      return;
    }

    const description = `Remove ${valueAtDigits(input, 4)} LP tokens`;

    const removeLiq = async () => {
      if (usingTenderly) {
        return await amoContract.removeLiquidityFromAMM(...args, { gasLimit: 20_000_000 });
      }

      return await write?.()!;
    };

    handleTransact(() => removeLiq(), description);
  };

  return { removeLiquidity, isRemovingLiq: isTransacting, removeSubmitted: txSubmitted };
};
