import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { ContractTransaction } from 'ethers';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useSWRConfig } from 'swr';
import { useAccount, useBalance, useNetwork } from 'wagmi';
import useTenderly from './useTenderly';
import useToasty from './useToasty';

const useTransaction = () => {
  const { address: account } = useAccount();
  const { chain } = useNetwork();
  const { refetch } = useBalance({ addressOrName: account, chainId: chain?.id });
  const { mutate } = useSWRConfig();
  const { toasty } = useToasty();
  const { usingTenderly } = useTenderly();
  const addRecentTransaction = useAddRecentTransaction();

  const chainId = chain?.id || 1;
  const explorer = chain?.blockExplorers?.default.url;

  const [isTransacting, setIsTransacting] = useState<boolean>(false);
  const [txSubmitted, setTxSubmitted] = useState<boolean>(false);

  const handleTransact = async (
    promise: () => Promise<ContractTransaction | undefined> | undefined,
    description: string
  ) => {
    try {
      setIsTransacting(true);
      setTxSubmitted(false);

      const res = await promise();

      setIsTransacting(false);
      setTxSubmitted(true);

      try {
        if (res) {
          addRecentTransaction({ hash: res.hash!, description });

          res &&
            toasty(
              async () => {
                await res?.wait();
                mutate(`/pools?chainId=${chainId}&usingTenderly=${usingTenderly}`);
                refetch(); // refetch ETH balance
              },
              description,
              explorer && `${explorer}/tx/${res.hash}`
            );
        }
        return res;
      } catch (e) {
        console.log(e);
        toast.error('Transaction failed');

        setIsTransacting(false);
        setTxSubmitted(false);
      }
    } catch (e) {
      console.log(e);
      toast.error('Transaction rejected');

      setIsTransacting(false);
      setTxSubmitted(false);
    }
  };

  return { handleTransact, isTransacting, txSubmitted };
};

export default useTransaction;
