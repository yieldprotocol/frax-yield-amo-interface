import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { useNetwork } from 'wagmi';
import { CAULDRON, LADLE } from '../../constants';
import { Ladle, Cauldron } from '../../contracts/types';
import { SeriesAddedEvent } from '../../contracts/types/Cauldron';
import { getPoolAddresses, getPools, getSeriesEvents } from '../../lib/protocol';
import { IPoolMap } from '../../lib/protocol/types';
import useDefaultProvider from '../useDefaultProvider';
import useTenderly from '../useTenderly';
import useAMO from './useAMO';
import useContracts from './useContracts';

const usePools = () => {
  const { chain } = useNetwork();
  const chainId = chain?.id! || 1;
  const { amoAddress } = useAMO();
  const provider = useDefaultProvider();
  const contractMap = useContracts(provider);

  const { usingTenderly, tenderlyProvider, tenderlyStartBlock } = useTenderly();
  const tenderlyContractMap = useContracts(tenderlyProvider);

  const _getAllPoolAddresses = async () => {
    let addresses: Set<string>;

    if (!contractMap) return;

    // get the pool addies from fallback provider events
    const ladle = contractMap[LADLE] as Ladle;
    if (!ladle) return;
    const currPoolAddresses = await getPoolAddresses(ladle);
    addresses = new Set(currPoolAddresses);

    if (usingTenderly && tenderlyContractMap && tenderlyStartBlock) {
      const tenderlyLadle = tenderlyContractMap[LADLE] as Ladle;
      // get the pool addies from tenderly provider events
      const tenderlyPoolAddresses = await getPoolAddresses(tenderlyLadle, tenderlyStartBlock);
      addresses = new Set([...currPoolAddresses, ...tenderlyPoolAddresses]);
    }
    return Array.from(addresses.values());
  };

  // get pool addresses
  const { data: poolAddresses, isValidating } = useSWR(
    `/poolAddresses?chainId=${chainId}&usingTenderly=${usingTenderly}`,
    _getAllPoolAddresses,
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
    }
  );

  const _getAllSeriesAddedEvents = async () => {
    let events: Set<SeriesAddedEvent>;

    if (!contractMap) return;

    // get the series added events from fallback provider events
    const cauldron = contractMap[CAULDRON] as Cauldron;
    if (!cauldron) return;

    const currEvents = await getSeriesEvents(cauldron);
    events = new Set(currEvents);

    if (usingTenderly && tenderlyContractMap && tenderlyStartBlock) {
      const tenderlyCauldron = tenderlyContractMap[CAULDRON] as Cauldron;
      // get the pool addies from tenderly provider events
      const tenderlyEvents = await getSeriesEvents(tenderlyCauldron, tenderlyStartBlock);
      events = new Set([...currEvents, ...tenderlyEvents]);
    }
    return Array.from(events.values());
  };

  // get series added events
  const { data: seriesAddedEvents, isValidating: isValidatingSeries } = useSWR(
    `/seriesAddedEvents?chainId=${chainId}&usingTenderly=${usingTenderly}`,
    _getAllSeriesAddedEvents,
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
    }
  );

  const { data, error } = useSWR(
    `/pools?chainId=${chainId}&usingTenderly=${usingTenderly}`,
    () => getPools(usingTenderly ? tenderlyProvider : provider, chainId, amoAddress, poolAddresses, seriesAddedEvents),
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
    }
  );

  return {
    data: data as IPoolMap | undefined,
    loading: !data && !error,
    error,
  };
};

export default usePools;
