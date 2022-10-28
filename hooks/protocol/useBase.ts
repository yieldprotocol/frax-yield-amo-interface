import { useMemo } from 'react';
import { useContractReads } from 'wagmi';
import { ERC20Permit__factory } from '../../contracts/types';
import { IBase } from '../../lib/protocol/types';
import useDefaultProvider from '../useDefaultProvider';
import useTenderly from '../useTenderly';

const useBase = (address: string | undefined) => {
  const { usingTenderly, tenderlyProvider } = useTenderly();
  const provider = useDefaultProvider();

  const contractInterface = useMemo(
    () =>
      address
        ? ERC20Permit__factory.connect(address, usingTenderly ? tenderlyProvider : provider).interface
        : undefined,
    [address, provider, tenderlyProvider, usingTenderly]
  );

  const { data, error, isLoading } = useContractReads({
    contracts: [
      {
        addressOrName: address!,
        contractInterface: contractInterface!,
        functionName: 'symbol',
      },
      {
        addressOrName: address!,
        contractInterface: contractInterface!,
        functionName: 'name',
      },
      {
        addressOrName: address!,
        contractInterface: contractInterface!,
        functionName: 'decimals',
      },
    ],
    enabled: !!address && !!contractInterface,
    cacheTime: 3_600_000,
    keepPreviousData: true,
  });

  const _data = useMemo(() => {
    if (!data) return;
    const [symbol, name, decimals] = data as unknown as [symbol: string, name: string, decimals: number];
    return {
      symbol,
      name,
      decimals,
      digitFormat: 2,
    } as IBase;
  }, [data]);

  return { data: _data, error, isLoading };
};

export default useBase;
