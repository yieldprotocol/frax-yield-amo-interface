import { useEffect } from 'react';
import useSWR from 'swr';
import { useNetwork } from 'wagmi';
import { getPools } from '../../lib/protocol';
import { IPoolMap } from '../../lib/protocol/types';
import useDefaultProvider from '../useDefaultProvider';
import useTenderly from '../useTenderly';
import useContracts from './useContracts';

const usePools = () => {
  const { chain } = useNetwork();
  const chainId = chain?.id! || 1;
  const provider = useDefaultProvider();

  const { usingTenderly, tenderlyProvider, tenderlyStartBlock } = useTenderly();
  const contractMap = useContracts(provider);
  const tenderlyContractMap = useContracts(tenderlyProvider!);

  // useEffect(() => {
  //   console.log('🦄 ~ file: usePools.ts ~ line 13 ~ usePools ~ chainId', chainId);
  // }, [chainId]);

  // useEffect(() => {
  //   console.log('🦄 ~ file: usePools.ts ~ line 16 ~ usePools ~ usingTenderly', usingTenderly);
  // }, [usingTenderly]);

  // useEffect(() => {
  //   console.log('🦄 ~ file: usePools.ts ~ line 17 ~ usePools ~ contractMap', contractMap);
  // }, [contractMap]);

  // useEffect(() => {
  //   console.log('🦄 ~ file: usePools.ts ~ line 18 ~ usePools ~ tenderlyContractMap', tenderlyContractMap);
  // }, [tenderlyContractMap]);

  const { data, error } = useSWR(
    `/pools?chainId=${chainId}&usingTenderly=${usingTenderly}`,
    () => getPools(provider, contractMap!, chainId, usingTenderly, tenderlyContractMap, tenderlyStartBlock),
    { revalidateOnFocus: false }
  );

  // console.log('🦄 ~ file: usePools.ts ~ line 19 ~ usePools ~ data', data);
  return {
    data: data as IPoolMap | undefined,
    loading: !data && !error,
    error,
  };
};

export default usePools;
