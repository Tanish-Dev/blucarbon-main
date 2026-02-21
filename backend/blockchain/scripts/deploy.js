const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("=================================================");
    console.log("🚀 BluCarbon Smart Contract Deployment");
    console.log("=================================================");
    console.log(`Deployer address: ${deployer.address}`);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`Deployer balance: ${hre.ethers.formatEther(balance)} MATIC`);
    console.log("-------------------------------------------------");

    // 1. Deploy MRVRegistry (no constructor args, no OpenZeppelin dependency)
    console.log("\n📦 Deploying MRVRegistry...");
    const MRVRegistry = await hre.ethers.getContractFactory("MRVRegistry");
    const mrvRegistry = await MRVRegistry.deploy();
    await mrvRegistry.waitForDeployment();
    const mrvAddress = await mrvRegistry.getAddress();
    console.log(`✅ MRVRegistry deployed at: ${mrvAddress}`);

    // 2. Deploy ProjectRegistry (Ownable constructor)
    console.log("\n📦 Deploying ProjectRegistry...");
    const ProjectRegistry = await hre.ethers.getContractFactory("ProjectRegistry");
    const projectRegistry = await ProjectRegistry.deploy();
    await projectRegistry.waitForDeployment();
    const projAddress = await projectRegistry.getAddress();
    console.log(`✅ ProjectRegistry deployed at: ${projAddress}`);

    // 3. Deploy CarbonCreditNFT
    console.log("\n📦 Deploying CarbonCreditNFT...");
    const CarbonCreditNFT = await hre.ethers.getContractFactory("CarbonCreditNFT");
    const carbonCreditNFT = await CarbonCreditNFT.deploy();
    await carbonCreditNFT.waitForDeployment();
    const nftAddress = await carbonCreditNFT.getAddress();
    console.log(`✅ CarbonCreditNFT deployed at: ${nftAddress}`);

    // Summary
    console.log("\n=================================================");
    console.log("🎉 All contracts deployed successfully!");
    console.log("=================================================");
    console.log(`MRV_REGISTRY_ADDRESS="${mrvAddress}"`);
    console.log(`PROJECT_REGISTRY_ADDRESS="${projAddress}"`);
    console.log(`CARBON_CREDIT_NFT_ADDRESS="${nftAddress}"`);
    console.log("-------------------------------------------------");
    console.log("\n📝 Add these addresses to your backend/.env file:");
    console.log(`\nMRV_REGISTRY_ADDRESS="${mrvAddress}"`);
    console.log(`PROJECT_REGISTRY_ADDRESS="${projAddress}"`);
    console.log(`CARBON_CREDIT_NFT_ADDRESS="${nftAddress}"`);

    // Save deployment info to file
    const deploymentInfo = {
        network: hre.network.name,
        chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            MRVRegistry: mrvAddress,
            ProjectRegistry: projAddress,
            CarbonCreditNFT: nftAddress,
        },
    };

    const deploymentPath = path.join(__dirname, "..", "deployments.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
