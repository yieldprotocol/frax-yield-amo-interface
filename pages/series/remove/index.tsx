import dynamic from 'next/dynamic';
import tw from 'tailwind-styled-components';

const DynamicRemoveLiquidity = dynamic(() => import('../../../components/pool/RemoveLiquidity'), { ssr: false });

const Container = tw.div`text-center align-middle justify-center`;

const Remove = () => (
  <Container>
    <DynamicRemoveLiquidity />
  </Container>
);

export default Remove;
