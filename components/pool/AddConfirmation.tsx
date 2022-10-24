import AssetSelect from '../common/AssetSelect';
import { IAsset, IPool } from '../../lib/protocol/types';
import Button from '../common/Button';
import useTimeTillMaturity from '../../hooks/useTimeTillMaturity';
import { IAddLiquidityForm } from './AddLiquidity';
import useAddLiquidityPreview from '../../hooks/protocol/useAddLiqPreview';
import { valueAtDigits } from '../../utils/appUtils';
import {
  AssetSelectWrap,
  Container,
  Right,
  InputStyle,
  InputStyleContainer,
  InputsWrap,
  Italic,
  Detail,
  DisclaimerTextWrap,
  DetailWrap,
  DetailsWrap,
} from '../styles/confirm';

interface IAddConfirmation {
  form: IAddLiquidityForm;
  action: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const ConfirmItem = ({ value, asset, pool }: { value: string; asset: IAsset; pool: IPool }) => (
  <InputStyleContainer>
    <InputStyle>{value}</InputStyle>
    <AssetSelectWrap>
      {asset && <AssetSelect item={asset} isFyToken={asset.symbol.includes('FY') || false} pool={pool} />}
    </AssetSelectWrap>
  </InputStyleContainer>
);

const AddConfirmation = ({ form, action, disabled, loading }: IAddConfirmation) => {
  const { pool, input } = form;
  const { lpTokenPreview } = useAddLiquidityPreview(pool!, input);
  const timeTillMaturity_ = useTimeTillMaturity(pool?.maturity!);
  const maturityDescription = pool?.isMature ? `Mature` : `${timeTillMaturity_} until maturity`;

  if (!pool) return null;

  return (
    <Container>
      <InputsWrap>
        <ConfirmItem value={valueAtDigits(input, pool.base.digitFormat)} asset={pool.base} pool={pool!} />
      </InputsWrap>
      <InputStyleContainer>
        <DetailsWrap>
          <DetailWrap>
            <Detail>Maturity</Detail>
            <Detail>
              <Right>{pool.displayName}</Right>
              <Italic>
                <Right>{maturityDescription}</Right>
              </Italic>
            </Detail>
          </DetailWrap>
          <DetailWrap>
            <Detail>LP Tokens to Receive</Detail>
            <Detail>{lpTokenPreview && valueAtDigits(lpTokenPreview, 6)}</Detail>
          </DetailWrap>
        </DetailsWrap>
      </InputStyleContainer>
      <DisclaimerTextWrap>
        <Italic>Output is estimated.</Italic>
      </DisclaimerTextWrap>
      <Button action={action} disabled={disabled} loading={loading}>
        {loading ? 'Add Liquidity Initiated...' : 'Confirm Add Liquidity'}
      </Button>
    </Container>
  );
};

export default AddConfirmation;
