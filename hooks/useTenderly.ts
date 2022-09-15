import { JsonRpcProvider } from '@ethersproject/providers';
import { useEffect, useMemo, useState } from 'react';
import { USE_TENDERLY_KEY } from '../constants';
import { useLocalStorage } from './useLocalStorage';

const useTenderly = () => {
  const TENDERLY_FORK_RPC_URL = 'https://rpc.tenderly.co/fork/72a95c1a-3d85-4dd4-b9c4-56269aa125dc';
  const [isUsing, setIsUsing] = useLocalStorage(USE_TENDERLY_KEY, 'false');
  const [startBlock, setStartBlock] = useState<number>();

  const tenderlyProvider = useMemo(() => new JsonRpcProvider(TENDERLY_FORK_RPC_URL), []);

  useEffect(() => {
    const getStartBlock = async () => {
      try {
        const num = await tenderlyProvider.send('tenderly_getForkBlockNumber', []);
        setStartBlock(+num.toString());
      } catch (e) {
        console.log('could not get tenderly start block', e);
      }
    };

    if (isUsing) getStartBlock();
  }, [isUsing, tenderlyProvider]);

  return {
    usingTenderly: !!isUsing as boolean,
    setUsingTenderly: setIsUsing,
    tenderlyProvider,
    tenderlyStartBlock: startBlock,
    tenderlyRpcUrl: TENDERLY_FORK_RPC_URL,
  };
};

export default useTenderly;
