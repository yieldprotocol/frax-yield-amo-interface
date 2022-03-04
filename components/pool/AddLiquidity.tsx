import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import BackButton from '../common/BackButton';
import Button from '../common/Button';
import InputWrap from './InputWrap';
import { PlusIcon } from '@heroicons/react/solid';
import Toggle from '../common/Toggle';
import usePools from '../../hooks/protocol/usePools';
import PoolSelect from './PoolSelect';
import { IPool } from '../../lib/protocol/types';
import useConnector from '../../hooks/useConnector';
import { BorderWrap, Header } from '../styles/';
import { useAddLiquidity } from '../../hooks/protocol/useAddLiquidity';
import { AddLiquidityActions } from '../../lib/protocol/liquidity/types';

const Inner = tw.div`m-4 text-center`;
const HeaderSmall = tw.div`align-middle text-sm font-bold justify-start text-left`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

interface IAddLiquidityForm {
  pool: IPool | undefined;
  baseAmount: string;
  fyTokenAmount: string;
}

const INITIAL_FORM_STATE: IAddLiquidityForm = {
  pool: undefined,
  baseAmount: '',
  fyTokenAmount: '',
};

const AddLiquidity = () => {
  const router = useRouter();
  const { address } = router.query;
  const { chainId, account } = useConnector();
  const { data: pools, loading } = usePools();

  const [form, setForm] = useState<IAddLiquidityForm>(INITIAL_FORM_STATE);
  const [useFyTokenBalance, toggleUseFyTokenBalance] = useState<boolean>(false);
  const { pool, baseAmount, fyTokenAmount } = form;

  const { addLiquidity, isAddingLiquidity } = useAddLiquidity(pool!);

  const handleMaxBase = () => {
    setForm((f) => ({ ...f, baseAmount: pool?.base.balance_!, fyTokenAmount: pool?.base.balance_! }));
  };

  const handleClearAll = () => {
    setForm(INITIAL_FORM_STATE);
  };

  const handleSubmit = () => {
    const description = `Adding ${form.baseAmount} ${pool?.base.symbol}${
      +fyTokenAmount > 0 && useFyTokenBalance ? ` and ${fyTokenAmount} ${pool?.fyToken.symbol}` : ''
    }`;

    pool &&
      addLiquidity(
        baseAmount,
        useFyTokenBalance ? AddLiquidityActions.MINT : AddLiquidityActions.MINT_WITH_BASE,
        description
      );
  };

  const handleInputChange = (name: string, value: string) =>
    setForm((f) => ({ ...f, [name]: value, fyTokenAmount: value }));

  // reset chosen pool when chainId changes
  useEffect(() => {
    setForm((f) => ({ ...f, pool: undefined }));
  }, [chainId]);

  // use pool address from router query if available
  useEffect(() => {
    pools && setForm((f) => ({ ...f, pool: pools![address as string] }));
  }, [pools, address]);

  return (
    <BorderWrap>
      <Inner>
        <TopRow>
          <BackButton onClick={() => router.back()} />
          <Header>Add Liquidity</Header>
          <ClearButton onClick={handleClearAll}>Clear All</ClearButton>
        </TopRow>

        <Grid>
          <PoolSelect
            pools={pools}
            pool={pool}
            setPool={(p) => setForm((f) => ({ ...f, pool: p }))}
            poolsLoading={loading}
          />
        </Grid>

        <Grid>
          <HeaderSmall>Deposit Amounts</HeaderSmall>
          <InputWrap
            name="baseAmount"
            value={baseAmount}
            item={pool?.base}
            balance={pool?.base.balance_!}
            handleChange={handleInputChange}
            useMax={handleMaxBase}
          />

          {useFyTokenBalance && <PlusIcon className="justify-self-center" height={20} width={20} />}

          <Toggle enabled={useFyTokenBalance} setEnabled={toggleUseFyTokenBalance} label="Use fyToken Balance" />

          {useFyTokenBalance && (
            <InputWrap
              name="fyTokenAmount"
              value={fyTokenAmount}
              item={pool?.fyToken}
              balance={pool?.fyToken.balance_!}
              handleChange={handleInputChange}
              unFocused={true}
              disabled
            />
          )}
        </Grid>
        <Button action={handleSubmit} disabled={!account || !pool || !baseAmount || isAddingLiquidity}>
          {isAddingLiquidity ? 'Adding Liquidity' : !account ? 'Connect Wallet' : 'Add Liquidity'}
        </Button>
      </Inner>
    </BorderWrap>
  );
};

export default AddLiquidity;
