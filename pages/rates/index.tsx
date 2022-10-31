import { GetStaticProps, InferGetStaticPropsType } from 'next';
import Widget from '../../components/rates/Widget';
import usePools from '../../hooks/protocol/usePools';
import { getPoolsSSR } from '../../lib/protocol';
import { IPoolMap } from '../../lib/protocol/types';

export const VALID_CHAINS = [0, 1]; // 0 is tenderly, which is the corresponding live chain's (mainnet) data plus tenderly specific data
export const TENDERLY_MAPPED_CHAIN = 1; // which chain the tenderly environment corresponds to

const Rates = ({ pools }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { data } = usePools(pools);
  return <Widget pools={data} />;
};

export const getStaticProps: GetStaticProps<{ pools: { [chainId: number]: IPoolMap } | undefined }> = async () => {
  const pools = await getPoolsSSR();
  return { props: { pools } };
};

export default Rates;
