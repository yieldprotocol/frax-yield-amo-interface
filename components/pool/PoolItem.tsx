import { useRouter } from 'next/router';
import tw from 'tailwind-styled-components';
import { BorderWrap, Header } from '../styles/common';
import usePools from '../../hooks/protocol/usePools';
import BackButton from '../common/BackButton';
import { cleanValue, hexToRgb } from '../../utils/appUtils';
import { marks } from '../../config/marks';
import CopyWrap from '../common/CopyWrap';
import Button from '../common/Button';
import { useContractRead } from 'wagmi';
import { AMOActions } from '../../lib/tx/operations';
import useAMO from '../../hooks/protocol/useAMO';
import { formatUnits } from 'ethers/lib/utils';
import SkeletonWrap from '../common/SkeletonWrap';
import InfoIcon from '../common/InfoIcon';

const Inner = tw.div`m-4 text-center`;
const ButtonWrap = tw.div`flex justify-between gap-10`;
const PoolDataWrap = tw.div`grid my-5 gap-2 flex-nowrap`;
const PoolDataLabel = tw.div`flex text-md dark:text-gray-400 text-gray-500`;
const PoolData = tw.div`text-xl font-semibold dark:text-gray-100 text-gray-800`;

const Wrap = tw.div`mx-auto min-h-[492px] 
   dark:bg-gray-800/50 bg-gray-300 rounded-lg my-5 justify-center align-middle items-center border-[2px]
  dark:border-gray-800/50 border-gray-300
`;
const Top = tw.div`h-[120px] rounded-t-lg`;
const Middle = tw.div`grid gap-3 justify-start px-5 text-left`;

export const Logo = ({ symbol }: { symbol: string }) => {
  const mark = marks[symbol];
  return (
    <div className="absolute">
      <div className="flex align-middle justify-center items-center h-[56px] w-[56px] dark:bg-gray-800 bg-gray-200 rounded-full border-[2px] dark:border-gray-800 border-gray-200 relative -mt-[28px]">
        <div
          className="rounded-full absolute"
          style={{
            background: `rgba(${hexToRgb(mark.color)}, .12)`,
          }}
        >
          {mark.component}
        </div>
      </div>
    </div>
  );
};

const PoolItem = () => {
  const router = useRouter();
  const { data: pools } = usePools();
  const { address: amoAddress, contractInterface } = useAMO();
  const { address } = router.query;

  const pool = pools ? pools![address as string] : undefined;

  const {
    data: allocations,
    error,
    isLoading,
  } = useContractRead({
    addressOrName: amoAddress!,
    contractInterface: contractInterface,
    functionName: AMOActions.Fn.SHOW_ALLOCATIONS,
    args: [pool?.seriesId] as AMOActions.Args.SHOW_ALLOCATIONS,
    enabled: !!pool,
  });

  if (!pool) return null;

  const { base, fyToken } = pool;

  return (
    <BorderWrap>
      <Inner>
        <BackButton onClick={() => router.back()} />
        <Wrap>
          <Top
            style={{
              background: pool.alternateColor,
            }}
          ></Top>
          <Middle>
            <Logo symbol={base.symbol} />
            <div className="mt-10">
              <CopyWrap value={pool.seriesId} label="copy series id">
                <Header>{pool.displayName}</Header>
              </CopyWrap>
              <PoolDataWrap>
                <PoolDataLabel>
                  Frax in contract
                  <InfoIcon infoText={`Amount of unallocated ${base.symbol} in the AMO`} icon></InfoIcon>
                </PoolDataLabel>
                <PoolData>
                  {isLoading ? (
                    <SkeletonWrap />
                  ) : allocations ? (
                    cleanValue(formatUnits(allocations[0], base.decimals), 2)
                  ) : (
                    '0'
                  )}
                </PoolData>
              </PoolDataWrap>
              <PoolDataWrap>
                <PoolDataLabel>
                  Frax as collateral
                  <InfoIcon infoText={`${base.symbol} being used as collateral to borrow ${fyToken.symbol}`} icon />
                </PoolDataLabel>
                <PoolData>
                  {isLoading ? (
                    <SkeletonWrap />
                  ) : allocations ? (
                    cleanValue(formatUnits(allocations[1], base.decimals), 2)
                  ) : (
                    '0'
                  )}
                </PoolData>
              </PoolDataWrap>
              <PoolDataWrap>
                <PoolDataLabel>
                  Frax in LP
                  <InfoIcon infoText={`The ${base.symbol} the AMO LP tokens can claim`} icon />
                </PoolDataLabel>
                <PoolData>
                  {isLoading ? (
                    <SkeletonWrap />
                  ) : allocations ? (
                    cleanValue(formatUnits(allocations[2], base.decimals), 2)
                  ) : (
                    '0'
                  )}
                </PoolData>
              </PoolDataWrap>
              <PoolDataWrap>
                <PoolDataLabel>
                  fyFrax in contract
                  <InfoIcon infoText={`${fyToken.symbol} sitting in the AMO (should be 0)`} icon />
                </PoolDataLabel>
                <PoolData>
                  {isLoading ? (
                    <SkeletonWrap />
                  ) : allocations ? (
                    cleanValue(formatUnits(allocations[3], base.decimals), 2)
                  ) : (
                    '0'
                  )}
                </PoolData>
              </PoolDataWrap>
              <PoolDataWrap>
                <PoolDataLabel>
                  fyFrax in LP
                  <InfoIcon infoText={`The ${fyToken.symbol} the AMO LP tokens can claim`} icon />
                </PoolDataLabel>
                <PoolData>
                  {isLoading ? (
                    <SkeletonWrap />
                  ) : allocations ? (
                    cleanValue(formatUnits(allocations[4], base.decimals), 2)
                  ) : (
                    '0'
                  )}
                </PoolData>
              </PoolDataWrap>
              <PoolDataWrap>
                <PoolDataLabel>
                  LP owned
                  <InfoIcon infoText={`The number of LP tokens owned by the AMO`} icon />
                </PoolDataLabel>
                <PoolData>
                  {isLoading ? (
                    <SkeletonWrap />
                  ) : allocations ? (
                    cleanValue(formatUnits(allocations[5], base.decimals), 2)
                  ) : (
                    '0'
                  )}
                </PoolData>
              </PoolDataWrap>
            </div>
          </Middle>
        </Wrap>
        <ButtonWrap>
          {!pool.isMature && <Button action={() => router.push(`/series/add/${address}`)}>Add Liquidity</Button>}
          <Button action={() => router.push(`/series/remove/${address}`)}>Remove</Button>
        </ButtonWrap>
      </Inner>
    </BorderWrap>
  );
};

export default PoolItem;
