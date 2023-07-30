// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

contract TestToken is ERC20PresetMinterPauser {
    constructor()
    ERC20PresetMinterPauser("TestToken", "TT"){}

    function mint(address to) public {
        uint amount = 100 ether;
        _mint(to, amount);
    }

}
