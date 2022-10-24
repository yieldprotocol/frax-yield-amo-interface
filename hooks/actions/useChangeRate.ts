import { valueAtDigits } from '../../utils/appUtils';
import { IPool } from '../../lib/protocol/types';
import useTransaction from '../useTransaction';
import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi';
import useAMO from '../protocol/useAMO';
import { AMOActions } from '../../lib/tx/operations';
import useRatePreview from '../protocol/useRatePreview';
import { ethers } from 'ethers';
import useTenderly from '../useTenderly';
import { sellFYToken } from '@yield-protocol/ui-math';
import useAddSeries from './useAddSeries';
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
  const { contract: amoContract, address: amoAddress, contractInterface } = useAMO();
  const { usingTenderly } = useTenderly();
  const { baseNeeded, baseNeeded_ } = useRatePreview(pool!, input);
  const { seriesAdded, addSeries } = useAddSeries(pool!);

  const increaseRates = method === AMOActions.Fn.INCREASE_RATES;
  // incRates === minFraxReceived, decRates === minFyFraxReceived
  // minFraxReceived from sellFYToken
  const minFraxReceived = ethers.constants.Zero;
  // minFyFraxReceived from sellBase
  const minFyFraxReceived = ethers.constants.Zero;
  const minReceived = increaseRates ? minFraxReceived : minFyFraxReceived;
  const args = [pool?.seriesId, baseNeeded, minReceived];

  const { config, error } = usePrepareContractWrite({
    addressOrName: amoAddress!,
    contractInterface,
    functionName: method,
    args,
    enabled: !!(contractInterface && amoAddress && !usingTenderly),
  });

  const { write } = useContractWrite(config);
  const { handleTransact, isTransacting, txSubmitted } = useTransaction();

  // description to use in toast
  const description = `${increaseRates ? 'Increase' : 'Decrease'} rates ${input}% ${
    pool?.base.symbol
  } using ${valueAtDigits(baseNeeded_, 4)} ${pool?.base.symbol}`;

  const changeRate = async () => {
    if (!account) throw new Error('no connected account');
    if (!pool) throw new Error('no pool');
    if (error) {
      console.log('🦄 ~ file: useChangeRate.ts ~ line 56 ~ changeRate ~ error', error);
    }

    const _changeRate = async () => {
      !seriesAdded && addSeries();

      if (usingTenderly) {
        return increaseRates
          ? await amoContract.increaseRates(...(args as AMOActions.Args.INCREASE_RATES), { gasLimit: 20_000_000 })
          : await amoContract.decreaseRates(...(args as AMOActions.Args.DECREASE_RATES), { gasLimit: 20_000_000 });
      }

      return await write?.()!;
    };

    handleTransact(() => _changeRate(), description);
  };

  return { changeRate, isTransacting, txSubmitted };
};
