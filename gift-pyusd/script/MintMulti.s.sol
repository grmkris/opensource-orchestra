// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Script} from "forge-std/Script.sol";
import {ERC20} from "solmate/tokens/ERC20.sol";
import {GiftPYUSD} from "../src/GiftPYUSD.sol";
import {MultiGiftSBT} from "../src/MultiGiftSBT.sol";

/// @notice Splits a total PYUSD donation across multiple artists via GiftPYUSD
///         and mints a single MultiGiftSBT receipt NFT summarizing the gift.
/// @dev    This script uses CLI arguments (no JSON required). Call with:
///         forge script script/MintMulti.s.sol:MintMulti \
///           --sig "run(uint256[],uint256,string)" \
///           "[1,2]" 1000000 "Alice & Bob Gift" \
///           --rpc-url $SEPOLIA_RPC_URL \
///           --private-key $PRIVATE_KEY \
///           --broadcast
contract MintMulti is Script {
    
    function run() external pure {
        revert("Use run(uint256[],uint256,string) with --sig and CLI args");
    }

    function run(uint256[] calldata artistIds, uint256 total, string calldata title) external {
        address giftAddr = vm.envAddress("GIFT_PYUSD");
        address receiptAddr = vm.envAddress("MULTI_GIFT_SBT");
        address pyusdAddr = vm.envAddress("PYUSD");

        require(artistIds.length > 0, "length mismatch or empty");

        GiftPYUSD gift = GiftPYUSD(giftAddr);

        // Pre-validate against GiftPYUSD constraints and artist existence
        for (uint256 i = 0; i < artistIds.length; i++) {
            (,, , bool exists) = gift.artists(artistIds[i]);
            require(exists, "artist not registered");
        }
        require(total >= gift.mintPrice(), "total below mintPrice");

        // Compute equal split amounts from total and artist count
        uint256 n = artistIds.length;
        uint256 share = total / n;
        uint256 rem = total % n;
        uint256[] memory amounts = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            amounts[i] = share + (i < rem ? 1 : 0);
        }

        // Approve + Allocate + Mint under a single broadcast session
        vm.startBroadcast();
        ERC20(pyusdAddr).approve(giftAddr, total);
        gift.allocateDonation(artistIds, amounts);
        MultiGiftSBT(receiptAddr).mint(artistIds, total, title);
        vm.stopBroadcast();
    }
}
