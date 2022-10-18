import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { USE_TENDERLY_KEY } from '../constants';
import { useLocalStorage } from './useLocalStorage';

const useTenderly = () => {
  const TENDERLY_FORK_RPC_URL = 'https://rpc.tenderly.co/fork/72a95c1a-3d85-4dd4-b9c4-56269aa125dc';
  const [isUsing, setIsUsing] = useLocalStorage(USE_TENDERLY_KEY, JSON.stringify(false));

  const tenderlyProvider = useMemo(() => new JsonRpcProvider(TENDERLY_FORK_RPC_URL), []);
  const tenderlySigner = useMemo(() => tenderlyProvider.getSigner(), [tenderlyProvider]);

  const getStartBlock = async () => {
    try {
      return +(await tenderlyProvider.send('tenderly_getForkBlockNumber', []));
    } catch (e) {
      console.log('could not get tenderly start block', e);
      return undefined;
    }
  };

  const { data: startBlock } = useSWR(JSON.parse(isUsing) ? '/tenderlyStartBlock' : null, getStartBlock);

  return {
    usingTenderly: JSON.parse(isUsing),
    setUsingTenderly: (isUsing: boolean) => setIsUsing(isUsing.toString()),
    tenderlyProvider,
    tenderlySigner,
    tenderlyStartBlock: startBlock,
    tenderlyRpcUrl: TENDERLY_FORK_RPC_URL,
  };
};

export default useTenderly;
