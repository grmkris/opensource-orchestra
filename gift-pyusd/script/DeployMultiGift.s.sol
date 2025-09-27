// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Script} from "forge-std/Script.sol";
import {MultiGiftSBT} from "../src/MultiGiftSBT.sol";

contract DeployMultiGift is Script {
    function run() external pure {
        revert("Use run(uint256) and pass minTotalAmount via CLI");
    }

    // Run with: forge script script/DeployMultiGift.s.sol:DeployMultiGift --sig "run(uint256)" 1000000 ...
    function run(uint256 minTotalAmount) external {
        vm.startBroadcast();
        new MultiGiftSBT(minTotalAmount);
        vm.stopBroadcast();
    }
}
