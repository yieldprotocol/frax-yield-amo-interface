import { artifacts, waffle } from "hardhat";
import { Signer, BigNumberish, BigNumber } from "ethers";
import { ReimbursementToken, MockToken } from "../typechain/";
import { parseUnits } from "@ethersproject/units";
const { deployContract } = waffle;

export const deployRiToken = (deployer: Signer, params: Array<any>): Promise<ReimbursementToken> => {
  const artifact = artifacts.readArtifactSync("ReimbursementToken");
  return deployContract(deployer, artifact, params) as Promise<ReimbursementToken>;
};

export const deployMockToken = (
  deployer: Signer,
  name: string = "MockToken",
  symbol: string = "MOCK",
  decimals: BigNumberish = 18,
): Promise<MockToken> => {
  const artifact = artifacts.readArtifactSync("MockToken");
  return deployContract(deployer, artifact, [name, symbol, decimals]) as Promise<MockToken>;
};

export const toWad = (amount: BigNumberish, decimals: BigNumberish): BigNumberish => {
  const wadDecimals = BigNumber.from(18);
  if (wadDecimals.lt(decimals)) {
    throw new Error("Decimals cannot be greater than WAD decimals");
  }

  return BigNumber.from(10).pow(wadDecimals.sub(decimals)).mul(amount);
}
