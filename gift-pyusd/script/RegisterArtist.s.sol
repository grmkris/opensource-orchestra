// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Script} from "forge-std/Script.sol";
import {GiftPYUSD} from "../src/GiftPYUSD.sol";

contract RegisterArtist is Script {
    function run() public {
        address giftAddress = vm.envAddress("GIFT_PYUSD");
        uint256 artistId = vm.envUint("ARTIST_ID");
        address payoutWallet = vm.envAddress("ARTIST_WALLET");
        string memory artistName = vm.envString("ARTIST_NAME");
        string memory artistImage = vm.envString("ARTIST_IMAGE");

        GiftPYUSD gift = GiftPYUSD(giftAddress);

        vm.broadcast();
        gift.registerArtist(artistId, payoutWallet, artistName, artistImage);
    }
}
