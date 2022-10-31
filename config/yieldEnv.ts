const yieldEnv: {
  addresses: { [chainId: number]: { [name: string]: string } };
  seasonColors: { [chainId: number]: { [season: string]: string[] } };
} = {
  addresses: {
    1: {
      Cauldron: '0xc88191f8cb8e6d4a668b047c1c8503432c3ca867',
      Ladle: '0x6cb18ff2a33e981d1e38a663ca056c0a5265066a',
      AMO: '0x8971946467a77b798762823434c0f407d20f9df9',
      FRAX: '0x853d955acef822db058eb8505911ed77f175b99e',
      Timelock: '0x8412ebf45bac1b340bbe8f318b928c466c4e39ca',
    },
  },
  seasonColors: {
    1: {
      WINTER: ['#d4d4d8', '#38bdf8', '#292524'],
      SPRING: ['#34d399', '#e879f9', '#292524'],
      SUMMER: ['#facc15', '#15803d', '#292524'],
      FALL: ['#a78bfa', '#c2410c', '#ffffff'],
    },
  },
};

export default yieldEnv;
