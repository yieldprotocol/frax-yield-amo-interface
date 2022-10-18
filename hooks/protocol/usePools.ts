import useSWR from 'swr';
import { useNetwork } from 'wagmi';
import { CAULDRON, LADLE } from '../../constants';
import { Ladle, Cauldron } from '../../contracts/types';
import { SeriesAddedEvent } from '../../contracts/types/Cauldron';
import { getPoolAddresses, getPools, getSeriesEvents } from '../../lib/protocol';
import { IContractMap, IPoolMap } from '../../lib/protocol/types';
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

  const _getAllPoolAddresses = async (contractMap: IContractMap) => {
    let addresses: Set<string>;

    // get the pool addies from fallback provider events
    const ladle = contractMap[LADLE] as Ladle;
    if (!ladle) return;
    const currPoolAddresses = await getPoolAddresses(ladle);
    addresses = new Set(currPoolAddresses);

    if (usingTenderly && tenderlyStartBlock) {
      // get the pool addies from tenderly provider events
      const tenderlyPoolAddresses = await getPoolAddresses(ladle, tenderlyStartBlock);
      addresses = new Set([...currPoolAddresses, ...tenderlyPoolAddresses]);
    }
    return Array.from(addresses.values());
  };

  // get pool addresses
  const { data: poolAddresses } = useSWR(
    [usingTenderly ? tenderlyContractMap : contractMap, '/poolAddresses'],
    _getAllPoolAddresses,
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
    }
  );

  const _getAllSeriesAddedEvents = async (contractMap: IContractMap) => {
    let events: Set<SeriesAddedEvent>;

    if (!contractMap) return;

    // get the series added events from fallback provider events
    const cauldron = contractMap[CAULDRON] as Cauldron;
    if (!cauldron) return;

    const currEvents = await getSeriesEvents(cauldron);
    events = new Set(currEvents);

    if (usingTenderly && tenderlyStartBlock) {
      // get the pool addies from tenderly provider events
      const tenderlyEvents = await getSeriesEvents(cauldron, tenderlyStartBlock);
      events = new Set([...currEvents, ...tenderlyEvents]);
    }
    return Array.from(events.values());
  };

  // get series added events
  const { data: seriesAddedEvents } = useSWR(
    [usingTenderly ? tenderlyContractMap : contractMap, '/seriesAddedEvents'],
    _getAllSeriesAddedEvents,
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
    }
  );

  const { data, error } = useSWR(
    poolAddresses?.length && seriesAddedEvents?.length
      ? `/pools?chainId=${chainId}&usingTenderly=${usingTenderly}`
      : null,
    () => getPools(usingTenderly ? tenderlyProvider : provider, chainId, amoAddress, poolAddresses, seriesAddedEvents),
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
    }
  );
  console.log('🦄 ~ file: usePools.ts ~ line 85 ~ usePools ~ data', data);

  return {
    data: data as IPoolMap | undefined,
    loading: !data && !error,
    error,
  };
};

export default usePools;
