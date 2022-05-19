import Link from 'next/link';
import tw from 'tailwind-styled-components';
import Account from './Account';
import YieldMark from './common/YieldMark';
import NavTabs from './NavTabs';

const Container = tw.div`
  sticky
  top-0 
  w-full 
  flex-none 
  border-b 
  text-gray-800
  dark:text-gray-50
  border-gray-200
  dark:border-gray-900
  sm:dark:bg-gray-800
`;

const Grid = tw.div`grid grid-cols-3 items-center md:px-10 py-2`;
const MarkWrap = tw.div`flex`;

const Navigation = () => (
  <Container>
    <Grid>
      <MarkWrap>
        <Link href="/trade" passHref>
          <div className="hover:cursor-pointer p-2.5 rounded-full dark:bg-gray-50/20 bg-gray-50/50">
            <YieldMark />
          </div>
        </Link>
      </MarkWrap>
      <NavTabs />
      <Account />
    </Grid>
  </Container>
);
export default Navigation;
