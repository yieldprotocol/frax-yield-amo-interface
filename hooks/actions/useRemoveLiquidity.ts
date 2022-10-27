import { ethers } from 'ethers';
import { IPool } from '../../lib/protocol/types';
import { cleanValue, valueAtDigits } from '../../utils/appUtils';
import useTransaction from '../useTransaction';
import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi';
import useAMO from '../protocol/useAMO';
import useRemoveLiqPreview from '../protocol/useRemoveLiqPreview';
import { AMOActions } from '../../lib/tx/operations';
import useTenderly from '../useTenderly';
import useContracts from '../protocol/useContracts';
import useDefaultProvider from '../useDefaultProvider';
import { LADLE } from '../../constants';
import { Ladle } from '../../contracts/types';
import { parseUnits } from 'ethers/lib/utils';
import usePool from '../protocol/usePool';

export const useRemoveLiquidity = (pool: IPool | undefined, input: string) => {
  const { address: account } = useAccount();
  const { data: poolData } = usePool(pool?.address);
  const { address: amoAddress, contractInterface, contract: amoContract } = useAMO();
  const provider = useDefaultProvider();
  const { usingTenderly, tenderlyProvider } = useTenderly();
  const contracts = useContracts(usingTenderly ? tenderlyProvider : provider);
  const { minRatio, maxRatio, fyTokenReceived } = useRemoveLiqPreview(pool?.address!, input);
  const { handleTransact, isTransacting, txSubmitted } = useTransaction(pool);

  const cleanInput = cleanValue(input || '0', poolData?.decimals);
  const _input = ethers.utils.parseUnits(cleanInput, poolData?.decimals);
  const args = [pool?.seriesId, _input, minRatio, maxRatio] as AMOActions.Args.REMOVE_LIQUIDITY;

  const { config, error } = usePrepareContractWrite({
    addressOrName: amoAddress!,
    contractInterface,
    functionName: AMOActions.Fn.REMOVE_LIQUIDITY,
    args,
    enabled: !!(contractInterface && amoAddress && !usingTenderly),
  });

  const { writeAsync } = useContractWrite(config);

  const removeLiquidity = async () => {
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

    const description = `Remove ${valueAtDigits(input, 4)} LP tokens`;

    const removeLiq = async () => {
      const ladle = contracts![LADLE] as Ladle;
      const _fyTokenToBurn = parseUnits(fyTokenReceived!, pool.fyToken.decimals);

      // need to add approval to contract
      await pool.fyToken.contract
        .connect((usingTenderly ? tenderlyProvider : provider).getSigner(amoAddress))
        .approve(ladle.address, _fyTokenToBurn, { gasLimit: 20_000_000 });

      if (usingTenderly && false) {
        return await amoContract.removeLiquidityFromAMM(...args, { gasLimit: 20_000_000 });
      }

      return writeAsync?.()!;
    };

    handleTransact(removeLiq, description);
  };

  return { removeLiquidity, isRemovingLiq: isTransacting, removeSubmitted: txSubmitted };
};
