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
import Toggle from '../common/Toggle';

const Inner = tw.div`m-4 text-center`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

export interface IForm {
  pool: IPool | undefined;
  desiredRate: string;
  baseAmount: string;
  updatingRate: boolean;
  increasingRate: boolean;
}

const INITIAL_FORM_STATE: IForm = {
  pool: undefined,
  desiredRate: '',
  baseAmount: '',
  updatingRate: true,
  increasingRate: true,
};

const Widget = ({ pools: poolsProps }: { pools: IPoolMap }) => {
  const contracts = useContracts();
  const fraxAmoAddress = contracts![FRAX_AMO]?.address;

  // const { activeChain } = useNetwork();
  const chainId = 1;
  const { data: pools } = usePools();

  const [form, setForm] = useState<IForm>(INITIAL_FORM_STATE);
  const { pool, desiredRate, baseAmount, updatingRate, increasingRate } = form;
  const { baseNeeded_, func, ratePreview } = useRatePreview(
    pool!,
    +desiredRate / 100,
    baseAmount,
    updatingRate,
    increasingRate
  );

  const { data: baseBalance } = useBalance({ addressOrName: fraxAmoAddress });

  const handleMaxBase = () => {
    setForm((f) => ({
      ...f,
      baseAmount: baseBalance?.formatted!,
      updatingRate: false,
    }));
  };

  const handleBaseChange = (name: string, value: string) => {
    setForm((f) => ({ ...f, [name]: value, updatingRate: false }));
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
          <Header>Rates</Header>
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
            <div className="whitespace-nowrap text-sm text-left mb-1">Series Interest Rate</div>
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
              rate={updatingRate ? desiredRate : ratePreview}
              setRate={(rate: string) => setForm((f) => ({ ...f, desiredRate: rate, updatingRate: true }))}
              unfocused={!updatingRate}
            />
          </InputsWrap>
        </Grid>

        <InputsWrap>
          <div className="flex items-center justify-between mb-1">
            <div className="whitespace-nowrap text-sm text-left mb-1">AMO {func ? <code>{func}</code> : ''} Input</div>
            {!updatingRate && (
              <Toggle
                enabled={increasingRate}
                setEnabled={() => setForm((f) => ({ ...f, increasingRate: !f.increasingRate }))}
                label={increasingRate ? 'Increase Rate' : 'Decrease Rate'}
                disabled={updatingRate}
              />
            )}
          </div>

          <InputWrap
            name="baseAmount"
            value={baseNeeded_}
            balance={baseBalance?.formatted!}
            item={pool?.base}
            handleChange={handleBaseChange}
            unFocused={updatingRate && !!pool}
            useMax={handleMaxBase}
            pool={pool}
          />
        </InputsWrap>
      </Inner>
    </BorderWrap>
  );
};

export default Widget;
