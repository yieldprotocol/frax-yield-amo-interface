import { useEffect, useState } from 'react';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import { IPool } from '../../lib/protocol/types';
import { AMOActions } from '../../lib/tx/operations';
import useAMO from '../protocol/useAMO';
import useTenderly from '../useTenderly';

const useAddSeries = (pool: IPool | undefined) => {
  const { amoContract, amoAddress, timelockAddress } = useAMO();
  const { usingTenderly } = useTenderly();

  const [seriesAdded, setSeriesAdded] = useState(false);

  const args = [pool?.seriesId, pool?.fyToken.address, pool?.address] as AMOActions.Args.ADD_SERIES;

  // wagmi
  const { config, error } = usePrepareContractWrite({
    addressOrName: amoAddress!,
    contractInterface: amoContract?.interface!,
    functionName: AMOActions.Fn.ADD_SERIES,
    args,
    enabled: !!(amoContract?.interface && amoAddress && !usingTenderly),
  });

  const { write } = useContractWrite(config);

  const addSeries = async () => {
    if (usingTenderly) {
      return await amoContract?.addSeries(...args);
    }

    return await write?.()!;
  };

  // check if series is added
  useEffect(() => {
    (async () => {
      if (pool) {
        const series = await amoContract?.series(pool.seriesId);
        const isAdded = series?.vaultId != '0x000000000000000000000000';
        setSeriesAdded(isAdded);
      }
    })();
  }, [amoContract, pool]);

  return { seriesAdded, addSeries };
};

export default useAddSeries;
