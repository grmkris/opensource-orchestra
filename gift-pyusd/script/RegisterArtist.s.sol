// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Script} from "forge-std/Script.sol";
import {GiftPYUSD} from "../src/GiftPYUSD.sol";

contract RegisterArtist is Script {
    struct ArtistConfig {
        address wallet;
        string name;
        string image;
    }

    string internal constant ARTISTS_CONFIG_PATH = "./config/artists.json";

    function run() public {
        address giftAddress = vm.envAddress("GIFT_PYUSD");
        address targetWallet = vm.envAddress("ARTIST_WALLET");

        string memory artistsJson = vm.readFile(ARTISTS_CONFIG_PATH);
        ArtistConfig memory selectedArtist;
        bool found;

        for (uint256 i = 0; ; i++) {
            string memory basePath = string.concat(".artists[", vm.toString(i), "]");
            string memory walletKey = string.concat(basePath, ".wallet");

            address currentWallet;
            try vm.parseJsonAddress(artistsJson, walletKey) returns (address parsedWallet) {
                currentWallet = parsedWallet;
            } catch {
                break;
            }

            if (currentWallet == targetWallet) {
                selectedArtist = ArtistConfig({
                    wallet: currentWallet,
                    name: vm.parseJsonString(artistsJson, string.concat(basePath, ".name")),
                    image: vm.parseJsonString(artistsJson, string.concat(basePath, ".image"))
                });
                found = true;
                break;
            }
        }

        if (!found) revert("Artist wallet not found");

        GiftPYUSD gift = GiftPYUSD(giftAddress);

        vm.broadcast();
        gift.registerArtist(selectedArtist.wallet, selectedArtist.name, selectedArtist.image);
    }
}
