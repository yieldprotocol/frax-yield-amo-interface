import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import BackButton from '../common/BackButton';
import Button from '../common/Button';
import InputWrap from './InputWrap';
import usePools from '../../hooks/protocol/usePools';
import PoolSelect from './PoolSelect';
import { IPool } from '../../lib/protocol/types';
import { BorderWrap, Header } from '../styles/common';
import Modal from '../common/Modal';
import AddConfirmation from './AddConfirmation';
import CloseButton from '../common/CloseButton';
import useInputValidation from '../../hooks/useInputValidation';
import { useAccount, useNetwork } from 'wagmi';
import { useAddLiquidity } from '../../hooks/actions/useAddLiquidity';
import { AMOActions } from '../../lib/tx/operations';

const Inner = tw.div`m-4 text-center`;
const HeaderSmall = tw.div`align-middle text-sm font-bold justify-start text-left`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`grid grid-cols-3 justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm justify-self-end`;

export interface IAddLiquidityForm {
  pool: IPool | undefined;
  input: string;
}

const INITIAL_FORM_STATE: IAddLiquidityForm = {
  pool: undefined,
  input: '',
};

const AddLiquidity = () => {
  const router = useRouter();
  const { address } = router.query;
  const { chain } = useNetwork();
  const { address: account } = useAccount();
  const { data: pools } = usePools();

  const [form, setForm] = useState<IAddLiquidityForm>(INITIAL_FORM_STATE);
  const { pool, input } = form;
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);

  const { errorMsg } = useInputValidation(input, pool, [], AMOActions.Fn.ADD_LIQUIDITY);

  const { addLiquidity, isAddingLiquidity, addSubmitted } = useAddLiquidity(pool, input);

  const baseBalanceToUse = pool?.base.balance_;

  const handleMax = () => setForm((f) => ({ ...f, input: baseBalanceToUse! }));
  const handleClearAll = () => (address ? setForm((f) => ({ ...f, input: '' })) : setForm(INITIAL_FORM_STATE));
  const handleSubmit = () => setConfirmModalOpen(true);
  const handleInputChange = (name: string, value: string) => setForm((f) => ({ ...f, [name]: value }));

  // reset chosen pool when chainId changes
  useEffect(() => {
    setForm((f) => ({ ...f, pool: undefined }));
  }, [chain?.id]);

  // use pool address from router query if available
  useEffect(() => {
    pools && setForm((f) => ({ ...f, pool: pools![address as string] }));
  }, [pools, address]);

  // close modal when the adding liquidity was successfullly submitted (user took all actions to get tx through)
  useEffect(() => {
    if (addSubmitted) {
      setConfirmModalOpen(false);
      setForm((f) => ({ ...f, input: '' }));
    }
  }, [addSubmitted]);

  // update the form's pool whenever the pool changes (i.e. when the user interacts and balances change)
  useEffect(() => {
    const _pool = pools && pool?.address! in pools ? pools[pool?.address!] : undefined;
    if (_pool) {
      setForm((f) => ({ ...f, pool: _pool }));
    }
  }, [pools, pool]);

  return (
    <BorderWrap>
      <Inner>
        <TopRow>
          <BackButton onClick={() => router.back()} />
          <Header>Add</Header>
          <ClearButton onClick={handleClearAll}>Clear All</ClearButton>
        </TopRow>

        <Grid>
          <PoolSelect
            pool={pool}
            pools={address ? undefined : pools && Object.values(pools).filter((p) => !p.isMature)} // can't add liq when mature, so filter out
            setPool={(p: IPool) => setForm((f) => ({ ...f, pool: p }))}
          />
        </Grid>

        <Grid>
          <HeaderSmall>Deposit Amounts</HeaderSmall>
          <InputWrap
            name="input"
            value={input}
            item={pool?.base}
            balance={baseBalanceToUse!}
            handleChange={handleInputChange}
            useMax={handleMax}
            pool={pool}
          />
        </Grid>
        <Button
          action={handleSubmit}
          disabled={!account || !pool || !input || isAddingLiquidity || !!errorMsg}
          loading={isAddingLiquidity}
        >
          {!account
            ? 'Connect Wallet'
            : isAddingLiquidity
            ? 'Add Liquidity Initiated...'
            : errorMsg
            ? errorMsg
            : 'Add Liquidity'}
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
            <AddConfirmation
              form={form}
              action={addLiquidity}
              disabled={!account || !pool || !input || isAddingLiquidity}
              loading={isAddingLiquidity}
            />
          </Modal>
        )}
      </Inner>
    </BorderWrap>
  );
};

export default AddLiquidity;
