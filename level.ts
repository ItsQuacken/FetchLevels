import axios from "axios";
import fs from "fs";

const getTokenMints = () => {
  try {
    const data = fs.readFileSync("tokenmint.txt", "utf8");
    return data.split("\n").filter((tokenMint) => tokenMint.trim() !== "");
  } catch (err) {
    console.error("Error reading tokenmint.txt file:", err);
    return [];
  }
};

const fetchNFTDetails = async (tokenMint: string) => {
  try {
    const response = await axios.get(
      `https://api-mainnet.magiceden.dev/v2/tokens/${tokenMint}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for token mint ${tokenMint}:`, error);
    return null;
  }
};

const extractLevels = async () => {
  const tokenMints = getTokenMints();
  const totalTokenMints = tokenMints.length;

  console.log(`Total token mints to process: ${totalTokenMints}`);

  let levels: number[] = [];

  for (let i = 0; i < totalTokenMints; i++) {
    const tokenMint = tokenMints[i];

    await new Promise((resolve) => setTimeout(resolve, 100)); // Introduce a delay of 0.1 second between requests

    const nftDetails = await fetchNFTDetails(tokenMint);
    if (nftDetails) {
      const level = extractLevelFromAttributes(nftDetails.attributes);
      if (level !== null && level !== undefined) {
        levels.push(level);
        console.log(
          `Token Mint: ${tokenMint}, Level: ${level}, Remaining: ${
            totalTokenMints - i - 1
          }`
        );
      }
    } else {
      console.log(
        `Error fetching details for token mint ${tokenMint}. Skipping. Remaining: ${
          totalTokenMints - i - 1
        }`
      );
    }
  }

  // Save the levels to a file
  fs.writeFileSync("nft_levels.txt", levels.join("\n"));
  console.log("Levels data saved to nft_levels.txt");
};

const extractLevelFromAttributes = (attributes: any[]) => {
  if (Array.isArray(attributes) && attributes.length > 0) {
    const levelAttribute = attributes.find(
      (attr) => attr.trait_type === "level"
    );
    return levelAttribute ? levelAttribute.value : null;
  }
  return null;
};

// Start processing token mints to get levels
extractLevels();
