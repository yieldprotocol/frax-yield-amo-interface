import dynamic from 'next/dynamic';
import tw from 'tailwind-styled-components';

const DynamicAddLiquidity = dynamic(() => import('../../../components/pool/AddLiquidity'), { ssr: false });

const Container = tw.div`text-center align-middle justify-center`;

const Add = () => (
  <Container>
    <DynamicAddLiquidity />
  </Container>
);

export default Add;
