import tw from 'tailwind-styled-components';
import dynamic from 'next/dynamic';

const DynamicPools = dynamic(() => import('../../components/pool/Pools'), { ssr: false });

const Container = tw.div`text-center align-middle justify-center`;
const Inner = tw.div`m-4 text-center`;
const Header = tw.div`text-lg justify-items-start align-middle`;
const InnerWrap = tw.div`flex gap-10`;
const Wrap = tw.div`mx-auto min-w-md p-2 shadow-md rounded-xl dark:bg-black/80 bg-gray-100 dark:text-gray-50`;

const Pool = () => (
  <Container>
    <InnerWrap>
      <Wrap>
        <Inner>
          <div className="flex justify-between align-middle gap-10 items-center">
            <Header>Available Series</Header>
          </div>
        </Inner>
        <DynamicPools />
      </Wrap>
    </InnerWrap>
  </Container>
);

export default Pool;
