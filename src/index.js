const { ethers, AlchemyProvider } = require("ethers");
const { txHashes } = require("./txHashes");
const fs = require("fs");

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";

const provider = new AlchemyProvider("mainnet", ALCHEMY_API_KEY);

async function fetchGasFees(txHashes) {
  const results = [];

  for (const txHash of txHashes) {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      const transaction = await provider.getTransaction(txHash);
      const gasUsed = receipt.gasUsed;
      const gasPrice = receipt.effectiveGasPrice || transaction.gasPrice;
      const gasFeeWei = gasUsed * gasPrice;
      const gasFeeEther = ethers.formatEther(gasFeeWei);
      const result = Object.freeze({
        txHash: txHash,
        gasFee: gasFeeEther,
      });
      results.push(result);
    } catch (error) {
      console.error(`Error fetching transaction ${txHash}:`, error);
    }
  }

  fs.writeFile("./output/result.json", JSON.stringify(results, null, 2), (err) => {
    if (err) {
      console.error("Error writing to output.json:", err);
    } else {
      console.log("Results saved to output.json");
    }
  });
}

fetchGasFees(txHashes);
