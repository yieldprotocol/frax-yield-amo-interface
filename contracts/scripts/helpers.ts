import { writeFile } from "fs/promises";
import { network } from "hardhat";

export const record = async (deployment: Record<string, string>): Promise<void> => {
  console.log(`saving deploy to ./deploys/${network.name}.json\n${JSON.stringify(deployment, null, 2)}`);
  await writeFile(`./deploys/${network.name}.json`, JSON.stringify(deployment, null, 2));
};