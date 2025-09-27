// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Script} from "forge-std/Script.sol";
import {stdJson} from "forge-std/StdJson.sol";
import {ERC20} from "solmate/tokens/ERC20.sol";
import {GiftPYUSD} from "../src/GiftPYUSD.sol";
import {MultiGiftSBT} from "../src/MultiGiftSBT.sol";

/// @notice A script that splits a total PYUSD donation across multiple artists via GiftPYUSD
///         and mints a single MultiGiftSBT receipt NFT summarizing the gift.
/// @dev    Expects a JSON config file with fields:
///         {
///           "artistIds": [1,2,3],
///           "amounts": [500000, 500000, 1000000],
///           "title": "Alice & Bob & Charlie"
///         }
contract MintMulti is Script {
    using stdJson for string;

    string internal constant CONFIG_ENV = "MULTI_GIFT_CONFIG"; // path like ./config/multi_gift.json

    function run() external {
        address giftAddr = vm.envAddress("GIFT_PYUSD");
        address receiptAddr = vm.envAddress("MULTI_GIFT_SBT");
        address pyusdAddr = vm.envAddress("PYUSD");
        string memory configPath = vm.envString(CONFIG_ENV);

        string memory raw = vm.readFile(configPath);
        uint256[] memory artistIds = raw.readUintArray(".artistIds");
        uint256[] memory amounts = raw.readUintArray(".amounts");
        string memory title = raw.readString(".title");

        require(artistIds.length == amounts.length && artistIds.length > 0, "length mismatch or empty");

        GiftPYUSD gift = GiftPYUSD(giftAddr);
        MultiGiftSBT receipt = MultiGiftSBT(receiptAddr);
        ERC20 pyusd = ERC20(pyusdAddr);

        // Pre-validate against GiftPYUSD constraints
        uint256 mintPrice = gift.mintPrice();
        uint256 total;
        for (uint256 i = 0; i < amounts.length; i++) {
            // Artist must exist
            (,, , bool exists) = gift.artists(artistIds[i]);
            require(exists, "artist not registered");
            // Each split must meet minimum mint price
            require(amounts[i] >= mintPrice, "amount below mintPrice");
            total += amounts[i];
        }

        // Approve GiftPYUSD to pull the total PYUSD from the broadcaster EOA
        vm.broadcast();
        pyusd.approve(giftAddr, total);

        // Allocate the donation (owner-only call)
        vm.broadcast();
        gift.allocateDonation(artistIds, amounts);

        // Mint the single receipt NFT capturing the whole split
        vm.broadcast();
        receipt.mint(artistIds, amounts, total, title);
    }
}
