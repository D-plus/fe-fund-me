import { CONTRACT_ADDRESS, abi } from "./constants.js";
import { ethers } from "./ethers-5.2.esm.min.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      connectButton.innerHTML = "Connected";
    } catch (e) {
      console.log(e);
    }
  } else {
    console.log("No metamask");
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  // To send a transaction we need:
  // provider / connect to a blockchain
  // signer / wallet
  // contract that we are interracting with (ABI and Address)

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

  try {
    const transactionResponse = await contract.fund({
      value: ethers.utils.parseEther(ethAmount),
    });

    await listenForTransactionMine(transactionResponse, provider);
    console.log("Done!");
  } catch (e) {
    console.log(e);
  }
}

function listenForTransactionMine(trxResponse, provider) {
  console.log(`Mining ${trxResponse.hash}`);

  return new Promise((resolve) => {
    provider.once(trxResponse.hash, (trxReceipt) => {
      console.log(`Completed with ${trxReceipt.confirmations} confirmations`);
      resolve();
    });
  });
}

async function getBalance() {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(CONTRACT_ADDRESS);
    console.log(`balance ${ethers.utils.formatEther(balance)}`);
    document.getElementById(
      "currentBalance"
    ).innerText = `${ethers.utils.formatEther(balance)} ETH`;
  }
}

async function withdraw() {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = await new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

    try {
      const transactionResponse = await contract.withdraw();

      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done!");
    } catch (e) {
      console.log(e);
    }
  }
}
