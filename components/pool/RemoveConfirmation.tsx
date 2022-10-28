import AssetSelect from '../common/AssetSelect';
import { IPool } from '../../lib/protocol/types';
import Button from '../common/Button';
import { IRemoveLiquidityForm } from './RemoveLiquidity';
import useRemoveLiqPreview from '../../hooks/protocol/useRemoveLiqPreview';
import { cleanValue, valueAtDigits } from '../../utils/appUtils';
import {
  AssetSelectWrap,
  Container,
  Detail,
  DetailsWrap,
  DetailWrap,
  DisclaimerTextWrap,
  InputStyle,
  InputStyleContainer,
  InputsWrap,
  Italic,
} from '../styles/confirm';
import useBase from '../../hooks/protocol/useBase';

interface IRemoveConfirmation {
  form: IRemoveLiquidityForm;
  action: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const ConfirmItem = ({ value, pool }: { value: string; pool: IPool }) => (
  <InputStyleContainer>
    <InputStyle>{value}</InputStyle>
    <AssetSelectWrap>
      <AssetSelect item={pool} pool={pool} isFyToken={true} />
    </AssetSelectWrap>
  </InputStyleContainer>
);

const RemoveConfirmation = ({ form, action, disabled, loading }: IRemoveConfirmation) => {
  const { pool, lpTokens } = form;
  const { data: base } = useBase(pool?.base!);
  const { baseReceived, fyTokenReceived } = useRemoveLiqPreview(pool?.address!, lpTokens);

  if (!pool) return null;

  return (
    <Container>
      <InputsWrap>
        <ConfirmItem value={valueAtDigits(lpTokens, 4)} pool={pool!} />
      </InputsWrap>
      <InputStyleContainer>
        <DetailsWrap>
          <DetailWrap>
            <Detail>Estimated {base?.symbol} Received</Detail>
            <Detail>{cleanValue(baseReceived, base?.digitFormat)}</Detail>
          </DetailWrap>
          {fyTokenReceived && (
            <DetailWrap>
              <Detail>
                Estimated {pool.fyToken.symbol} Received and Burned for {base?.symbol}
              </Detail>
              <Detail>{cleanValue(fyTokenReceived, pool.fyToken.digitFormat)}</Detail>
            </DetailWrap>
          )}
        </DetailsWrap>
      </InputStyleContainer>
      <DisclaimerTextWrap>
        <Italic>Output is estimated.</Italic>
      </DisclaimerTextWrap>
      <Button action={action} disabled={disabled} loading={loading}>
        {loading ? 'Remove Liquidity Initiated...' : 'Confirm Remove Liquidity'}
      </Button>
    </Container>
  );
};

export default RemoveConfirmation;
