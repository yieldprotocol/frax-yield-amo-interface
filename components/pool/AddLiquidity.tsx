import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import BackButton from '../common/BackButton';
import Button from '../common/Button';
import InputWrap from './InputWrap';
import Toggle from '../common/Toggle';
import usePools from '../../hooks/protocol/usePools';
import PoolSelect from './PoolSelect';
import { IPool } from '../../lib/protocol/types';
import { BorderWrap, Header } from '../styles/common';
import Modal from '../common/Modal';
import AddConfirmation from './AddConfirmation';
import CloseButton from '../common/CloseButton';
import { AddLiquidityActions } from '../../lib/protocol/liquidity/types';
import Arrow from '../trade/Arrow';
import useInputValidation from '../../hooks/useInputValidation';
import useAddLiqPreview from '../../hooks/protocol/useAddLiqPreview';
import { useAccount, useBalance, useNetwork } from 'wagmi';
import { useAddLiquidity } from '../../hooks/actions/useAddLiquidity';

const Inner = tw.div`m-4 text-center`;
const HeaderSmall = tw.div`align-middle text-sm font-bold justify-start text-left`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`grid grid-cols-3 justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm justify-self-end`;

export interface IAddLiquidityForm {
  pool: IPool | undefined;
  baseAmount: string;
  fyTokenAmount: string;
  method: AddLiquidityActions;
  useFyToken: boolean;
}

const INITIAL_FORM_STATE: IAddLiquidityForm = {
  pool: undefined,
  baseAmount: '',
  fyTokenAmount: '',
  method: AddLiquidityActions.MINT_WITH_BASE,
  useFyToken: false,
};

const AddLiquidity = () => {
  const router = useRouter();
  const { address } = router.query;
  const { chain } = useNetwork();
  const { address: account } = useAccount();
  const { data: pools } = usePools();
  const { data: balance } = useBalance({ addressOrName: account, chainId: chain?.id });
  const ethBalance = balance?.formatted;

  const [form, setForm] = useState<IAddLiquidityForm>(INITIAL_FORM_STATE);
  const { pool, baseAmount, fyTokenAmount, method, useFyToken } = form;
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [useFyTokenToggle, setUseFyTokenToggle] = useState<boolean>(false);
  const [updatingBaseAmount, setUpdatingBaseAmount] = useState<boolean>(true);
  const [updatingFyTokenAmount, setUpdatingFyTokenAmount] = useState<boolean>(false);

  const { fyTokenNeeded_, baseNeeded_ } = useAddLiqPreview(
    pool!,
    baseAmount,
    method,
    fyTokenAmount,
    updatingFyTokenAmount
  );
  const { errorMsg } = useInputValidation(baseAmount, pool, [], method!, fyTokenAmount, false);

  const { addLiquidity, isAddingLiquidity, addSubmitted } = useAddLiquidity(pool, baseAmount, fyTokenAmount);

  const baseBalanceToUse = pool?.base.balance_;

  const handleMaxBase = () => {
    setUpdatingBaseAmount(true);
    setUpdatingFyTokenAmount(false);
    setForm((f) => ({ ...f, baseAmount: baseBalanceToUse! }));
  };

  const handleMaxFyToken = () => {
    setUpdatingBaseAmount(false);
    setUpdatingFyTokenAmount(true);
    setForm((f) => ({ ...f, fyTokenAmount: pool?.fyToken.balance_! }));
  };

  const handleClearAll = () => {
    address ? setForm((f) => ({ ...f, baseAmount: '', fyTokenAmount: '' })) : setForm(INITIAL_FORM_STATE);
  };

  const handleSubmit = () => {
    setConfirmModalOpen(true);
  };

  const handleInputChange = (name: string, value: string) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (name === 'baseAmount') {
      setUpdatingBaseAmount(true);
      setUpdatingFyTokenAmount(false);
    } else if (name === 'fyTokenAmount') {
      setUpdatingBaseAmount(false);
      setUpdatingFyTokenAmount(true);
    } else {
      setUpdatingBaseAmount(false);
      setUpdatingFyTokenAmount(false);
    }
  };

  // reset chosen pool when chainId changes
  useEffect(() => {
    setForm((f) => ({ ...f, pool: undefined }));
  }, [chain?.id]);

  // use pool address from router query if available
  useEffect(() => {
    pools && setForm((f) => ({ ...f, pool: pools![address as string] }));
  }, [pools, address]);

  // set add liquidity method when useFyTokenBalance changes
  useEffect(() => {
    setForm((f) => ({
      ...f,
      method: useFyToken ? AddLiquidityActions.MINT : AddLiquidityActions.MINT_WITH_BASE,
    }));
  }, [useFyToken]);

  // close modal when the adding liquidity was successfullly submitted (user took all actions to get tx through)
  useEffect(() => {
    if (addSubmitted) {
      setConfirmModalOpen(false);
      setForm((f) => ({ ...f, baseAmount: '', fyTokenAmount: '' }));
    }
  }, [addSubmitted]);

  // update form when toggling useFyTokenToggle
  useEffect(() => {
    setForm((f) => ({ ...f, useFyToken: useFyTokenToggle }));
  }, [useFyTokenToggle]);

  // update the form's pool whenever the pool changes (i.e. when the user interacts and balances change)
  useEffect(() => {
    const _pool = pools && pool?.address! in pools ? pools[pool?.address!] : undefined;
    if (_pool) {
      setForm((f) => ({ ...f, pool: _pool }));
    }
  }, [pools, pool]);

  // update the form's base and fyToken amount based on where the user is inputting, and the corresponding alternate asset preview
  // i.e.: if user is updating fyTokenAmount, then show baseNeeded_ in the base input component
  useEffect(() => {
    setForm((f) => ({
      ...f,
      baseAmount: updatingFyTokenAmount ? baseNeeded_ : baseAmount,
      fyTokenAmount: updatingFyTokenAmount ? fyTokenAmount : fyTokenNeeded_,
    }));
  }, [baseAmount, baseNeeded_, fyTokenAmount, fyTokenNeeded_, updatingBaseAmount, updatingFyTokenAmount]);

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
            name="baseAmount"
            value={baseAmount}
            item={pool?.base}
            balance={baseBalanceToUse!}
            handleChange={handleInputChange}
            useMax={handleMaxBase}
            unFocused={updatingFyTokenAmount}
            pool={pool}
          />
          {useFyToken && <Arrow isPlusIcon={true} />}
          {useFyToken && (
            <InputWrap
              name="fyTokenAmount"
              value={fyTokenAmount}
              item={pool?.fyToken}
              balance={pool?.fyToken.balance_!}
              handleChange={handleInputChange}
              useMax={handleMaxFyToken}
              unFocused={updatingBaseAmount}
              pool={pool}
            />
          )}
          {+pool?.fyToken?.balance_! > 0 && (
            <Toggle
              enabled={useFyToken}
              setEnabled={setUseFyTokenToggle}
              label={`Use fy${pool?.base.symbol} Balance`}
            />
          )}
        </Grid>
        <Button
          action={handleSubmit}
          disabled={!account || !pool || !baseAmount || isAddingLiquidity || !!errorMsg}
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
              disabled={!account || !pool || !baseAmount || isAddingLiquidity}
              loading={isAddingLiquidity}
            />
          </Modal>
        )}
      </Inner>
    </BorderWrap>
  );
};

export default AddLiquidity;
