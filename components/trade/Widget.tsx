import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import InputWrap from '../pool/InputWrap';
import usePools from '../../hooks/protocol/usePools';
import PoolSelect from '../pool/PoolSelect';
import { IPool, IPoolMap } from '../../lib/protocol/types';
import InterestRateInput from './InterestRateInput';
import { BorderWrap, Header, InputsWrap } from '../styles/common';
import Arrow from './Arrow';
import { useAccount, useBalance, useNetwork } from 'wagmi';
import useRatePreview from '../../hooks/protocol/useRatePreview';
import { FRAX_ADDRESS } from '../../constants';
import Toggle from '../common/Toggle';
import CopyWrap from '../common/CopyWrap';
import Button from '../common/Button';
import useAMO from '../../hooks/protocol/useAMO';
import { useChangeRate } from '../../hooks/actions/useChangeRate';
import { AMOActions } from '../../lib/tx/operations';
import Modal from '../common/Modal';
import CloseButton from '../common/CloseButton';
import useInputValidation from '../../hooks/useInputValidation';
import RateConfirmation from './RateConfirmation';
import { cleanValue } from '../../utils/appUtils';

const Inner = tw.div`m-4 text-center`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

export interface IWidgetForm {
  pool: IPool | undefined;
  desiredRate: string;
  baseAmount: string;
  updatingRate: boolean;
  increasingRate: boolean;
}

const INITIAL_FORM_STATE: IWidgetForm = {
  pool: undefined,
  desiredRate: '',
  baseAmount: '',
  updatingRate: true,
  increasingRate: true,
};

const Widget = ({ pools: poolsProps }: { pools: IPoolMap }) => {
  const { address: account } = useAccount();
  const { amoAddress } = useAMO();
  const { data: baseBalance } = useBalance({ addressOrName: amoAddress, token: FRAX_ADDRESS });
  const { chain } = useNetwork();
  const chainId = chain?.id || 1;
  const { data: pools } = usePools();

  const [form, setForm] = useState<IWidgetForm>(INITIAL_FORM_STATE);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const { pool, desiredRate, baseAmount, updatingRate, increasingRate } = form;
  const { baseNeededWad, baseNeeded_, func, ratePreview } = useRatePreview(
    pool!,
    +desiredRate / 100,
    baseAmount,
    updatingRate,
    increasingRate
  );

  const { changeRate, isTransacting, txSubmitted } = useChangeRate(
    pool,
    +desiredRate / 100,
    increasingRate ? AMOActions.Fn.INCREASE_RATES : AMOActions.Fn.DECREASE_RATES
  );

  const { errorMsg } = useInputValidation(
    desiredRate,
    pool,
    [],
    increasingRate ? AMOActions.Fn.INCREASE_RATES : AMOActions.Fn.DECREASE_RATES
  );

  const handleMaxBase = () => {
    setForm((f) => ({
      ...f,
      baseAmount: baseBalance?.formatted ?? '0',
      updatingRate: false,
      increasingRate: !updatingRate && +ratePreview > +pool?.interestRate!,
    }));
  };

  const handleBaseChange = (name: string, value: string) => {
    setForm((f) => ({ ...f, [name]: value, updatingRate: false }));
  };

  const handleClearAll = () => setForm(INITIAL_FORM_STATE);
  const handleSubmit = () => setConfirmModalOpen(true);

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
              rate={cleanValue(pool?.interestRate!, 2) || ''}
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
            <div className="whitespace-nowrap text-sm text-left mb-1">
              {baseNeeded_ && (
                <CopyWrap value={baseNeededWad} label="copy wad">
                  <span>{func ? <code>{func}</code> : ''} Input</span>
                </CopyWrap>
              )}
            </div>
            {!updatingRate && (
              <Toggle
                enabled={increasingRate}
                setEnabled={() => setForm((f) => ({ ...f, increasingRate: !f.increasingRate }))}
                label={
                  increasingRate || (!updatingRate && +ratePreview > +pool?.interestRate!)
                    ? 'Increase Rate'
                    : 'Decrease Rate'
                }
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
        <Button
          action={handleSubmit}
          disabled={!account || !pool || !desiredRate || isTransacting || !!errorMsg}
          loading={isTransacting}
        >
          {!account
            ? 'Connect Wallet'
            : isTransacting
            ? 'Change Rate Initiated...'
            : errorMsg
            ? errorMsg
            : `${increasingRate ? `Increase Rate` : `Decrease Rate`} to ${desiredRate}%`}
        </Button>
        {confirmModalOpen && pool && (
          <Modal isOpen={confirmModalOpen} setIsOpen={setConfirmModalOpen} styleProps="p-5">
            <TopRow>
              <div className="justify-self-start">
                <Header>Confirm</Header>
              </div>
              <div> </div>
              <div className="justify-self-end">
                <CloseButton action={() => setConfirmModalOpen(false)} height="1.2rem" width="1.2rem" />
              </div>
            </TopRow>
            <RateConfirmation
              form={form}
              action={changeRate}
              disabled={!account || !pool || !desiredRate || isTransacting}
              loading={isTransacting}
            />
          </Modal>
        )}
      </Inner>
    </BorderWrap>
  );
};

export default Widget;
