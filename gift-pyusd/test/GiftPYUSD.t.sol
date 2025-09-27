// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import {Test, console} from "forge-std/Test.sol";
import {GiftPYUSD} from "../src/GiftPYUSD.sol";
import {MockPYUSD} from "./MockPYUSD.sol";

contract GiftPYUSDTest is Test {
    MockPYUSD public pyusd;
    GiftPYUSD public giftPYUSD;
    uint256 constant MINT_PRICE = 100e6; // PYUSD has 6 decimals
    uint256 constant ARTIST_ID = 1;
    address constant ARTIST_WALLET = address(0xA11CE);
    string constant ARTIST_NAME = "Alice";
    string constant ARTIST_IMAGE = "https://example.com/alice.png";
    uint256 constant ANOTHER_ARTIST_ID = 2;
    address constant ANOTHER_ARTIST_WALLET = address(0xB0B1);
    string constant ANOTHER_ARTIST_NAME = "Bob";
    string constant ANOTHER_ARTIST_IMAGE = "https://example.com/bob.png";

    function setUp() public {
        pyusd = new MockPYUSD();
        giftPYUSD = new GiftPYUSD(address(pyusd), MINT_PRICE);

        giftPYUSD.registerArtist(ARTIST_ID, ARTIST_WALLET, ARTIST_NAME, ARTIST_IMAGE);
    }

    function testCreate() public {
        assertNotEq(address(giftPYUSD), address(0));
    }

    function testRegisterArtist_Succeeds() public {
        giftPYUSD.registerArtist(ANOTHER_ARTIST_ID, ANOTHER_ARTIST_WALLET, ANOTHER_ARTIST_NAME, ANOTHER_ARTIST_IMAGE);

        (address payoutWallet, string memory name, string memory imageURI, bool exists) = giftPYUSD.artists(ANOTHER_ARTIST_ID);

        assertEq(payoutWallet, ANOTHER_ARTIST_WALLET);
        assertEq(name, ANOTHER_ARTIST_NAME);
        assertEq(imageURI, ANOTHER_ARTIST_IMAGE);
        assertTrue(exists);
    }

    function testRegisterArtist_RevertIfDuplicate() public {
        vm.expectRevert(GiftPYUSD.ARTIST_EXISTS.selector);
        giftPYUSD.registerArtist(ARTIST_ID, ARTIST_WALLET, ARTIST_NAME, ARTIST_IMAGE);
    }

    function testRegisterArtist_RevertIfInvalidWallet() public {
        vm.expectRevert(GiftPYUSD.INVALID_WALLET.selector);
        giftPYUSD.registerArtist(ANOTHER_ARTIST_ID, address(0), ANOTHER_ARTIST_NAME, ANOTHER_ARTIST_IMAGE);
    }

    function testRegisterArtist_RevertIfNotOwner() public {
        vm.prank(address(0xBEEF));
        vm.expectRevert(GiftPYUSD.NOT_OWNER.selector);
        giftPYUSD.registerArtist(ANOTHER_ARTIST_ID, ANOTHER_ARTIST_WALLET, ANOTHER_ARTIST_NAME, ANOTHER_ARTIST_IMAGE);
    }

    function testUpdateArtist_Succeeds() public {
        address newWallet = address(0xA11CF);
        string memory newName = "Alice Deluxe";
        string memory newImage = "https://example.com/alice-deluxe.png";

        giftPYUSD.updateArtist(ARTIST_ID, newWallet, newName, newImage);

        (address payoutWallet, string memory name, string memory imageURI, bool exists) = giftPYUSD.artists(ARTIST_ID);

        assertEq(payoutWallet, newWallet);
        assertEq(name, newName);
        assertEq(imageURI, newImage);
        assertTrue(exists);
    }

    function testUpdateArtist_RevertIfNotFound() public {
        vm.expectRevert(GiftPYUSD.ARTIST_NOT_FOUND.selector);
        giftPYUSD.updateArtist(999, ARTIST_WALLET, ARTIST_NAME, ARTIST_IMAGE);
    }

    function testUpdateArtist_RevertIfNotOwner() public {
        vm.prank(address(0xBEEF));
        vm.expectRevert(GiftPYUSD.NOT_OWNER.selector);
        giftPYUSD.updateArtist(ARTIST_ID, ARTIST_WALLET, ARTIST_NAME, ARTIST_IMAGE);
    }

    function testMintWithMinimumDonation() public {
        // Fund this test contract with PYUSD and approve spender
        pyusd.mint(address(this), MINT_PRICE);
        pyusd.approve(address(giftPYUSD), MINT_PRICE);

        // Mint NFT paying the minimum donation with PYUSD
        giftPYUSD.mint(ARTIST_ID, MINT_PRICE);

        // PYUSD transferred to the NFT contract
        assertEq(pyusd.balanceOf(address(this)), 0);
        assertEq(pyusd.balanceOf(address(giftPYUSD)), MINT_PRICE);

        // NFT and artist state assertions
        assertEq(giftPYUSD.balanceOf(address(this)), 1);
        assertEq(giftPYUSD.totalIssued(), 1);
        assertEq(giftPYUSD.tokenArtist(1), ARTIST_ID);
        assertEq(giftPYUSD.artistBalance(ARTIST_ID), MINT_PRICE);
    }

    function testMintWithHigherDonation() public {
        uint256 higherDonation = MINT_PRICE * 2;

        pyusd.mint(address(this), higherDonation);
        pyusd.approve(address(giftPYUSD), higherDonation);

        giftPYUSD.mint(ARTIST_ID, higherDonation);

        assertEq(pyusd.balanceOf(address(this)), 0);
        assertEq(pyusd.balanceOf(address(giftPYUSD)), higherDonation);
        assertEq(giftPYUSD.tokenArtist(1), ARTIST_ID);
        assertEq(giftPYUSD.artistBalance(ARTIST_ID), higherDonation);
        assertEq(giftPYUSD.balanceOf(address(this)), 1);
    }

    function testMint_RevertIfDonationTooLow() public {
        uint256 insufficientDonation = MINT_PRICE - 1;

        pyusd.mint(address(this), MINT_PRICE);
        pyusd.approve(address(giftPYUSD), MINT_PRICE);

        vm.expectRevert(GiftPYUSD.DONATION_TOO_LOW.selector);
        giftPYUSD.mint(ARTIST_ID, insufficientDonation);
    }

    function testMint_RevertIfArtistMissing() public {
        pyusd.mint(address(this), MINT_PRICE);
        pyusd.approve(address(giftPYUSD), MINT_PRICE);

        vm.expectRevert(GiftPYUSD.ARTIST_NOT_FOUND.selector);
        giftPYUSD.mint(999, MINT_PRICE);
    }

    function testSBT_ApproveReverts() public {
        // Mint one to self first
        pyusd.mint(address(this), MINT_PRICE);
        pyusd.approve(address(giftPYUSD), MINT_PRICE);
        giftPYUSD.mint(ARTIST_ID, MINT_PRICE);

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
        giftPYUSD.mint(ARTIST_ID, MINT_PRICE);

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

    function testWithdrawForArtist_Succeeds() public {
        // Prepare: mint once to move PYUSD into the contract and credit the artist
        pyusd.mint(address(this), MINT_PRICE);
        pyusd.approve(address(giftPYUSD), MINT_PRICE);
        giftPYUSD.mint(ARTIST_ID, MINT_PRICE);

        // pre-assert: funds are in the contract and artist balance tracked
        assertEq(pyusd.balanceOf(address(giftPYUSD)), MINT_PRICE);
        assertEq(giftPYUSD.artistBalance(ARTIST_ID), MINT_PRICE);

        // withdraw by the artist payout wallet
        vm.prank(ARTIST_WALLET);
        giftPYUSD.withdrawForArtist(ARTIST_ID, MINT_PRICE);

        // post-assert: funds moved to artist wallet, balances updated
        assertEq(pyusd.balanceOf(address(giftPYUSD)), 0);
        assertEq(pyusd.balanceOf(ARTIST_WALLET), MINT_PRICE);
        assertEq(giftPYUSD.artistBalance(ARTIST_ID), 0);
    }

    function testWithdrawForArtist_RevertIfUnauthorized() public {
        pyusd.mint(address(this), MINT_PRICE);
        pyusd.approve(address(giftPYUSD), MINT_PRICE);
        giftPYUSD.mint(ARTIST_ID, MINT_PRICE);

        vm.expectRevert(GiftPYUSD.UNAUTHORIZED.selector);
        giftPYUSD.withdrawForArtist(ARTIST_ID, MINT_PRICE);
    }

    function testWithdrawForArtist_RevertIfInsufficientBalance() public {
        pyusd.mint(address(this), MINT_PRICE);
        pyusd.approve(address(giftPYUSD), MINT_PRICE);
        giftPYUSD.mint(ARTIST_ID, MINT_PRICE);

        vm.prank(ARTIST_WALLET);
        vm.expectRevert(GiftPYUSD.INSUFFICIENT_BALANCE.selector);
        giftPYUSD.withdrawForArtist(ARTIST_ID, MINT_PRICE + 1);
    }
}
