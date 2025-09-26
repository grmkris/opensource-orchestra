// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {HelloPYUSD} from "../src/HelloPYUSD.sol";
import {MockPYUSD} from "./MockPYUSD.sol";

contract HelloPYUSDTest is Test {
    MockPYUSD public pyusd;
    HelloPYUSD public helloPYUSD;
    uint256 constant MINT_PRICE = 100e6; // PYUSD has 6 decimals

    function setUp() public {
        pyusd = new MockPYUSD();
        helloPYUSD = new HelloPYUSD(address(pyusd), MINT_PRICE);
    }

    function testCreate() public {
        assertNotEq(address(helloPYUSD), address(0));
    }

    function testMint() public {
        // Fund this test contract with PYUSD and approve spender
        pyusd.mint(address(this), MINT_PRICE);
        pyusd.approve(address(helloPYUSD), MINT_PRICE);

        // Mint NFT paying with PYUSD
        helloPYUSD.mint();

        // PYUSD transferred to the NFT contract
        assertEq(pyusd.balanceOf(address(this)), 0);
        assertEq(pyusd.balanceOf(address(helloPYUSD)), MINT_PRICE);

        // NFT state assertions
        assertEq(helloPYUSD.balanceOf(address(this)), 1);
        assertEq(helloPYUSD.totalIssued(), 1);
    }

    function testWithdraw_ByOwner() public {
        // Prepare: mint once to move PYUSD into the contract
        pyusd.mint(address(this), MINT_PRICE);
        pyusd.approve(address(helloPYUSD), MINT_PRICE);
        helloPYUSD.mint();

        // pre-assert: funds are in the contract
        assertEq(pyusd.balanceOf(address(helloPYUSD)), MINT_PRICE);
        assertEq(pyusd.balanceOf(address(this)), 0);

        // withdraw by owner (this test contract is the owner)
        helloPYUSD.withdraw(address(this), MINT_PRICE);

        // post-assert: funds moved back to owner, contract drained
        assertEq(pyusd.balanceOf(address(helloPYUSD)), 0);
        assertEq(pyusd.balanceOf(address(this)), MINT_PRICE);
    }

    function testWithdraw_RevertIfNotOwner() public {
        address attacker = address(0xBEEF);

        // Move funds into the contract first
        pyusd.mint(address(this), MINT_PRICE);
        pyusd.approve(address(helloPYUSD), MINT_PRICE);
        helloPYUSD.mint();
        assertEq(pyusd.balanceOf(address(helloPYUSD)), MINT_PRICE);

        // Expect revert when non-owner tries to withdraw
        vm.prank(attacker);
        vm.expectRevert(bytes("NOT_OWNER"));
        helloPYUSD.withdraw(attacker, MINT_PRICE);
    }
}
