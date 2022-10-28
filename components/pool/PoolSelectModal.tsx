import { useCallback, useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { IPool } from '../../lib/protocol/types';
import CloseButton from '../common/CloseButton';
import Modal from '../common/Modal';
import { Header, TopRow } from '../styles/common';
import PoolSelectItem from './PoolSelectItem';

const Grid = tw.div`grid auto-rows-auto gap-2 overflow-auto p-5 max-h-[428px]`;
const Inner = tw.div`dark:bg-black/80 bg-gray-200/70 dark:text-gray-50 text-gray-900 rounded-lg p-3 gap-3`;
const Outer = tw.button`hover:opacity-80 flex p-[1px] rounded-lg gap-3 align-middle items-center`;
const ClearButton = tw.button`text-sm dark:text-gray-50 text-gray-700`;

const MaturityItem = ({ maturity, color, action }: { maturity: string; color: string; action: () => void }) => (
  <Outer
    style={{
      background: color,
    }}
    key={maturity}
    onClick={action}
  >
    <Inner>{maturity}</Inner>
  </Outer>
);

interface IPoolSelectModal {
  pools: IPool[];
  open: boolean;
  setOpen: (open: boolean) => void;
  action: (pool: IPool) => void;
}

interface IMaturitySelect {
  maturity: string;
  color: string;
}

const PoolSelectModal = ({ pools, open, setOpen, action }: IPoolSelectModal) => {
  const [poolList, setPoolList] = useState<IPool[]>(pools);
  const [maturities, setMaturities] = useState<IMaturitySelect[]>([]);
  const [maturityFilter, setMaturityFilter] = useState<string | undefined>();
  const [showMatureFilter, setShowMatureFilter] = useState<boolean>(false);
  const [hasMature, setHasMature] = useState<boolean>(false);

  const handleClearFilters = () => {
    if (maturityFilter) {
      setMaturityFilter(undefined);
    }
    setShowMatureFilter(false);
  };

  const handleSort = useCallback(
    () => pools.sort((a, b) => (a.maturity < b.maturity ? 1 : -1)), // closest maturity first
    // .sort((a, b) => (a.base.balance.gte(b.base.balance) ? 1 : -1)) // sort by base balance
    // .sort((a, b) => (a.isMature ? -1 : 1)); // mature pools at the end
    [pools]
  );

  const handleFilter = useCallback(
    () =>
      pools
        .filter((p) => (showMatureFilter ? true : !p.isMature))
        .filter((p) => (maturityFilter ? p.maturity_ === maturityFilter : true)),
    [maturityFilter, pools, showMatureFilter]
  );

  useEffect(() => {
    const _maturities = poolList.reduce(
      (_m, _pool) =>
        _m.has(_pool.maturity_)
          ? _m
          : _m.set(_pool.maturity_, { maturity: _pool.maturity_, color: _pool.alternateColor }),
      new Map<string, { maturity: string; color: string }>()
    );
    setMaturities(Array.from(_maturities.values()));
  }, [poolList]);

  useEffect(() => {
    setPoolList(handleSort());
  }, [handleSort]);

  useEffect(() => {
    setPoolList(handleFilter());
  }, [handleFilter]);

  useEffect(() => {
    setHasMature(!!Object.values(pools).find((m) => m.isMature));
  }, [pools]);

  return (
    <Modal isOpen={open} setIsOpen={setOpen}>
      <div className="grid gap-2 p-5">
        <TopRow>
          <Header>Select Series</Header>
          {maturityFilter && <ClearButton onClick={handleClearFilters}>Clear Filters</ClearButton>}
          <CloseButton action={() => setOpen(false)} />
        </TopRow>
        {maturities && (
          <>
            <div className="flex flex-wrap gap-3 justify-start text-sm">
              {maturities.length > 1 &&
                maturities.map((m) => (
                  <MaturityItem
                    key={m.maturity}
                    maturity={m.maturity}
                    color={m.color}
                    action={() => setMaturityFilter(m.maturity)}
                  />
                ))}
            </div>
            <div className="mt-1">
              {hasMature && (
                <ClearButton onClick={() => setShowMatureFilter(!showMatureFilter)}>
                  {showMatureFilter ? 'Hide Matured Pools' : 'Show Matured Pools'}
                </ClearButton>
              )}
            </div>
          </>
        )}
      </div>
      <div className="p-[.25px] dark:bg-gray-700 bg-gray-300"></div>
      <div className="overflow-auto">
        <Grid>
          {poolList.map((pool) => (
            <PoolSelectItem
              key={pool.address}
              pool={pool}
              action={() => {
                action(pool);
                setOpen(false);
              }}
            />
          ))}
        </Grid>
      </div>
      <div className="p-5"></div>
    </Modal>
  );
};

export default PoolSelectModal;
