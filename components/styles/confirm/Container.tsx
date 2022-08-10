import { ReactNode } from 'react';
import tw from 'tailwind-styled-components';

export const Container = tw.div`relative flex justify-center items-center w-full`;
export const Wrap = tw.div`w-full`;

const ConfirmContainer = ({ children }: { children: ReactNode }) => (
  <Container>
    <Wrap>{children}</Wrap>
  </Container>
);

export default ConfirmContainer;
