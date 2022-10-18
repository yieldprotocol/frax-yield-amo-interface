import { valueAtDigits } from '../../utils/appUtils';
import { IPool } from '../../lib/protocol/types';
import useTransaction from '../useTransaction';
import { useAccount, useContractWrite, usePrepareContractWrite, useSigner } from 'wagmi';
import useAMO from '../protocol/useAMO';
import { AMOActions } from '../../lib/tx/operations';
import useAddLiqPreview from '../protocol/useAddLiqPreview';
import useTenderly from '../useTenderly';

export const useAddLiquidity = (pool: IPool | undefined, input: string) => {
  const { address: account } = useAccount();
  const { data: signer } = useSigner();
  const { amoContract, amoAddress, timelockAddress } = useAMO();
  const { usingTenderly, tenderlySigner } = useTenderly();
  const { baseNeeded, fyTokenNeeded, minRatio, maxRatio, baseNeeded_, fyTokenNeeded_ } = useAddLiqPreview(pool!, input);

  // const { config, error } = usePrepareContractWrite({
  //   addressOrName: amoAddress!,
  //   contractInterface: amoContract?.interface!,
  //   functionName: AMOActions.Fn.ADD_LIQUIDITY,
  //   args: [pool?.seriesId, baseNeeded, fyTokenNeeded, minRatio, maxRatio] as AMOActions.Args.ADD_LIQUIDITY,
  //   enabled: !!((amoContract?.interface && amoAddress) || (usingTenderly && tenderlySigner)),
  //   overrides: { gasLimit: usingTenderly ? 20_000_000 : undefined },
  //   signer: usingTenderly ? tenderlySigner : signer,
  // });

  // const { write } = useContractWrite(config);
  const { handleTransact, isTransacting, txSubmitted } = useTransaction();

  const addLiquidity = async () => {
    if (!account) throw new Error('no connected account');
    if (!pool) throw new Error('no pool');
    // if (error) {
    //   console.log('🦄 ~ file: useAddLiquidity.ts ~ line 36 ~ addLiquidity ~ error', error);
    //   return;
    // }

    // if (!write) {
    //   console.log('🦄 ~ file: useAddLiquidity.ts ~ line 38 ~ addLiquidity ~ !write');
    //   return;
    // }

    // description to use in toast
    const description = `Add ${valueAtDigits(baseNeeded_, 4)} ${pool.base.symbol}
     and ${valueAtDigits(fyTokenNeeded_, 4)} ${pool.fyToken.symbol} as liquidity`;

    const addLiq = async () => {
      const amoArgs = [pool?.seriesId, baseNeeded, fyTokenNeeded, minRatio, maxRatio] as AMOActions.Args.ADD_LIQUIDITY;
      return await amoContract?.addLiquidityToAMM(...amoArgs, { gasLimit: 20_000_000 });
    };

    handleTransact(addLiq, description);
  };

  return { addLiquidity, isAddingLiquidity: isTransacting, addSubmitted: txSubmitted };
};
