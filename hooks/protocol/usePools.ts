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
  const { amoAddress } = useAMO();
  const provider = useDefaultProvider();
  const contractMap = useContracts(provider!);
  const { usingTenderly, tenderlyProvider, tenderlyStartBlock } = useTenderly();
  const tenderlyContractMap = useContracts(tenderlyProvider);

  const [poolAddresses, setPoolAddresses] = useState<string[]>();
  const [seriesAddedEvents, setSeriesAddedEvents] = useState<SeriesAddedEvent[]>();

  useEffect(() => {
    async function getAllPoolAddresses() {
      let addresses: Set<string>;

      // get the pool addies from fallback provider events
      const ladle = contractMap![LADLE] as Ladle;
      if (!ladle) return;
      const currPoolAddresses = await getPoolAddresses(ladle);
      addresses = new Set(currPoolAddresses);

      if (usingTenderly && tenderlyContractMap && tenderlyStartBlock) {
        const tenderlyLadle = tenderlyContractMap[LADLE] as Ladle;
        // get the pool addies from tenderly provider events
        const tenderlyPoolAddresses = await getPoolAddresses(tenderlyLadle, tenderlyStartBlock);
        addresses = new Set([...currPoolAddresses, ...tenderlyPoolAddresses]);
      }

      setPoolAddresses(Array.from(addresses.values()));
    }

    async function getAllSeriesAddedEvents() {
      let events: Set<SeriesAddedEvent>;

      // get the series added events from fallback provider events
      const cauldron = contractMap![CAULDRON] as Cauldron;
      if (!cauldron) return;
      const currEvents = await getSeriesEvents(cauldron);
      events = new Set(currEvents);

      if (usingTenderly && tenderlyContractMap && tenderlyStartBlock) {
        const tenderlyCauldron = tenderlyContractMap[CAULDRON] as Cauldron;
        // get the pool addies from tenderly provider events
        const tenderlyEvents = await getSeriesEvents(tenderlyCauldron, tenderlyStartBlock);
        events = new Set([...currEvents, ...tenderlyEvents]);
      }

      setSeriesAddedEvents(Array.from(events.values()));
    }

    getAllPoolAddresses();
    getAllSeriesAddedEvents();
  }, [contractMap, tenderlyContractMap, tenderlyStartBlock, usingTenderly]);

  const { data, error } = useSWR(
    provider && chain?.id && amoAddress && poolAddresses && seriesAddedEvents
      ? `/pools/${chain?.id}/${amoAddress}`
      : null,
    () => getPools(provider!, chain?.id, amoAddress, poolAddresses, seriesAddedEvents),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    data: data as IPoolMap | undefined,
    loading: !data && !error,
    error,
  };
};

export default usePools;
