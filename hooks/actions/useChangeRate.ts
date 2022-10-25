import { valueAtDigits } from '../../utils/appUtils';
import { IPool } from '../../lib/protocol/types';
import useTransaction from '../useTransaction';
import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi';
import useAMO from '../protocol/useAMO';
import { AMOActions } from '../../lib/tx/operations';
import useRatePreview from '../protocol/useRatePreview';
import { ethers } from 'ethers';
import useTenderly from '../useTenderly';
import useAddSeries from './useAddSeries';
import useContracts from '../protocol/useContracts';
import useDefaultProvider from '../useDefaultProvider';
import { LADLE } from '../../constants';
import { Ladle } from '../../contracts/types';
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
  const { usingTenderly, tenderlyProvider } = useTenderly();
  const increaseRates = method === AMOActions.Fn.INCREASE_RATES;
  const { baseNeeded, baseNeeded_, ratePreview, fyTokenBought } = useRatePreview(
    pool!,
    input,
    undefined,
    false,
    increaseRates
  );
  const { seriesAdded, addSeries } = useAddSeries(pool!);
  const provider = useDefaultProvider();
  const contracts = useContracts(usingTenderly ? tenderlyProvider : provider);

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
  const description = `${increaseRates ? 'Increase' : 'Decrease'} rates to ${ratePreview}% using ${valueAtDigits(
    baseNeeded_,
    4
  )} ${pool?.base.symbol}`;

  const changeRate = async () => {
    if (!account) throw new Error('no connected account');
    if (!pool) throw new Error('no pool');
    if (error) {
      console.log('🦄 ~ file: useChangeRate.ts ~ line 56 ~ changeRate ~ error', error);
    }

    const _changeRate = async () => {
      const ladle = contracts![LADLE] as Ladle;

      !seriesAdded && addSeries();

      // need to add approval to contract
      // add approval for amount of fyToken bought from pool and burned, only if decreasing rates
      if (!increaseRates) {
        await pool.fyToken.contract
          .connect((usingTenderly ? tenderlyProvider : provider).getSigner(amoAddress))
          .approve(ladle.address, fyTokenBought, { gasLimit: 20_000_000 });
      }

      if (usingTenderly) {
        if (increaseRates) {
          return await amoContract.increaseRates(...(args as AMOActions.Args.INCREASE_RATES), { gasLimit: 20_000_000 });
        } else {
          return await amoContract.decreaseRates(...(args as AMOActions.Args.DECREASE_RATES), { gasLimit: 20_000_000 });
        }
      }

      return await write?.()!;
    };

    handleTransact(() => _changeRate(), description);
  };

  return { changeRate, isTransacting, txSubmitted };
};
