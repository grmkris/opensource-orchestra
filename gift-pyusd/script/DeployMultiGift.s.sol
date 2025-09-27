// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Script} from "forge-std/Script.sol";
import {MultiGiftSBT} from "../src/MultiGiftSBT.sol";

contract DeployMultiGift is Script {
    function run() external {
        vm.startBroadcast();
        new MultiGiftSBT();
        vm.stopBroadcast();
    }
}
