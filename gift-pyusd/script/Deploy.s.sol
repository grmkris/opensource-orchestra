// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Script} from "forge-std/Script.sol";
import {GiftPYUSD} from "../src/GiftPYUSD.sol";

contract Deploy is Script {
    function run() public pure {
        revert("Use run(uint256) or run(address,uint256)");
    }

    // Run with: forge script script/Deploy.s.sol:Deploy --sig "run(uint256)" 1000000 ...
    function run(uint256 minGiftAmount) external {
        // Read PYUSD token address from env var
        address pyusd = vm.envAddress("PYUSD");

        vm.startBroadcast();
        new GiftPYUSD(pyusd, minGiftAmount);
        vm.stopBroadcast();
    }

    // Run with: forge script script/Deploy.s.sol:Deploy --sig "run(address,uint256)" 0xPyUsd... 1000000 ...
    function run(address pyusd, uint256 minGiftAmount) external {
        vm.startBroadcast();
        new GiftPYUSD(pyusd, minGiftAmount);
        vm.stopBroadcast();
    }
}
