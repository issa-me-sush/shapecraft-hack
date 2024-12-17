const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const ShapeVerse = await ethers.getContractFactory("ShapeVerse");
  const shapeVerse = await ShapeVerse.deploy(deployer.address);
  await shapeVerse.deployed();

  console.log("ShapeVerse deployed to:", shapeVerse.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 