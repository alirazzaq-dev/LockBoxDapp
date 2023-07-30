// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestNFT is ERC721 {

    uint256 public counter;

    constructor()
    ERC721("TestNFT", "TNFT"){}

    function mint(address to) public {
        uint tokenId = ++counter;
        _mint(to, tokenId);
    }   

}