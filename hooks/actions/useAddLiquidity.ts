import { valueAtDigits } from '../../utils/appUtils';
import { IPool } from '../../lib/protocol/types';
import useTransaction from '../useTransaction';
import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi';
import useAMO from '../protocol/useAMO';
import { AMOActions } from '../../lib/tx/operations';
import useAddLiqPreview from '../protocol/useAddLiqPreview';
import useTenderly from '../useTenderly';
import useAddSeries from './useAddSeries';
import useBase from '../protocol/useBase';

export const useAddLiquidity = (pool: IPool | undefined, input: string) => {
  const { data: base } = useBase(pool?.base!);
  const { address: account } = useAccount();
  const { contract: amoContract, address: amoAddress, contractInterface } = useAMO();
  const { usingTenderly } = useTenderly();
  const { baseNeeded, fyTokenNeeded, minRatio, maxRatio, baseNeeded_, fyTokenNeeded_ } = useAddLiqPreview(
    pool?.address!,
    input
  );
  const { seriesAdded, addSeries } = useAddSeries(pool!);
  const { handleTransact, isTransacting, txSubmitted } = useTransaction(pool);

  const args = [pool?.seriesId, baseNeeded, fyTokenNeeded, minRatio, maxRatio] as AMOActions.Args.ADD_LIQUIDITY;

  // wagmi
  const { config, error } = usePrepareContractWrite({
    addressOrName: amoAddress!,
    contractInterface,
    functionName: AMOActions.Fn.ADD_LIQUIDITY,
    args,
    enabled: !!(contractInterface && amoAddress && !usingTenderly),
  });

  const { writeAsync } = useContractWrite(config);

  const addLiquidity = async () => {
    if (!account) throw new Error('no connected account');
    if (!pool) throw new Error('no pool');
    if (error && !usingTenderly) {
      console.log('🦄 ~ file: useAddLiquidity.ts ~ line 36 ~ addLiquidity ~ error', error);
      return;
    }

    if (!writeAsync && !usingTenderly) {
      console.log('🦄 ~ file: useAddLiquidity.ts ~ line 38 ~ addLiquidity ~ !write');
      return;
    }

    // description to use in toast
    const description = `Add ${valueAtDigits(baseNeeded_, 4)} ${base?.symbol}
     and ${valueAtDigits(fyTokenNeeded_, 4)} ${pool.fyToken.symbol} as liquidity`;

    const addLiq = async () => {
      !seriesAdded && addSeries();

      if (usingTenderly) {
        return await amoContract.addLiquidityToAMM(...args, { gasLimit: 20_000_000 });
      }

      return writeAsync?.()!;
    };

    handleTransact(addLiq, description);
  };

  return { addLiquidity, isAddingLiquidity: isTransacting, addSubmitted: txSubmitted };
};
