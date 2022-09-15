import { valueAtDigits } from '../../utils/appUtils';
import { IPool } from '../../lib/protocol/types';
import useTransaction from '../useTransaction';
import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi';
import useAMO from '../protocol/useAMO';
import { AMOActions } from '../../lib/tx/operations';
import useAddLiqPreview from '../protocol/useAddLiqPreview';

export const useAddLiquidity = (pool: IPool | undefined, input: string) => {
  const { address: account } = useAccount();
  const { amoContract, amoAddress } = useAMO();
  console.log('🦄 ~ file: useAddLiquidity.ts ~ line 12 ~ useAddLiquidity ~ amoContract', amoContract);
  const { baseNeeded, fyTokenNeeded, minRatio, maxRatio, baseNeeded_, fyTokenNeeded_ } = useAddLiqPreview(pool!, input);

  const { config, error } = usePrepareContractWrite({
    addressOrName: amoAddress!,
    contractInterface: amoContract?.interface!,
    functionName: AMOActions.Fn.ADD_LIQUIDITY,
    args: [pool?.seriesId, baseNeeded, fyTokenNeeded, minRatio, maxRatio] as AMOActions.Args.ADD_LIQUIDITY,
    enabled: !!amoContract?.interface,
  });

  const { write } = useContractWrite(config);
  const { handleTransact, isTransacting, txSubmitted } = useTransaction();

  // description to use in toast
  const description = `Add ${valueAtDigits(baseNeeded_, 4)} ${pool?.base.symbol}
     and ${valueAtDigits(fyTokenNeeded_, 4)} ${pool?.fyToken.symbol} as liquidity`;

  const addLiquidity = async () => {
    if (!pool) throw new Error('no pool');
    if (!account) throw new Error('no connected account');
    if (error) throw new Error('something went wrong');

    handleTransact(() => write?.()!, description);
  };

  return { addLiquidity, isAddingLiquidity: isTransacting, addSubmitted: txSubmitted };
};
