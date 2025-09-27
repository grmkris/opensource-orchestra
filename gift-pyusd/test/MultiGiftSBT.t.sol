// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import {Test} from "forge-std/Test.sol";
import {MultiGiftSBT} from "../src/MultiGiftSBT.sol";

contract MultiGiftSBTTest is Test {
    MultiGiftSBT public receipt;

    function setUp() public {
        receipt = new MultiGiftSBT();
    }

    function testMint_Succeeds() public {
        uint256[] memory ids = new uint256[](2);
        ids[0] = 1; ids[1] = 2;
        uint256[] memory amts = new uint256[](2);
        amts[0] = 100; amts[1] = 200;

        receipt.mint(ids, amts, 300, "Alice & Bob");

        assertEq(receipt.balanceOf(address(this)), 1);
        assertEq(receipt.totalIssued(), 1);

        (uint256[] memory rIds, uint256[] memory rAmts, uint256 total, string memory title) = receipt.getGift(1);
        assertEq(rIds.length, 2);
        assertEq(rAmts.length, 2);
        assertEq(rIds[0], 1);
        assertEq(rIds[1], 2);
        assertEq(rAmts[0], 100);
        assertEq(rAmts[1], 200);
        assertEq(total, 300);
        assertEq(keccak256(bytes(title)), keccak256(bytes("Alice & Bob")));
    }

    function testMint_RevertIfLengthMismatch() public {
        uint256[] memory ids = new uint256[](2);
        ids[0] = 1; ids[1] = 2;
        uint256[] memory amts = new uint256[](1);
        amts[0] = 100;

        vm.expectRevert(MultiGiftSBT.LENGTH_MISMATCH.selector);
        receipt.mint(ids, amts, 100, "Mismatch");
    }

    function testMint_RevertIfInvalidSum() public {
        uint256[] memory ids = new uint256[](2);
        ids[0] = 1; ids[1] = 2;
        uint256[] memory amts = new uint256[](2);
        amts[0] = 100; amts[1] = 200;

        vm.expectRevert(MultiGiftSBT.INVALID_SUM.selector);
        receipt.mint(ids, amts, 999, "Bad sum");
    }

    function testSBT_DisablesTransfersAndApprovals() public {
        uint256[] memory ids = new uint256[](1);
        ids[0] = 1;
        uint256[] memory amts = new uint256[](1);
        amts[0] = 100;
        receipt.mint(ids, amts, 100, "One");

        vm.expectRevert(MultiGiftSBT.TRANSFERS_DISABLED.selector);
        receipt.approve(address(0xBEEF), 1);

        vm.expectRevert(MultiGiftSBT.TRANSFERS_DISABLED.selector);
        receipt.setApprovalForAll(address(0xBEEF), true);

        vm.expectRevert(MultiGiftSBT.TRANSFERS_DISABLED.selector);
        receipt.transferFrom(address(this), address(0xCAFE), 1);

        vm.expectRevert(MultiGiftSBT.TRANSFERS_DISABLED.selector);
        receipt.safeTransferFrom(address(this), address(0xCAFE), 1);

        vm.expectRevert(MultiGiftSBT.TRANSFERS_DISABLED.selector);
        receipt.safeTransferFrom(address(this), address(0xCAFE), 1, "");
    }
}
