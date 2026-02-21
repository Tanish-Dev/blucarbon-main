/**
 * Copies compiled ABIs from Hardhat artifacts to the abi/ folder
 * so the Python backend (blockchain_integration.py) can load them.
 */
const fs = require("fs");
const path = require("path");

const contracts = ["MRVRegistry", "ProjectRegistry", "CarbonCreditNFT"];
const artifactsDir = path.join(__dirname, "..", "artifacts", "contracts");
const abiDir = path.join(__dirname, "..", "abi");

// Ensure abi directory exists
if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
}

let success = 0;

for (const name of contracts) {
    const artifactPath = path.join(artifactsDir, `${name}.sol`, `${name}.json`);

    if (!fs.existsSync(artifactPath)) {
        console.error(`❌ Artifact not found: ${artifactPath}`);
        console.error(`   → Run 'npm run compile' first!`);
        continue;
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
    const abi = artifact.abi;

    const outputPath = path.join(abiDir, `${name}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(abi, null, 2));
    console.log(`✅ ${name}.json → ${outputPath} (${abi.length} functions)`);
    success++;
}

console.log(`\n${success}/${contracts.length} ABIs extracted successfully.`);

if (success === contracts.length) {
    console.log("🎉 All ABIs ready! The Python backend can now interact with the contracts.");
} else {
    console.log("⚠️  Some ABIs are missing. Make sure all contracts compiled successfully.");
}
