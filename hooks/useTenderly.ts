import { JsonRpcProvider } from '@ethersproject/providers';
import { useMemo } from 'react';
import useSWR from 'swr/immutable';
import { USE_TENDERLY_KEY } from '../constants';
import { useLocalStorage } from './useLocalStorage';

const useTenderly = () => {
  const TENDERLY_FORK_RPC_URL = 'https://rpc.tenderly.co/fork/48aa91dc-c833-4124-a108-d61354bdbc01';
  const [isUsing, setIsUsing] = useLocalStorage(USE_TENDERLY_KEY, JSON.stringify(false));
  const usingTenderly = useMemo(() => JSON.parse(isUsing) as boolean, [isUsing]);

  const tenderlyProvider = useMemo(() => (usingTenderly ? new JsonRpcProvider(TENDERLY_FORK_RPC_URL) : undefined), []);

  const getStartBlock = async () => {
    if (tenderlyProvider) {
      try {
        return +(await tenderlyProvider.send('tenderly_getForkBlockNumber', []));
      } catch (e) {
        console.log('could not get tenderly start block', e);
        return undefined;
      }
    }
    return undefined;
  };

  const { data: startBlock } = useSWR('/tenderlyStartBlock', getStartBlock, {
    shouldRetryOnError: false,
  });

  return {
    usingTenderly,
    setUsingTenderly: (isUsing: boolean) => setIsUsing(isUsing.toString()),
    tenderlyProvider,
    tenderlyStartBlock: startBlock,
    tenderlyRpcUrl: TENDERLY_FORK_RPC_URL,
  };
};

export default useTenderly;
