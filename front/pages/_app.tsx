import type { AppProps } from "next/app";

import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider, ExternalProvider } from "@ethersproject/providers";
import { ChakraProvider } from "@chakra-ui/react";
import { InjectedConnector } from '@web3-react/injected-connector';

export const injected = new InjectedConnector({
  supportedChainIds: [1,2,3,4,5, 56, 11155111],
});

const getLibrary = (provider: ExternalProvider) => {
  return new Web3Provider(provider);
};


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <div className="App">
        <Web3ReactProvider getLibrary={getLibrary}>
          <ChakraProvider>
            <Component {...pageProps} />
          </ChakraProvider>
        </Web3ReactProvider>
      </div>
    </>
  );
}

export default MyApp;
