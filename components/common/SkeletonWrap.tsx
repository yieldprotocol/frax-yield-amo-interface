import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const SkeletonWrap = ({ ...props }: any) => {
  return (
    <SkeletonTheme baseColor={'#202A30'} highlightColor={'#313c42'}>
      <Skeleton {...props} />
    </SkeletonTheme>
  );
};

export default SkeletonWrap;
