// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {ERC20} from "solmate/tokens/ERC20.sol";

contract MockPYUSD is ERC20 {
    constructor() ERC20("MockPYUSD", "mockPYUSD", 6) {}

    function mint(address to, uint256 value) public virtual {
        _mint(to, value);
    }
}
