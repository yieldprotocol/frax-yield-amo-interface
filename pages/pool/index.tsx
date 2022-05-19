import tw from 'tailwind-styled-components';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const DynamicPools = dynamic(() => import('../../components/pool/Pools'), { ssr: false });

const Container = tw.div`text-center align-middle justify-center`;
const Inner = tw.div`m-4 text-center`;
const Header = tw.div`text-lg justify-items-start align-middle`;
const Button = tw.button`w-full bg-primary-700/80 align-middle px-4 py-2 text-gray-50 rounded-md hover:bg-primary-800/50`;
const InnerWrap = tw.div`flex gap-10`;
const Wrap = tw.div`mx-auto min-w-md p-2 shadow-md rounded-xl dark:bg-black/80 bg-gray-100 dark:text-gray-50`;

const Pool = () => (
  <Container>
    <InnerWrap>
      <Wrap>
        <Inner>
          <div className="flex justify-between align-middle gap-10 items-center">
            <Header>Your Positions</Header>
            <Link href="/pool/add" passHref>
              <div className="w-30">{/* <Button>+New Position</Button> */}</div>
            </Link>
          </div>
        </Inner>
        <DynamicPools />
      </Wrap>
    </InnerWrap>
  </Container>
);

export default Pool;
