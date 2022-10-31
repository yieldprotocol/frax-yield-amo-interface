import { GetStaticProps, InferGetStaticPropsType } from 'next';
import Widget from '../../components/rates/Widget';
import usePools from '../../hooks/protocol/usePools';
import { getPoolsSSR } from '../../lib/protocol';
import { IPoolMap } from '../../lib/protocol/types';

const Rates = ({ pools }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { data } = usePools(pools);
  return <Widget pools={data} />;
};

export const getStaticProps: GetStaticProps<{ pools: { [chainId: number]: IPoolMap | undefined } }> = async () => {
  const pools = await getPoolsSSR();
  return { props: { pools } };
};

export default Rates;
