import { ReactNode } from 'react';
import tw from 'tailwind-styled-components';

const Container = tw.div`md:m-20 text-center align-middle justify-items-center m-1`;

const Main = ({ children }: { children: ReactNode }) => <Container>{children}</Container>;

export default Main;
