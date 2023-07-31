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
import { LockBox } from "../Contracts/typechain-types";
import { Contract, ethers } from "ethers";
import { LockBoxABI, LockBoxAddress } from "../Contracts";


const CreateModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {

  const { active, activate, deactivate, chainId,
    account, library: provider } = useWeb3React<JsonRpcProvider>();

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



      // if (asset1.type == AssetType.NFT) {

      //   let asset1Type = AssetType.NFT;
      //   let asset1Id = asset1.id;
      //   let asset1Address = asset1.address;
      //   let asset1Quantity = 1;

      // }

      // else if (asset1.type == AssetType.TOKEN) {

      //   let asset1Type = AssetType.TOKEN;
      //   let asset1Id = 0;
      //   let asset1Address = asset1.address;
      //   let asset1Quantity = asset1.quantity;

      // }

      // else if (asset1.type == AssetType.ERC1155) {

      //   let asset1Type = AssetType.TOKEN;
      //   let asset1Id = asset1.id;
      //   let asset1Address = asset1.address;
      //   let asset1Quantity = asset1.quantity;

      // }

      // else {

      //   let asset1Type = AssetType.COIN;
      //   let asset1Id = 0;
      //   let asset1Address = NULL_ADDRESS;
      //   let asset1Quantity = asset1.quantity;

      // }


      // if (asset2.type == AssetType.NFT) {

      //   let asset2Type = AssetType.NFT;
      //   let asset2Id = asset2.id;
      //   let asset2Address = asset2.address;
      //   let asset2Quantity = 0;

      // }

      // else if (asset2.type == AssetType.TOKEN) {

      //   let asset2Type = AssetType.TOKEN;
      //   let asset2Id = 0;
      //   let asset2Address = asset2.address;
      //   let asset2Quantity = asset2.quantity;

      // }

      // else if (asset2.type == AssetType.ERC1155) {

      //   let asset2Type = AssetType.TOKEN;
      //   let asset2Id = asset2.id;
      //   let asset2Address = asset2.address;
      //   let asset2Quantity = asset2.quantity;

      // }

      // else {

      //   let asset2Type = AssetType.COIN;
      //   let asset2Id = 0;
      //   let asset2Address = NULL_ADDRESS;
      //   let asset2Quantity = ethers.utils.parseEther(asset2.quantity.toString())

      // }


      // AssetType _assetAtype, address _assetAaddress, uint _assetAID, uint _assetAQuantity,
      // AssetType _assetBtype, address _assetBaddress, uint _assetBID, uint _assetBQuantity,

      // console.log("asset1Type => ", asset1Type);
      // console.log("asset1Address => ", asset1Address);
      // console.log("asset1Id => ", asset1Id);
      // console.log("asset1Quantity => ", asset1Quantity);


      if (asset1.type == AssetType.NFT && asset2.type == AssetType.COIN) {
        setLoading(true);

        try {
          const signer = provider.getSigner();
          const LockBoxContract = new Contract(LockBoxAddress, LockBoxABI, signer) as LockBox;

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
          );

          await tx.wait(1);
          alert("Box is created Successfully");
        }
        catch (e) {
          console.error(e);
        }

        setLoading(false);

      }

      if (asset1.type == AssetType.COIN && asset2.type == AssetType.NFT) {
        setLoading(true);

        try {
          const signer = provider.getSigner();
          const LockBoxContract = new Contract(LockBoxAddress, LockBoxABI, signer) as LockBox;

          const tx = await LockBoxContract.createLockBox(
            asset1.type,
            NULL_ADDRESS,
            1,
            ethers.utils.parseEther(asset1.quantity.toString()),

            asset1.type,
            asset1.address,
            asset1.id,
            1,


            24 * 60 * 60,
          );

          await tx.wait(1);
          alert("Box is created Successfully");
        }
        catch (e) {
          console.error(e);
        }

        setLoading(false);

      }

      if (asset1.type == AssetType.NFT && asset2.type == AssetType.NFT) {
        setLoading(true);

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
          );

          await tx.wait(1);
          alert("Box is created Successfully");
        }
        catch (e) {
          console.error(e);
        }

        setLoading(false);

      }


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
              setAsset1(NULL_ASSET);
              const val = Number(e.target.value);
              switch (val) {
                case 0:
                  setAsset1((e) => ({ ...e, type: AssetType.NFT }));
                  break;
                case 1:
                  setAsset1((e) => ({ ...e, type: AssetType.TOKEN }));
                  break;
                case 2:
                  setAsset1((e) => ({ ...e, type: AssetType.COIN }));
                  break;
                case 3:
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
                case 0:
                  setAsset2((e) => ({ ...e, type: AssetType.NFT }));
                  break;
                case 1:
                  setAsset2((e) => ({ ...e, type: AssetType.TOKEN }));
                  break;
                case 2:
                  setAsset2((e) => ({ ...e, type: AssetType.COIN }));
                  break;
                case 3:
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
            <Button
              type="submit"
              bgColor='blue.200'
              size="sm"
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? loader : <Text>  Create  </Text>}
            </Button>
          </ModalFooter>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CreateModal;
