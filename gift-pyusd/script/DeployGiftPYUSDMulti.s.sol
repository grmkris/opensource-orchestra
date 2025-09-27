// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Script} from "forge-std/Script.sol";
import {GiftPYUSDMulti} from "../src/GiftPYUSDMulti.sol";

contract DeployGiftPYUSDMulti is Script {
    function run() external pure {
        revert("Use run(uint256) and pass minTotalAmount via CLI");
    }

    // Run with: forge script script/DeployGiftPYUSDMulti.s.sol:DeployGiftPYUSDMulti --sig "run(uint256)" 1000000 ...
    function run(uint256 minTotalAmount) external {
        vm.startBroadcast();
        new GiftPYUSDMulti(minTotalAmount);
        vm.stopBroadcast();
    }
}
