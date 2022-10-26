import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const SkeletonWrap = ({ ...props }: any) => {
  return (
    <SkeletonTheme baseColor={'#343d43'} highlightColor={'#69747a'}>
      <Skeleton {...props} />
    </SkeletonTheme>
  );
};

export default SkeletonWrap;
