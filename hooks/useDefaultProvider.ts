import { JsonRpcProvider } from '@ethersproject/providers';
import { useMemo } from 'react';

const useDefaultProvider = () => {
  return useMemo(() => {
    try {
      return new JsonRpcProvider(`https://mainnet.infura.io/v3/${process.env.infuraKey}`);
    } catch (e) {
      throw new Error('no provider detected');
    }
  }, []);
};

export default useDefaultProvider;
