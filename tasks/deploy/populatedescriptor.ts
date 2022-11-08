import { task, types } from "hardhat/config";

import ImageData from "../../files/imagev2.json";
import { dataToDescriptorInput } from "../utils";

task("populatedescriptor", "Populates the descriptor with color palettes and Noun parts")
  .addOptionalParam(
    "nftDescriptor",
    "The `NFTDescriptor` contract address",
    "0xFDE4b762f649D83517AEcA3d3193FBd6FCefdE3C",
    types.string,
  )
  .addOptionalParam(
    "blocksDescriptor",
    "The `BlocksDescriptor` contract address",
    "0xb9DF4bE2B74a1e55956690130D715a49685b2168",
    types.string,
  )
  .setAction(async ({ nftDescriptor, blocksDescriptor }, { ethers, network }) => {
    const options = { gasLimit: network.name === "goerli" ? 30000000 : undefined };

    const descriptorFactory = await ethers.getContractFactory("BlocksDescriptor", {
      libraries: {
        NFTDescriptor: nftDescriptor,
      },
    });
    console.log("sdsa");

    const descriptorContract = descriptorFactory.attach(blocksDescriptor);

    const { bgcolors, palette, images } = ImageData;
    const { bodies, accessories, caps } = images;

    const bodiesPage = dataToDescriptorInput(bodies.map(({ data }) => data));
    console.log("bodiesPage", bodiesPage);

    const accessoriesPage = dataToDescriptorInput(accessories.map(({ data }) => data));
    console.log(accessoriesPage);
    const capStylePage = dataToDescriptorInput(caps.map(({ data }) => data));
    console.log(capStylePage);

    await descriptorContract.addManyBackgrounds(bgcolors);
    await descriptorContract.setPalette(0, `0x000000${palette.join("")}`);

    await descriptorContract.addBodies(
      bodiesPage.encodedCompressed,
      bodiesPage.originalLength,
      bodiesPage.itemCount,
      options,
    );
    await descriptorContract.addCapStyles(
      capStylePage.encodedCompressed,
      capStylePage.originalLength,
      capStylePage.itemCount,
      options,
    );
    await descriptorContract.addAccessories(
      accessoriesPage.encodedCompressed,
      accessoriesPage.originalLength,
      accessoriesPage.itemCount,
      options,
    );

    console.log("Descriptor populated with palettes and parts.");
  });
