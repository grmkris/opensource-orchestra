// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import {Test} from "forge-std/Test.sol";
import {GiftPYUSDMulti} from "../src/GiftPYUSDMulti.sol";

contract MultiGiftSBTTest is Test {
    uint256 internal constant MIN_TOTAL_AMOUNT = 1e6;

    GiftPYUSDMulti public receipt;

    function setUp() public {
        receipt = new GiftPYUSDMulti(MIN_TOTAL_AMOUNT);
    }

    function testMint_Succeeds_EqualSplitWithRemainder() public {
        address[] memory wallets = new address[](2);
        wallets[0] = address(0xA11CE);
        wallets[1] = address(0xB0B1);
        uint256 total = 1_100_001; // share=550000, rem=1 => [550001, 550000]

        receipt.mint(wallets, total, "Alice & Bob");

        assertEq(receipt.balanceOf(address(this)), 1);
        assertEq(receipt.totalIssued(), 1);

        (address[] memory rWallets, uint256[] memory rAmts, uint256 rTotal, string memory title) = receipt.getGift(1);
        assertEq(rWallets.length, 2);
        assertEq(rAmts.length, 2);
        assertEq(rWallets[0], wallets[0]);
        assertEq(rWallets[1], wallets[1]);
        assertEq(rAmts[0], 550_001);
        assertEq(rAmts[1], 550_000);
        assertEq(rTotal, total);
        assertEq(keccak256(bytes(title)), keccak256(bytes("Alice & Bob")));
    }

    function testMint_RevertIfEmptyArtistIds() public {
        address[] memory ids = new address[](0);
        vm.expectRevert(GiftPYUSDMulti.LENGTH_MISMATCH.selector);
        receipt.mint(ids, MIN_TOTAL_AMOUNT, "Empty");
    }

    function testMint_RevertIfTotalTooLow() public {
        address[] memory ids = new address[](2);
        ids[0] = address(0xA11CE); ids[1] = address(0xB0B1);
        vm.expectRevert(GiftPYUSDMulti.TOTAL_TOO_LOW.selector);
        receipt.mint(ids, MIN_TOTAL_AMOUNT - 1, "Too low");
    }

    function testSBT_DisablesTransfersAndApprovals() public {
        address[] memory wallets = new address[](1);
        wallets[0] = address(0xA11CE);
        receipt.mint(wallets, MIN_TOTAL_AMOUNT, "One");

        vm.expectRevert(GiftPYUSDMulti.TRANSFERS_DISABLED.selector);
        receipt.approve(address(0xBEEF), 1);

        vm.expectRevert(GiftPYUSDMulti.TRANSFERS_DISABLED.selector);
        receipt.setApprovalForAll(address(0xBEEF), true);

        vm.expectRevert(GiftPYUSDMulti.TRANSFERS_DISABLED.selector);
        receipt.transferFrom(address(this), address(0xCAFE), 1);

        vm.expectRevert(GiftPYUSDMulti.TRANSFERS_DISABLED.selector);
        receipt.safeTransferFrom(address(this), address(0xCAFE), 1);

        vm.expectRevert(GiftPYUSDMulti.TRANSFERS_DISABLED.selector);
        receipt.safeTransferFrom(address(this), address(0xCAFE), 1, "");
    }
}
