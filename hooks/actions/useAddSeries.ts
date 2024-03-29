import { useEffect, useState } from 'react';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import { BLANK_VAULT } from '../../constants';
import { IPool } from '../../lib/protocol/types';
import { AMOActions } from '../../lib/tx/operations';
import useAMO from '../protocol/useAMO';
import useTenderly from '../useTenderly';

const useAddSeries = (pool: IPool | undefined) => {
  const { contract: amoContract, address: amoAddress } = useAMO();
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

    return write?.()!;
  };

  // check if series is added
  useEffect(() => {
    (async () => {
      if (pool) {
        const series = await amoContract?.series(pool.seriesId);
        const isAdded = series?.vaultId != BLANK_VAULT;
        setSeriesAdded(isAdded);
      }
    })();
  }, [amoContract, pool]);

  return { seriesAdded, addSeries };
};

export default useAddSeries;
