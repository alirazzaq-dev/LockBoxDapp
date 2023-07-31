import React from 'react';
import { useWeb3React } from "@web3-react/core";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Box, Button, Flex, useDisclosure } from '@chakra-ui/react';

import { targetChain } from '../utils';
import CreateModal from './CreateModel';


const Create = () => {

    const { active, chainId, account, library: provider } = useWeb3React<JsonRpcProvider>();
    const modalControls = useDisclosure();

    return (

        < Flex border="0px solid red" justify="flex-end" p="20px">

            <Box>
                {
                    active && account && chainId == targetChain && (
                        <Button
                            onClick={modalControls.onOpen}
                            bgColor='blue.200'
                            size="sm"
                        >
                            Create A LockBox
                        </Button>
                    )
                }


                <CreateModal
                    isOpen={modalControls.isOpen}
                    onClose={modalControls.onClose}
                />

            </Box>

        </Flex >
    )
};

export default Create;