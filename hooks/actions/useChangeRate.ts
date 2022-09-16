import { valueAtDigits } from '../../utils/appUtils';
import { IPool } from '../../lib/protocol/types';
import useTransaction from '../useTransaction';
import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi';
import useAMO from '../protocol/useAMO';
import { AMOActions } from '../../lib/tx/operations';
import useRatePreview from '../protocol/useRatePreview';
import { ethers } from 'ethers';
import useTenderly from '../useTenderly';
/**
 * Increase or decrease rates based on the desired rate (input) using an estimated amount of frax
 * Increasing rates entails minting fyFrax from frax and selling into the pool
 * Decreasing rates entails selling frax then burning corresponding fyFrax
 * @param pool
 * @param input
 * @param method
 */
export const useChangeRate = (
  pool: IPool | undefined,
  input: number, // rate to change to
  method: AMOActions.Fn.INCREASE_RATES | AMOActions.Fn.DECREASE_RATES
) => {
  const { address: account } = useAccount();
  const { amoContract, amoAddress, timelockAddress } = useAMO();
  const { usingTenderly } = useTenderly();
  const { baseNeeded, baseNeeded_ } = useRatePreview(pool!, input);

  const increaseRates = method === AMOActions.Fn.INCREASE_RATES;
  // incRates === minFraxReceived, decRates === minFyFraxReceived
  // minFraxReceived from sellFYToken
  const minFraxReceived = ethers.constants.Zero;
  // minFyFraxReceived from sellBase
  const minFyFraxReceived = ethers.constants.Zero;
  const minReceived = increaseRates ? minFraxReceived : minFyFraxReceived;

  const { config, error } = usePrepareContractWrite({
    addressOrName: amoAddress!,
    contractInterface: amoContract?.interface!,
    functionName: method,
    args: [pool?.seriesId, baseNeeded, minReceived] as AMOActions.Args.INCREASE_RATES | AMOActions.Args.DECREASE_RATES,
    enabled: !!(amoContract?.interface && amoAddress),
    overrides: { gasLimit: usingTenderly ? 20_000_000 : undefined },
  });

  const { write } = useContractWrite(config);
  const { handleTransact, isTransacting, txSubmitted } = useTransaction();

  // description to use in toast
  const description = `${method === AMOActions.Fn.INCREASE_RATES ? 'Increase' : 'Decrease'} rates ${input}% ${
    pool?.base.symbol
  } using ${valueAtDigits(baseNeeded_, 4)} ${pool?.base.symbol}`;

  const changeRate = async () => {
    if (!account) throw new Error('no connected account');
    if (!pool) throw new Error('no pool');
    if (error) {
      console.log('🦄 ~ file: useChangeRate.ts ~ line 56 ~ changeRate ~ error', error);
    }

    handleTransact(() => write?.()!, description);
  };

  return { changeRate, isTransacting, txSubmitted };
};
