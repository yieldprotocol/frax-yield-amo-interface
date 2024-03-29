import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { SendTransactionResult } from '@wagmi/core';
import { ContractTransaction } from 'ethers';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useBalance, useContractRead, useNetwork } from 'wagmi';
import { FRAX_ADDRESS } from '../config/assets';
import { IPool } from '../lib/protocol/types';
import { AMOActions } from '../lib/tx/operations';
import useAMO from './protocol/useAMO';
import usePool from './protocol/usePool';
import useTenderly from './useTenderly';
import useToasty from './useToasty';

const useTransaction = (pool?: IPool) => {
  const { refetch: refetchPool } = usePool(pool?.address!);
  const { chain } = useNetwork();
  const { address, contractInterface } = useAMO();
  const { refetch: refetchFraxBal } = useBalance({
    addressOrName: address,
    token: FRAX_ADDRESS,
  });
  const { refetch: refetchAllocations } = useContractRead({
    addressOrName: address!,
    contractInterface,
    functionName: AMOActions.Fn.SHOW_ALLOCATIONS,
    args: [pool?.seriesId] as AMOActions.Args.SHOW_ALLOCATIONS,
    enabled: !!pool,
  });
  const { refetch: refetchLpBal } = useBalance({
    addressOrName: address,
    token: pool?.address,
  });

  const { toasty } = useToasty();
  const { usingTenderly } = useTenderly();
  const addRecentTransaction = useAddRecentTransaction();

  const explorer = usingTenderly
    ? `https://dashboard.tenderly.co/Yield/v2/fork/${process.env.tenderlyForkId}/`
    : chain?.blockExplorers?.default.url;

  const [isTransacting, setIsTransacting] = useState<boolean>(false);
  const [txSubmitted, setTxSubmitted] = useState<boolean>(false);

  const handleTransact = async (
    promise: () => Promise<SendTransactionResult | ContractTransaction | undefined> | undefined,
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
                await res.wait();

                refetchPool();
                refetchFraxBal(); // refetch FRAX balance
                refetchAllocations(); // refetch AMO allocations
                refetchLpBal();
              },
              description,
              explorer && `${explorer}/${usingTenderly ? '' : `tx/${res.hash}`}`
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
