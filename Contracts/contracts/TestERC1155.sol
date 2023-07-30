// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract TestERC1155 is ERC1155 {

    constructor() ERC1155("https://game.example/api/item/{id}.json") {
    }

    function mint(uint _id, uint amount) public {
         _mint(msg.sender, _id, amount, "");
    }
}