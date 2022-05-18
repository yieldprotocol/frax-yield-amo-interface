import Arrow from './Arrow';
import AssetSelect from '../common/AssetSelect';
import { IAsset, IPool } from '../../lib/protocol/types';
import Button from '../common/Button';
import useTimeTillMaturity from '../../hooks/useTimeTillMaturity';
import InfoIcon from '../common/InfoIcon';
import { ITradeForm } from './Widget';
import { valueAtDigits } from '../../utils/appUtils';
import { calculateSlippage } from '../../utils/yieldMath';
import { DEFAULT_SLIPPAGE, SLIPPAGE_KEY } from '../../constants';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  Container,
  InputsWrap,
  InputStyleContainer,
  InputStyle,
  DetailsWrap,
  DetailWrap,
  LineBreak,
  DetailGray,
  Detail,
  Italic,
  Flex,
  DisclaimerTextWrap,
  AssetSelectWrap,
  Right,
} from '../styles/confirm';

interface ITradeConfirmation {
  form: ITradeForm;
  interestRate: string;
  action: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const ConfirmItem = ({ value, asset, pool }: { value: string; asset: IAsset; pool: IPool }) => (
  <InputStyleContainer>
    <InputStyle>{value}</InputStyle>
    <AssetSelectWrap>
      <AssetSelect item={asset} isFyToken={asset.symbol.includes('FY') || false} pool={pool} />
    </AssetSelectWrap>
  </InputStyleContainer>
);

const TradeConfirmation = ({ form, interestRate, action, disabled, loading }: ITradeConfirmation) => {
  const [slippageTolerance] = useLocalStorage(SLIPPAGE_KEY, DEFAULT_SLIPPAGE);
  const { pool, fromAmount, fromAsset, toAmount, toAsset } = form;
  const timeTillMaturity_ = useTimeTillMaturity(pool?.maturity!);
  const fromAmount_ = valueAtDigits(fromAmount, fromAsset?.digitFormat!);
  const toAmount_ = valueAtDigits(toAmount, toAsset?.digitFormat!);
  const toAmountLessSlippage_ = valueAtDigits(
    calculateSlippage(toAmount || '0', slippageTolerance, true),
    toAsset?.digitFormat!
  );

  const maturityDescription = pool?.isMature ? `Mature` : `${timeTillMaturity_} until maturity`;

  if (!pool || !fromAsset || !toAsset) return null;

  return (
    <Container>
      <InputsWrap>
        <ConfirmItem value={fromAmount_} asset={fromAsset} pool={pool} />
        <Arrow />
        <ConfirmItem value={toAmount_} asset={toAsset} pool={pool} />
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
            <Detail>Expected output</Detail>
            <Detail>
              {toAmount_} {toAsset.symbol}
            </Detail>
          </DetailWrap>
          <LineBreak />
          <DetailWrap>
            <DetailGray>Minimum received after slippage</DetailGray>
            <DetailGray>{toAmountLessSlippage_}</DetailGray>
          </DetailWrap>
          <DetailWrap>
            <Flex>
              <DetailGray>Expected interest rate</DetailGray>
              <InfoIcon infoText="if held until maturity" height=".9rem" width=".9rem" />
            </Flex>
            <DetailGray>{interestRate}%</DetailGray>
          </DetailWrap>
        </DetailsWrap>
      </InputStyleContainer>
      <DisclaimerTextWrap>
        <Italic>
          Output is estimated. You will receive at least {toAmountLessSlippage_} in {toAsset.symbol} or the transaction
          will revert.
        </Italic>
      </DisclaimerTextWrap>
      <Button action={action} disabled={disabled} loading={loading}>
        {loading ? 'Trade Initiated...' : 'Confirm Trade'}
      </Button>
    </Container>
  );
};

export default TradeConfirmation;
