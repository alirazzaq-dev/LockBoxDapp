import {
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalContent,
  Box,
  Button,
  Flex,
  Text,
  Center,
  Spinner,
  ModalFooter,
  Select,
  VStack,
  Input,
  InputGroup,
  InputLeftAddon,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { Asset, AssetType, NULL_ADDRESS, NULL_ASSET } from "../types";
import { useWeb3React } from "@web3-react/core";
import { JsonRpcProvider } from "@ethersproject/providers";
import { LockBox, TestNFT } from "../Contracts/typechain-types";
import { Contract, ethers } from "ethers";
import { ERC721ABI, LockBoxABI, LockBoxAddress } from "../Contracts";


const CreateModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {

  const { active, activate, deactivate, chainId,
    account, library: provider } = useWeb3React<JsonRpcProvider>();

  const [isApproved, setIsApproved] = useState(false);
  const [asset1, setAsset1] = useState<Asset>(NULL_ASSET);
  const [asset2, setAsset2] = useState<Asset>(NULL_ASSET);


  const handleAssest1Changes = (value: string, id: "id" | "quantity" | "address") => {

    switch (id) {
      case "id":
        setAsset1((e) => ({ ...e, id: Number(value) }));
        break;
      case "quantity":
        setAsset1((e) => ({ ...e, quantity: Number(value) }));
        break;
      case "address":
        setAsset1((e) => ({ ...e, address: value }));
        break;
    }
  }

  const handleAssest2Changes = (value: string, id: "id" | "quantity" | "address") => {
    switch (id) {
      case "id":
        setAsset2((e) => ({ ...e, id: Number(value) }));
        break;
      case "quantity":
        setAsset2((e) => ({ ...e, quantity: Number(value) }));
        break;
      case "address":
        setAsset2((e) => ({ ...e, address: value }));
        break;
    }
  }


  const [loading, setLoading] = useState(false);
  const loader = <Center> <Spinner /> </Center>;

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  }

  const handleCreate = async () => {

    if (provider) {

      setLoading(true);

      const signer = provider.getSigner();
      const LockBoxContract = new Contract(LockBoxAddress, LockBoxABI, signer) as LockBox;
      const fee = await LockBoxContract.getLockBoxFee();


      if (asset1.type == AssetType.NFT && asset2.type == AssetType.COIN) {

        // Approve the token so it can be fetched by LockBox

        try {

          const tx = await LockBoxContract.createLockBox(
            asset1.type,
            asset1.address,
            asset1.id,
            1,

            asset2.type,
            NULL_ADDRESS,
            1,
            ethers.utils.parseEther(asset2.quantity.toString()),

            24 * 60 * 60,
            { value: fee }
          );

          await tx.wait(1);
          alert("Box is created Successfully");
        }
        catch (e) {
          console.error(e);
        }

      }

      if (asset1.type == AssetType.COIN && asset2.type == AssetType.NFT) {

        try {
          const signer = provider.getSigner();
          const LockBoxContract = new Contract(LockBoxAddress, LockBoxABI, signer) as LockBox;

          const tx = await LockBoxContract.createLockBox(
            asset1.type,
            NULL_ADDRESS,
            1,
            ethers.utils.parseEther(asset1.quantity.toString()),

            asset2.type,
            asset2.address,
            asset2.id,
            1,


            24 * 60 * 60,
            { value: fee.add(ethers.utils.parseEther(asset1.quantity.toString())) }

          );

          await tx.wait(1);
          alert("Box is created Successfully");
        }
        catch (e) {
          console.error(e);
        }

      }

      if (asset1.type == AssetType.NFT && asset2.type == AssetType.NFT) {

        try {
          const signer = provider.getSigner();
          const LockBoxContract = new Contract(LockBoxAddress, LockBoxABI, signer) as LockBox;

          const tx = await LockBoxContract.createLockBox(
            asset1.type,
            asset1.address,
            asset1.id,
            1,

            asset2.type,
            asset2.address,
            asset2.id,
            1,

            24 * 60 * 60,
            { value: fee }

          );

          await tx.wait(1);
          alert("Box is created Successfully");
        }
        catch (e) {
          console.error(e);
        }

      }

      setLoading(false);


    }



  }

  const approveAsset = async () => {

    if (provider && account) {
      setLoading(true);


      if (asset1.type == AssetType.NFT) {
        try {
          const signer = provider.getSigner();
          const NFTContract = new Contract(asset1.address, ERC721ABI, signer) as TestNFT;
          const approvedTo = await NFTContract.getApproved(asset1.id);

          // console.log("approvedTo: ", approvedTo);

          if (approvedTo != LockBoxAddress) {
            const tx = await NFTContract.approve(LockBoxAddress, asset1.id,);
            await tx.wait(1);
          }
          else {
            setIsApproved(true);
          }
        }
        catch (e) {
          console.error(e);
        }
      }


      else if (asset1.type == AssetType.COIN) {
        try {
          const balance = await provider.getBalance(account);
          if (balance.lt(ethers.utils.parseEther(asset1.quantity.toString()))) {
            alert("Insufficient balance")
            return;
          }
          else {
            setIsApproved(true);
          }
        }
        catch (e) {
          console.error(e);
        }
      }

      setLoading(false);
    }

  }

  const Asset1InputArea = () => {
    return (
      <Box w="45%" >
        <Text my="10px" w="full" textAlign="center"> Asset 1 </Text>

        <VStack w="full">

          {/* export enum AssetType {NFT, TOKEN, COIN, ERC1155} */}

          <Select
            value={asset1.type}
            onChange={(e) => {
              setIsApproved(false);
              setAsset1(NULL_ASSET);

              const val = Number(e.target.value);
              switch (val) {
                case AssetType.NFT:
                  setAsset1((e) => ({ ...e, type: AssetType.NFT }));
                  break;
                case AssetType.TOKEN:
                  setAsset1((e) => ({ ...e, type: AssetType.TOKEN }));
                  break;
                case AssetType.COIN:
                  setAsset1((e) => ({ ...e, type: AssetType.COIN }));
                  break;
                case AssetType.ERC1155:
                  setAsset1((e) => ({ ...e, type: AssetType.ERC1155 }));
                  break;
              }
            }}
          >
            {/* <option value={AssetType.TOKEN}>ERC20 Token</option> */}
            <option value={AssetType.NFT}>ERC721 NFT</option>
            {/* <option value={AssetType.ERC1155}>ERC1155 NFT</option> */}
            <option value={AssetType.COIN}> Coin </option>
          </Select>

          {
            asset1.type === AssetType.NFT && (
              <VStack w="full">
                <Input
                  placeholder="Asset Address"
                  value={asset1.address}
                  onChange={(e) => handleAssest1Changes(e.target.value, "address")}
                  type="text"
                />

                <Input
                  placeholder="Asset id"
                  value={asset1.id}
                  onChange={(e) => handleAssest1Changes(e.target.value, "id")}
                  type="number"
                />
              </VStack>
            )
          }

          {
            asset1.type === AssetType.TOKEN && (
              <VStack w="full">
                <Input
                  placeholder="Asset Address"
                  value={asset1.address}
                  onChange={(e) => handleAssest1Changes(e.target.value, "address")}
                  type="text"
                />
                <Input
                  placeholder="Asset Quantity"
                  value={asset1.quantity}
                  onChange={(e) => handleAssest1Changes(e.target.value, "quantity")}
                  type="number"
                />
              </VStack>
            )
          }

          {
            asset1.type === AssetType.ERC1155 && (
              <VStack w="full">
                <Input
                  placeholder="Asset Address"
                  value={asset1.address}
                  onChange={(e) => handleAssest1Changes(e.target.value, "address")}
                  type="text"
                />
                <Input
                  placeholder="Asset id"
                  value={asset1.id}
                  onChange={(e) => handleAssest1Changes(e.target.value, "id")}
                  type="number"
                />
                <Input
                  placeholder="Asset Quantity"
                  value={asset1.quantity}
                  onChange={(e) => handleAssest1Changes(e.target.value, "quantity")}
                  type="number"
                />
              </VStack>
            )
          }

          {
            asset1.type === AssetType.COIN && (
              <VStack w="full">
                <InputGroup>
                  <InputLeftAddon>
                    ETH
                  </InputLeftAddon>
                  <Input
                    placeholder="Asset Quantity"
                    value={asset1.quantity}
                    onChange={(e) => handleAssest1Changes(e.target.value, "quantity")}
                    type="number"
                  />
                </InputGroup>
              </VStack>
            )
          }

        </VStack>

      </Box>
    )
  }

  const Asset2InputArea = () => {
    return (
      <Box w="45%" >
        <Text my="10px" w="full" textAlign="center"> Asset 2 </Text>

        <VStack w="full">

          <Select
            value={asset2.type}
            onChange={(e) => {
              setAsset2(NULL_ASSET);
              const val = Number(e.target.value);
              switch (val) {
                case AssetType.NFT:
                  setAsset2((e) => ({ ...e, type: AssetType.NFT }));
                  break;
                case AssetType.TOKEN:
                  setAsset2((e) => ({ ...e, type: AssetType.TOKEN }));
                  break;
                case AssetType.COIN:
                  setAsset2((e) => ({ ...e, type: AssetType.COIN }));
                  break;
                case AssetType.ERC1155:
                  setAsset2((e) => ({ ...e, type: AssetType.ERC1155 }));
                  break;
              }
            }}
          >
            <option value={AssetType.NFT}>ERC721 NFT</option>
            {/* <option value={AssetType.TOKEN}>ERC20 Token</option> */}
            <option value={AssetType.COIN}> Coin </option>
            {/* <option value={AssetType.ERC1155}>ERC1155 Token</option> */}
          </Select>

          {
            asset2.type === AssetType.NFT && (
              <VStack w="full">
                <Input
                  placeholder="Asset Address"
                  value={asset2.address}
                  onChange={(e) => handleAssest2Changes(e.target.value, "address")}
                  type="text"
                />

                <Input
                  placeholder="Asset id"
                  value={asset2.id}
                  onChange={(e) => handleAssest2Changes(e.target.value, "id")}
                  type="number"
                />
              </VStack>
            )
          }

          {
            asset2.type === AssetType.TOKEN && (
              <VStack w="full">
                <Input
                  placeholder="Asset Address"
                  value={asset2.address}
                  onChange={(e) => handleAssest2Changes(e.target.value, "address")}
                  type="text"
                />
                <Input
                  placeholder="Asset Quantity"
                  value={asset2.quantity}
                  onChange={(e) => handleAssest2Changes(e.target.value, "quantity")}
                  type="number"
                />
              </VStack>
            )
          }

          {
            asset2.type === AssetType.ERC1155 && (
              <VStack w="full">
                <Input
                  placeholder="Asset Address"
                  value={asset2.address}
                  onChange={(e) => handleAssest2Changes(e.target.value, "address")}
                  type="text"
                />
                <Input
                  placeholder="Asset id"
                  value={asset2.id}
                  onChange={(e) => handleAssest2Changes(e.target.value, "id")}
                  type="number"
                />
                <Input
                  placeholder="Asset Quantity"
                  value={asset2.quantity}
                  onChange={(e) => handleAssest2Changes(e.target.value, "quantity")}
                  type="number"
                />
              </VStack>
            )
          }

          {
            asset2.type === AssetType.COIN && (
              <VStack w="full">
                <InputGroup>
                  <InputLeftAddon>
                    ETH
                  </InputLeftAddon>
                  <Input
                    placeholder="Asset Quantity"
                    value={asset2.quantity}
                    onChange={(e) => handleAssest2Changes(e.target.value, "quantity")}
                    type="number"
                  />
                </InputGroup>
              </VStack>
            )
          }

        </VStack>

      </Box>
    )
  }


  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay backdropFilter='blur(20px)' />
      <ModalContent
        color="black"
        m="auto"
        minW={{ md: "1000px" }}
        border="1px solid transparent"
        borderColor="main.border"
      >
        <ModalHeader> Create a LockBox </ModalHeader>
        <ModalCloseButton color="red" disabled={loading} />
        <ModalBody>

          <Flex
            direction={{ base: "column", md: "row" }}
            border="0px solid red"
            width="full"
            justify="space-between"
          >

            {/* <Asset1InputArea /> */}
            {Asset1InputArea()}
            <Center w="5%" alignItems="center">
              swap
            </Center>
            {Asset2InputArea()}
            {/* <Asset2InputArea /> */}

          </Flex>

          <ModalFooter color="black">


            {
              !isApproved ? (
                <Button
                  type="submit"
                  bgColor='blue.200'
                  size="sm"
                  onClick={approveAsset}
                  disabled={loading}
                >
                  {loading ? loader : <Text>  Approve  </Text>}
                </Button>
              ) : (
                <Button
                  type="submit"
                  bgColor='blue.200'
                  size="sm"
                  onClick={handleCreate}
                  disabled={loading}
                >
                  {loading ? loader : <Text>  Create  </Text>}
                </Button>
              )
            }

          </ModalFooter>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CreateModal;
