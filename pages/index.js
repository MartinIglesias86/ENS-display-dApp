import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { ethers, providers } from "ethers";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  //walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  //create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();
  //ENS
  const [ens, setENS] = useState("");
  //save the address of the currently connected account
  const [address, setAddress] = useState("");

  //set the ENS, if the current connected address has an associated ENS or else it sets the address of the connected account
  const setENSOrAddress = async (address, web3Provider) => {
    //lookup the ENS related to the given address
    let _ens = await web3Provider.lookupAddress(address);
    //if the address has an ENS set the ENS or else just set the address
    if (_ens) {
      setENS(_ens);
    } else {
      setAddress(address);
    }
  };
  
  /* A 'provider' is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
  A 'signer' is a special type of Provider used in case a 'write' transaction needs to be made to the blockchain, which involves
  the connected account needing to make a digital signature to authorize the transaction being sent. Metamask exposes a 
  Signer API to allow your website to request signatures from the user using Signer functions
   */
  const getProviderOrSigner = async () => {
    //connect to Metamask. Since we store 'web3Modal' as a reference, we need to access the 'current' value to get 
    //access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    //if user is not connected to the Rinkeby network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Por favor cambia tu red a Rinkeby");
      throw new Error("Por favor cambia tu red a Rinkeby");
    }
    const signer = web3Provider.getSigner();
    //get the address associated to the signer which is connected to Metamask
    const address = await signer.getAddress();
    //calls the function to set the ENS or Address
    await setENSOrAddress(address, web3Provider);
    return signer;
  };

  //connectWallet connects the Metamask wallet
  const connectWallet = async () => {
    try {
      //get the provider from web3Modal, which in our case is Metamask
      //when used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner(true);
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  //renderButton returns a button based on the state of the dApp
  const renderButton = () => {
    if (walletConnected) {
      <div>Wallet conectada</div>;
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>Conecta tu wallet</button>
      );
    }
  };

  //useEffects are used to react to changes in state of the website.
  //The array at the end of function call represents what state changes will trigger this effect,
  //in this case, whenever the value of 'walletConnected' changes - this effect will be called
  useEffect(() => {
    //if wallet is not connected, create a new instance of Web3Modal and connect the wallet
    if (!walletConnected) {
      //assign the Web3Modal class to the reference object by setting it's 'current' value
      //the 'current' value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>ENS dApp</title>
        <meta name="description" content="ENS-dApp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Bienvenid@ a Crypto Devs Punks {ens ? ens : address}!</h1>
          <div className={styles.description}>Es una colección NFT para Crypto Devs Punks.</div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./learnweb3punks.png" />
        </div>
      </div>

      <footer className={styles.footer}>Made with &#10084; by Martin Iglesias</footer>
    </div>
  )
}