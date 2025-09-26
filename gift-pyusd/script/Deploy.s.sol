// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Script} from "forge-std/Script.sol";
import {GiftPYUSD} from "../src/GiftPYUSD.sol";

contract Deploy is Script {
    // 1e6 = 1.000000 PYUSD (6 decimals)
    uint256 public constant MINT_PRICE = 1e6;

    function run() public {
        // Read PYUSD token address from env var
        address pyusd = vm.envAddress("PYUSD");

        // Start broadcasting transactions using default private key from env
        vm.broadcast();

        // Deploy the contract
        new GiftPYUSD(pyusd, MINT_PRICE);
    }
}
