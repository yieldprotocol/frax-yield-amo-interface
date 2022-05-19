import dynamic from 'next/dynamic';
import tw from 'tailwind-styled-components';

const DynamicPoolItem = dynamic(() => import('../../components/pool/PoolItem'), { ssr: false });

const Container = tw.div`text-center align-middle justify-center`;

const PoolItemPage = () => (
  <Container>
    <DynamicPoolItem />
  </Container>
);

export default PoolItemPage;
