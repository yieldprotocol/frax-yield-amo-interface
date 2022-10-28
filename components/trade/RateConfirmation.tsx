import Arrow from './Arrow';
import AssetSelect from '../common/AssetSelect';
import { IAsset, IPool } from '../../lib/protocol/types';
import Button from '../common/Button';
import useTimeTillMaturity from '../../hooks/useTimeTillMaturity';
import InfoIcon from '../common/InfoIcon';
import { IWidgetForm } from './Widget';
import { cleanValue } from '../../utils/appUtils';
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
import { ArrowRightIcon, BoltIcon } from '@heroicons/react/20/solid';
import useRatePreview from '../../hooks/protocol/useRatePreview';
import useBase from '../../hooks/protocol/useBase';

interface IRateConfirmation {
  form: IWidgetForm;
  action: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const ConfirmItem = ({ value, asset, pool, label }: { value: string; asset: IAsset; pool: IPool; label?: string }) => (
  <InputStyleContainer>
    <InputStyle>{value}</InputStyle>
    <AssetSelectWrap>
      <AssetSelect item={asset} isFyToken={asset.symbol.includes('FY') || false} pool={pool} />
    </AssetSelectWrap>
  </InputStyleContainer>
);

const RateConfirmation = ({ form, action, disabled, loading }: IRateConfirmation) => {
  const { pool, increasingRate, baseAmount, desiredRate } = form;
  const { data: base } = useBase(pool?.base!);
  const { baseBought_, fyTokenBought_, minBaseBought_, minFyTokenBought_ } = useRatePreview(
    pool?.address!,
    +desiredRate / 100,
    baseAmount,
    true,
    increasingRate
  );
  const timeTillMaturity_ = useTimeTillMaturity(pool?.maturity!);
  const baseAmount_ = cleanValue(baseAmount, base?.digitFormat!);

  const verb = increasingRate ? 'Increase' : 'Decrease';
  const maturityDescription = pool?.isMature ? `Mature` : `${timeTillMaturity_} until maturity`;

  const expectedOutput = increasingRate ? baseBought_ : fyTokenBought_;
  const minReceived = increasingRate ? minBaseBought_ : minFyTokenBought_;
  const assetOut = increasingRate ? pool?.base : pool?.fyToken;

  if (!pool) return null;

  return (
    <Container>
      <div className="italic text-gray-50 mt-4 whitespace-nowrap text-sm">
        {increasingRate
          ? 'Deposit FRAX ==> Mint FYFRAX ==> Swap FYFRAX to FRAX'
          : 'Swap FRAX to FYFRAX ==> Burn FYFRAX'}
      </div>
      <InputsWrap>
        {increasingRate ? (
          <>
            <ConfirmItem value={baseAmount_} asset={base!} pool={pool} />
            <Arrow isBolt={true} />
            <ConfirmItem value={baseAmount_} asset={pool.fyToken} pool={pool} />
            <Arrow />
            <ConfirmItem value={expectedOutput!} asset={base!} pool={pool} />
          </>
        ) : (
          <>
            <ConfirmItem value={baseAmount_} asset={base!} pool={pool} />
            <Arrow />
            <ConfirmItem value={expectedOutput!} asset={pool.fyToken} pool={pool} />
            <Arrow isFire={true} />
            <ConfirmItem value={expectedOutput!} asset={pool.fyToken} pool={pool} />
          </>
        )}
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
              {expectedOutput} {base?.symbol}
            </Detail>
          </DetailWrap>
          <LineBreak />
          <DetailWrap>
            <DetailGray>Minimum received after slippage</DetailGray>
            <DetailGray>{minReceived}</DetailGray>
          </DetailWrap>
          <DetailWrap>
            <Flex>
              <DetailGray>Expected interest rate</DetailGray>
              <InfoIcon infoText="if held until maturity" height=".9rem" width=".9rem" />
            </Flex>
            <DetailGray>{desiredRate.toString()}%</DetailGray>
          </DetailWrap>
        </DetailsWrap>
      </InputStyleContainer>
      <DisclaimerTextWrap>
        <Italic>
          Output is estimated. You will receive at least {minReceived} in {assetOut?.symbol} or the transaction will
          revert.
        </Italic>
      </DisclaimerTextWrap>
      <Button action={action} disabled={disabled} loading={loading}>
        {loading ? `${verb} Rate Initiated...` : `Confirm ${verb} Rate`}
      </Button>
    </Container>
  );
};

export default RateConfirmation;
