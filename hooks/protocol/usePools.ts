import _ from 'lodash';
import { ReadContractsContract } from '@wagmi/core/dist/declarations/src/actions/contracts/readContracts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useContractReads, useNetwork } from 'wagmi';
import { FRAX_ADDRESS, LADLE } from '../../constants';
import { Ladle, Pool__factory } from '../../contracts/types';
import { extraPoolData, getPoolAddresses } from '../../lib/protocol';
import { IPoolMap } from '../../lib/protocol/types';
import useDefaultProvider from '../useDefaultProvider';
import useTenderly from '../useTenderly';
import useContracts from './useContracts';
import { Interface } from 'ethers/lib/utils';

const usePools = () => {
  const { chain } = useNetwork();
  const chainId = useMemo(() => (chain ? chain.id : 1), [chain]);
  const provider = useDefaultProvider();

  const { usingTenderly, tenderlyProvider, tenderlyStartBlock } = useTenderly();
  const contractMap = useContracts(provider);
  const tenderlyContractMap = useContracts(tenderlyProvider!);

  const [poolAddresses, setPoolAddresses] = useState<string[]>();
  const [contracts, setContracts] = useState<ReadContractsContract[]>([]);

  const _getPoolAddresses = useCallback(async () => {
    // get all pool addresses from current chain and tenderly (if using)
    let poolAddresses: string[];

    const ladle = contractMap![LADLE] as Ladle;
    poolAddresses = await getPoolAddresses(ladle);

    if (usingTenderly && tenderlyContractMap && tenderlyStartBlock) {
      const tenderlyLadle = tenderlyContractMap[LADLE] as Ladle;

      const poolSet = new Set([...poolAddresses, ...(await getPoolAddresses(tenderlyLadle, tenderlyStartBlock))]);

      poolAddresses = Array.from(poolSet.values());
      const filtered = await poolAddresses.reduce(async (acc: Promise<string[]>, addr) => {
        const contract = Pool__factory.connect(addr, usingTenderly ? tenderlyProvider : provider);
        const base = (await contract.base()).toLowerCase();
        return base === FRAX_ADDRESS ? [...(await acc), addr] : acc;
      }, Promise.resolve([]));

      return filtered;
    }
  }, []);

  useEffect(() => {
    (async () => {
      setPoolAddresses(await _getPoolAddresses());
    })();
  }, [_getPoolAddresses]);

  const funcs = useMemo(() => ['name', 'maturity', 'fyToken', 'symbol', 'base'], []);

  const calls = useCallback(
    (addressOrName: string, contractInterface: Interface) =>
      funcs.map((functionName) => ({
        addressOrName,
        contractInterface,
        functionName,
      })),
    [funcs]
  );

  useEffect(() => {
    if (!poolAddresses) return;

    const _contracts = poolAddresses.reduce((acc, addr) => {
      const contractInterface = Pool__factory.connect(addr, usingTenderly ? tenderlyProvider : provider).interface;

      return [...acc, ...calls(addr, contractInterface)];
    }, [] as ReadContractsContract[])!;

    setContracts(_contracts);
  }, [calls, poolAddresses, provider, tenderlyProvider, usingTenderly]);

  const { data, error, isLoading } = useContractReads({
    contracts: contracts,
    enabled: !!contracts.length,
  });

  const _data: IPoolMap | undefined = useMemo(() => {
    if (!poolAddresses || !data) return;

    const chunked = _.chunk(data, funcs.length);
    const poolData = chunked.reduce((acc, c, i) => {
      const [name, maturity, fyToken, symbol, base] = c as unknown as [
        name: string,
        maturity: number,
        fyToken: string,
        symbol: string,
        base: string
      ];
      const address = poolAddresses[i];
      return {
        ...acc,
        [address]: { name, maturity, fyToken, symbol, address, base, ...extraPoolData(maturity, chainId) },
      };
    }, {});

    return poolData;
  }, [chainId, data, funcs.length, poolAddresses]);

  return {
    data: _data,
    loading: isLoading,
    error,
  };
};

export default usePools;
