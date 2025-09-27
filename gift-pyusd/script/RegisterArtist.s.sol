// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Script} from "forge-std/Script.sol";
import {GiftPYUSD} from "../src/GiftPYUSD.sol";

contract RegisterArtist is Script {
    struct ArtistConfig {
        uint256 artistId;
        address wallet;
        string name;
        string image;
    }

    string internal constant ARTISTS_CONFIG_PATH = "./config/artists.json";

    function run() public {
        address giftAddress = vm.envAddress("GIFT_PYUSD");
        uint256 targetArtistId = vm.envUint("ARTIST_ID");

        string memory artistsJson = vm.readFile(ARTISTS_CONFIG_PATH);
        ArtistConfig memory selectedArtist;
        bool found;

        for (uint256 i = 0; ; i++) {
            string memory basePath = string.concat(".artists[", vm.toString(i), "]");
            string memory artistIdKey = string.concat(basePath, ".artistId");

            uint256 currentArtistId;
            try vm.parseJsonUint(artistsJson, artistIdKey) returns (uint256 parsedId) {
                currentArtistId = parsedId;
            } catch {
                break;
            }

            if (currentArtistId == targetArtistId) {
                selectedArtist = ArtistConfig({
                    artistId: currentArtistId,
                    wallet: vm.parseJsonAddress(artistsJson, string.concat(basePath, ".wallet")),
                    name: vm.parseJsonString(artistsJson, string.concat(basePath, ".name")),
                    image: vm.parseJsonString(artistsJson, string.concat(basePath, ".image"))
                });
                found = true;
                break;
            }
        }

        if (!found) {
            revert("Artist ID not found");
        }

        GiftPYUSD gift = GiftPYUSD(giftAddress);

        vm.broadcast();
        gift.registerArtist(selectedArtist.artistId, selectedArtist.wallet, selectedArtist.name, selectedArtist.image);
    }
}
