import { JsonRpcProvider } from '@ethersproject/providers';
import { useContext, useMemo } from 'react';
import useSWR from 'swr/immutable';
import { SettingsContext } from '../contexts/SettingsContext';

const useTenderly = () => {
  const TENDERLY_FORK_RPC_URL = 'https://rpc.tenderly.co/fork/48aa91dc-c833-4124-a108-d61354bdbc01';
  const {
    state: { usingTenderly },
  } = useContext(SettingsContext);

  const tenderlyProvider = useMemo(() => new JsonRpcProvider(TENDERLY_FORK_RPC_URL), []);

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
    dedupingInterval: 3_600_000, // dont duplicate a request w/ same key for 1hr
  });

  return {
    usingTenderly,
    tenderlyProvider,
    tenderlyStartBlock: startBlock,
    tenderlyRpcUrl: TENDERLY_FORK_RPC_URL,
  };
};

export default useTenderly;
