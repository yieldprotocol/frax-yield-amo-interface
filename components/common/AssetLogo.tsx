import { marks } from '../../config/marks';
import { hexToRgb } from '../../utils/appUtils';

interface IAssetLogo {
  image: string;
  styleProps?: string;
}

const AssetLogo = ({ image, styleProps }: IAssetLogo) => {
  const mark = marks[image];
  return (
    <div
      className={`${styleProps ? styleProps : ' h-[24px] w-[24px] rounded-full'}`}
      style={{
        background: `rgba(${hexToRgb(mark.color)}, .12)`,
      }}
    >
      {mark.component}
    </div>
  );
};

export default AssetLogo;
