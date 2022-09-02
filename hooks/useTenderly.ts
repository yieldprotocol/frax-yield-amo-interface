import { useState } from 'react';
import { TENDERLY_RPC_URL_KEY, USE_TENDERLY_KEY } from '../constants';
import { useLocalStorage } from './useLocalStorage';

const useTenderly = () => {
  const [isUsing, setIsUsing] = useLocalStorage(USE_TENDERLY_KEY, 'false');
  const [tenderlyRpcUrl, setTenderlyRpcUrl] = useLocalStorage(TENDERLY_RPC_URL_KEY, '');

  return { isUsing, setIsUsing, tenderlyRpcUrl, setTenderlyRpcUrl };
};

export default useTenderly;
