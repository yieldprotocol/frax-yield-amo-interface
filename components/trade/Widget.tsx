import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import InputWrap from '../pool/InputWrap';
import usePools from '../../hooks/protocol/usePools';
import PoolSelect from '../pool/PoolSelect';
import { IPool, IPoolMap } from '../../lib/protocol/types';
import InterestRateInput from './InterestRateInput';
import { BorderWrap, Header, InputsWrap } from '../styles/common';
import Arrow from './Arrow';
import { useBalance } from 'wagmi';
import useRatePreview from '../../hooks/protocol/useRatePreview';
import useContracts from '../../hooks/protocol/useContracts';
import { FRAX_AMO } from '../../constants';

const Inner = tw.div`m-4 text-center`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

export interface ITradeForm {
  pool: IPool | undefined;
  desiredRate: string;
  baseAmount: string;
  updatingRate: boolean;
}

const INITIAL_FORM_STATE: ITradeForm = {
  pool: undefined,
  desiredRate: '',
  baseAmount: '',
  updatingRate: true,
};

const Widget = ({ pools: poolsProps }: { pools: IPoolMap }) => {
  const contracts = useContracts();
  const fraxAmoAddress = contracts![FRAX_AMO]?.address;

  // const { activeChain } = useNetwork();
  const chainId = 1;
  const { data: pools } = usePools();

  const [form, setForm] = useState<ITradeForm>(INITIAL_FORM_STATE);
  const { pool, desiredRate, baseAmount, updatingRate } = form;
  const { baseNeeded_, func } = useRatePreview(pool!, +desiredRate / 100, baseAmount);

  const { data: baseBalance } = useBalance({ addressOrName: fraxAmoAddress });

  const handleMaxBase = () => {
    setForm((f) => ({
      ...f,
      baseAmount: baseBalance?.formatted!,
      updatingRate: false,
    }));
  };

  const handleClearAll = () => setForm(INITIAL_FORM_STATE);

  // reset form when chainId changes
  useEffect(() => {
    setForm(INITIAL_FORM_STATE);
  }, [chainId]);

  return (
    <BorderWrap>
      <Inner>
        <TopRow>
          <Header>Trade</Header>
          <div className="flex gap-3">
            <ClearButton onClick={handleClearAll}>Clear All</ClearButton>
          </div>
        </TopRow>

        <Grid>
          <PoolSelect
            pools={(pools && Object.values(pools)) || (poolsProps && Object.values(poolsProps))}
            pool={pool}
            setPool={(p) => setForm((f) => ({ ...f, pool: p }))}
            poolsLoading={!pools || !poolsProps}
          />
          <InputsWrap>
            <div className="whitespace-nowrap text-sm text-left mb-1">Pool Interest Rate</div>
            <InterestRateInput
              label={'Current'}
              rate={pool?.interestRate! || ''}
              disabled={true}
              unfocused={true}
              setRate={() => null}
            />
            <Arrow />
            <InterestRateInput
              label={'New'}
              rate={desiredRate}
              setRate={(rate: string) => setForm((f) => ({ ...f, desiredRate: rate, updatingRate: true }))}
            />
          </InputsWrap>
        </Grid>

        <InputsWrap>
          <div className="whitespace-nowrap text-sm text-left mb-1">AMO {func ? <code>{func}</code> : ''} Input</div>

          <InputWrap
            name="baseAmount"
            value={updatingRate && baseNeeded_ ? baseNeeded_ : baseAmount}
            balance={baseBalance?.formatted!}
            item={pool?.base}
            handleChange={(val) => setForm((f) => ({ ...f, baseAmount: val, updatingRate: false }))}
            unFocused={updatingRate && !!pool}
            useMax={handleMaxBase}
            pool={pool}
            disabled
          />
        </InputsWrap>
      </Inner>
    </BorderWrap>
  );
};

export default Widget;
