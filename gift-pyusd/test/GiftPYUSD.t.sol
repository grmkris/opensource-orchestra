// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import {Test, console} from "forge-std/Test.sol";
import {GiftPYUSD} from "../src/GiftPYUSD.sol";
import {MockPYUSD} from "./MockPYUSD.sol";

contract GiftPYUSDTest is Test {
    MockPYUSD public pyusd;
    GiftPYUSD public giftPYUSD;
    uint256 constant MINT_PRICE = 100e6; // PYUSD has 6 decimals

    function setUp() public {
        pyusd = new MockPYUSD();
        giftPYUSD = new GiftPYUSD(address(pyusd), MINT_PRICE);
    }

    function testCreate() public {
        assertNotEq(address(giftPYUSD), address(0));
    }

    function testMint() public {
        // Fund this test contract with PYUSD and approve spender
        pyusd.mint(address(this), MINT_PRICE);
        pyusd.approve(address(giftPYUSD), MINT_PRICE);

        // Mint NFT paying with PYUSD
        giftPYUSD.mint();

        // PYUSD transferred to the NFT contract
        assertEq(pyusd.balanceOf(address(this)), 0);
        assertEq(pyusd.balanceOf(address(giftPYUSD)), MINT_PRICE);

        // NFT state assertions
        assertEq(giftPYUSD.balanceOf(address(this)), 1);
        assertEq(giftPYUSD.totalIssued(), 1);
    }

    function testSBT_ApproveReverts() public {
        // Mint one to self first
        pyusd.mint(address(this), MINT_PRICE);
        pyusd.approve(address(giftPYUSD), MINT_PRICE);
        giftPYUSD.mint();

        // Expect reverts for approvals
        vm.expectRevert(GiftPYUSD.TRANSFERS_DISABLED.selector);
        giftPYUSD.approve(address(0xBEEF), 1);

        vm.expectRevert(GiftPYUSD.TRANSFERS_DISABLED.selector);
        giftPYUSD.setApprovalForAll(address(0xBEEF), true);
    }

    function testSBT_TransfersRevert() public {
        // Mint one to self first
        pyusd.mint(address(this), MINT_PRICE);
        pyusd.approve(address(giftPYUSD), MINT_PRICE);
        giftPYUSD.mint();

        address to = address(0xB0B);

        // transferFrom
        vm.expectRevert(GiftPYUSD.TRANSFERS_DISABLED.selector);
        giftPYUSD.transferFrom(address(this), to, 1);

        // safeTransferFrom (no data)
        vm.expectRevert(GiftPYUSD.TRANSFERS_DISABLED.selector);
        giftPYUSD.safeTransferFrom(address(this), to, 1);

        // safeTransferFrom (with data)
        vm.expectRevert(GiftPYUSD.TRANSFERS_DISABLED.selector);
        giftPYUSD.safeTransferFrom(address(this), to, 1, "");
    }

    function testWithdraw_ByOwner() public {
        // Prepare: mint once to move PYUSD into the contract
        pyusd.mint(address(this), MINT_PRICE);
        pyusd.approve(address(giftPYUSD), MINT_PRICE);
        giftPYUSD.mint();

        // pre-assert: funds are in the contract
        assertEq(pyusd.balanceOf(address(giftPYUSD)), MINT_PRICE);
        assertEq(pyusd.balanceOf(address(this)), 0);

        // withdraw by owner (this test contract is the owner)
        giftPYUSD.withdraw(address(this), MINT_PRICE);

        // post-assert: funds moved back to owner, contract drained
        assertEq(pyusd.balanceOf(address(giftPYUSD)), 0);
        assertEq(pyusd.balanceOf(address(this)), MINT_PRICE);
    }

    function testWithdraw_RevertIfNotOwner() public {
        address attacker = address(0xBEEF);

        // Move funds into the contract first
        pyusd.mint(address(this), MINT_PRICE);
        pyusd.approve(address(giftPYUSD), MINT_PRICE);
        giftPYUSD.mint();
        assertEq(pyusd.balanceOf(address(giftPYUSD)), MINT_PRICE);

        // Expect revert when non-owner tries to withdraw
        vm.prank(attacker);
        vm.expectRevert(bytes("NOT_OWNER"));
        giftPYUSD.withdraw(attacker, MINT_PRICE);
    }
}
