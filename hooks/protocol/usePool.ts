import Decimal from 'decimal.js';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { useContractReads } from 'wagmi';
import { Pool__factory } from '../../contracts/types';
import { calculateRate, getTimeStretchYears } from '../../utils/yieldMath';
import useDefaultProvider from '../useDefaultProvider';
import useTenderly from '../useTenderly';

interface PoolRes {
  baseReserves: BigNumber;
  fyTokenReserves: BigNumber;
  totalSupply: BigNumber;
  ts: BigNumber;
  g1: BigNumber;
  g2: BigNumber;
  decimals: number;
  maturity: number;
  timeTillMaturity: string | undefined;
  timeStretchYears: Decimal | undefined;
  isMature: boolean;
  interestRate: string;
}

const usePool = (poolAddress: string | undefined) => {
  const { usingTenderly, tenderlyProvider } = useTenderly();
  const provider = useDefaultProvider();

  const contract = useMemo(
    () => (poolAddress ? Pool__factory.connect(poolAddress, usingTenderly ? tenderlyProvider : provider) : undefined),
    [poolAddress, provider, tenderlyProvider, usingTenderly]
  );

  const { data, isError, isLoading, refetch } = useContractReads({
    allowFailure: true,
    contracts: [
      {
        addressOrName: poolAddress!,
        contractInterface: contract?.interface!,
        functionName: 'getBaseBalance',
      },
      {
        addressOrName: poolAddress!,
        contractInterface: contract?.interface!,
        functionName: 'getFYTokenBalance',
      },
      {
        addressOrName: poolAddress!,
        contractInterface: contract?.interface!,
        functionName: 'totalSupply',
      },
      {
        addressOrName: poolAddress!,
        contractInterface: contract?.interface!,
        functionName: 'ts',
      },
      {
        addressOrName: poolAddress!,
        contractInterface: contract?.interface!,
        functionName: 'g1',
      },
      {
        addressOrName: poolAddress!,
        contractInterface: contract?.interface!,
        functionName: 'g2',
      },
      {
        addressOrName: poolAddress!,
        contractInterface: contract?.interface!,
        functionName: 'decimals',
      },
      {
        addressOrName: poolAddress!,
        contractInterface: contract?.interface!,
        functionName: 'maturity',
      },
    ],
    enabled: !!(poolAddress && contract),
    keepPreviousData: true,
  });

  const timeTillMaturity = useMemo(
    () => (data ? (+data[7] - Math.round(new Date().getTime() / 1000)).toString() : undefined),
    [data]
  );

  const isMature = +timeTillMaturity! > 0;

  const timeStretchYears = useMemo(
    () => (data && data[3] ? getTimeStretchYears(BigNumber.from(data[3])) : undefined),
    [data]
  );

  const interestRate = useMemo(
    () =>
      data && timeStretchYears && data[1] && data[0]
        ? calculateRate(BigNumber.from(data[1]), BigNumber.from(data[0]), timeStretchYears!).toString()
        : undefined,
    [data, timeStretchYears]
  );

  const _data = useMemo(() => {
    return data && data[0] && data[1] && data[2] && data[3] && data[4] && data[5] && data[6] && data[7]
      ? ({
          baseReserves: BigNumber.from(data[0]),
          fyTokenReserves: BigNumber.from(data[1]),
          totalSupply: BigNumber.from(data[2]),
          ts: BigNumber.from(data[3]),
          g1: BigNumber.from(data[4]),
          g2: BigNumber.from(data[5]),
          decimals: +data[6],
          maturity: +data[7],
          timeTillMaturity,
          timeStretchYears,
          isMature,
          interestRate,
        } as PoolRes)
      : undefined;
  }, [data, interestRate, isMature, timeStretchYears, timeTillMaturity]);

  return {
    data: _data,
    isError,
    isLoading,
    refetch,
  };
};

export default usePool;
