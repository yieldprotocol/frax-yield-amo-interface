import { JsonRpcProvider } from '@ethersproject/providers';
import { useMemo } from 'react';
import useSWR from 'swr';
import { USE_TENDERLY_KEY } from '../constants';
import { useLocalStorage } from './useLocalStorage';

const useTenderly = () => {
  const TENDERLY_FORK_RPC_URL = 'https://rpc.tenderly.co/fork/72a95c1a-3d85-4dd4-b9c4-56269aa125dc';
  const [isUsing, setIsUsing] = useLocalStorage(USE_TENDERLY_KEY, JSON.stringify(false));
  const usingTenderly = JSON.parse(isUsing) as boolean;

  const tenderlyProvider = useMemo(() => new JsonRpcProvider(TENDERLY_FORK_RPC_URL), []);

  const getStartBlock = async () => {
    try {
      return +(await tenderlyProvider.send('tenderly_getForkBlockNumber', []));
    } catch (e) {
      console.log('could not get tenderly start block', e);
      return undefined;
    }
  };

  const { data: startBlock } = useSWR('/tenderlyStartBlock', getStartBlock, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
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
