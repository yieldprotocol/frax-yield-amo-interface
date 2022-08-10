import { ReactNode } from 'react';
import Main from '../components/Main';
import Navigation from './Navigation';

const Layout = ({ children }: { children: ReactNode }) => (
  <>
    <Navigation />
    <Main>{children}</Main>
  </>
);

export default Layout;
