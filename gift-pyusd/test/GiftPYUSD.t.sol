// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import {Test, console} from "forge-std/Test.sol";
import {GiftPYUSD} from "../src/GiftPYUSD.sol";
import {MockPYUSD} from "./MockPYUSD.sol";

contract GiftPYUSDTest is Test {
    MockPYUSD public pyusd;
    GiftPYUSD public giftPYUSD;
    uint256 constant MIN_GIFT_AMOUNT = 100e6; // PYUSD has 6 decimals
    address constant ARTIST_WALLET = address(0xA11CE);
    string constant ARTIST_NAME = "Alice";
    string constant ARTIST_IMAGE = "https://example.com/alice.png";
    address constant ANOTHER_ARTIST_WALLET = address(0xB0B1);
    string constant ANOTHER_ARTIST_NAME = "Bob";
    string constant ANOTHER_ARTIST_IMAGE = "https://example.com/bob.png";

    function setUp() public {
        pyusd = new MockPYUSD();
        giftPYUSD = new GiftPYUSD(address(pyusd), MIN_GIFT_AMOUNT);

        giftPYUSD.registerArtist(ARTIST_WALLET, ARTIST_NAME, ARTIST_IMAGE);
    }

    function testCreate() public {
        assertNotEq(address(giftPYUSD), address(0));
    }

    function testRegisterArtist_Succeeds() public {
        giftPYUSD.registerArtist(ANOTHER_ARTIST_WALLET, ANOTHER_ARTIST_NAME, ANOTHER_ARTIST_IMAGE);

        (address payoutWallet, string memory name, string memory imageURI, bool exists) = giftPYUSD.artists(ANOTHER_ARTIST_WALLET);

        assertEq(payoutWallet, ANOTHER_ARTIST_WALLET);
        assertEq(name, ANOTHER_ARTIST_NAME);
        assertEq(imageURI, ANOTHER_ARTIST_IMAGE);
        assertTrue(exists);
    }

    function testRegisterArtist_RevertIfDuplicate() public {
        vm.expectRevert(GiftPYUSD.ARTIST_EXISTS.selector);
        giftPYUSD.registerArtist(ARTIST_WALLET, ARTIST_NAME, ARTIST_IMAGE);
    }

    function testRegisterArtist_RevertIfInvalidWallet() public {
        vm.expectRevert(GiftPYUSD.INVALID_WALLET.selector);
        giftPYUSD.registerArtist(address(0), ANOTHER_ARTIST_NAME, ANOTHER_ARTIST_IMAGE);
    }

    function testRegisterArtist_AllowsNonOwner() public {
        vm.prank(address(0xBEEF));
        giftPYUSD.registerArtist(ANOTHER_ARTIST_WALLET, ANOTHER_ARTIST_NAME, ANOTHER_ARTIST_IMAGE);

        (address payoutWallet, string memory name, string memory imageURI, bool exists) = giftPYUSD.artists(ANOTHER_ARTIST_WALLET);

        assertEq(payoutWallet, ANOTHER_ARTIST_WALLET);
        assertEq(name, ANOTHER_ARTIST_NAME);
        assertEq(imageURI, ANOTHER_ARTIST_IMAGE);
        assertTrue(exists);
    }

    function testUpdateArtist_Succeeds() public {
        string memory newName = "Alice Deluxe";
        string memory newImage = "https://example.com/alice-deluxe.png";

        vm.prank(ARTIST_WALLET);
        giftPYUSD.updateArtist(ARTIST_WALLET, newName, newImage);

        (address payoutWallet, string memory name, string memory imageURI, bool exists) = giftPYUSD.artists(ARTIST_WALLET);

        assertEq(payoutWallet, ARTIST_WALLET); // wallet key unchanged
        assertEq(name, newName);
        assertEq(imageURI, newImage);
        assertTrue(exists);
    }

    function testUpdateArtist_RevertIfNotFound() public {
        vm.expectRevert(GiftPYUSD.ARTIST_NOT_FOUND.selector);
        giftPYUSD.updateArtist(address(0xDEAD), ARTIST_NAME, ARTIST_IMAGE);
    }

    function testUpdateArtist_RevertIfUnauthorized() public {
        vm.prank(address(0xBEEF));
        vm.expectRevert(GiftPYUSD.UNAUTHORIZED.selector);
        giftPYUSD.updateArtist(ARTIST_WALLET, ARTIST_NAME, ARTIST_IMAGE);
    }

    function testMintWithMinimumGift() public {
        // Fund this test contract with PYUSD and approve spender
        pyusd.mint(address(this), MIN_GIFT_AMOUNT);
        pyusd.approve(address(giftPYUSD), MIN_GIFT_AMOUNT);

        // Mint NFT paying the minimum donation with PYUSD
        giftPYUSD.mint(ARTIST_WALLET, MIN_GIFT_AMOUNT);

        // PYUSD transferred to the NFT contract
        assertEq(pyusd.balanceOf(address(this)), 0);
        assertEq(pyusd.balanceOf(address(giftPYUSD)), MIN_GIFT_AMOUNT);

        // NFT and artist state assertions
        assertEq(giftPYUSD.balanceOf(address(this)), 1);
        assertEq(giftPYUSD.totalIssued(), 1);
        assertEq(giftPYUSD.tokenArtist(1), ARTIST_WALLET);
        assertEq(giftPYUSD.artistBalance(ARTIST_WALLET), MIN_GIFT_AMOUNT);
    }

    function testMintWithHigherGift() public {
        uint256 higherDonation = MIN_GIFT_AMOUNT * 2;

        pyusd.mint(address(this), higherDonation);
        pyusd.approve(address(giftPYUSD), higherDonation);

        giftPYUSD.mint(ARTIST_WALLET, higherDonation);

        assertEq(pyusd.balanceOf(address(this)), 0);
        assertEq(pyusd.balanceOf(address(giftPYUSD)), higherDonation);
        assertEq(giftPYUSD.tokenArtist(1), ARTIST_WALLET);
        assertEq(giftPYUSD.artistBalance(ARTIST_WALLET), higherDonation);
        assertEq(giftPYUSD.balanceOf(address(this)), 1);
    }

    function testMint_RevertIfGiftTooLow() public {
        uint256 insufficientDonation = MIN_GIFT_AMOUNT - 1;

        pyusd.mint(address(this), MIN_GIFT_AMOUNT);
        pyusd.approve(address(giftPYUSD), MIN_GIFT_AMOUNT);

        vm.expectRevert(GiftPYUSD.GIFT_TOO_LOW.selector);
        giftPYUSD.mint(ARTIST_WALLET, insufficientDonation);
    }

    function testMint_RevertIfArtistMissing() public {
        pyusd.mint(address(this), MIN_GIFT_AMOUNT);
        pyusd.approve(address(giftPYUSD), MIN_GIFT_AMOUNT);

        vm.expectRevert(GiftPYUSD.ARTIST_NOT_FOUND.selector);
        giftPYUSD.mint(address(0xDEAD), MIN_GIFT_AMOUNT);
    }

    function testAllocateGift_Succeeds() public {
        giftPYUSD.registerArtist(ANOTHER_ARTIST_WALLET, ANOTHER_ARTIST_NAME, ANOTHER_ARTIST_IMAGE);

        address[] memory wallets = new address[](2);
        wallets[0] = ARTIST_WALLET;
        wallets[1] = ANOTHER_ARTIST_WALLET;
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = MIN_GIFT_AMOUNT;
        amounts[1] = MIN_GIFT_AMOUNT * 2;

        uint256 total = amounts[0] + amounts[1];
        pyusd.mint(address(this), total);
        pyusd.approve(address(giftPYUSD), total);

        vm.expectEmit(true, false, false, true, address(giftPYUSD));
        emit GiftPYUSD.GiftAllocated(address(this), total, wallets, amounts);
        giftPYUSD.allocateGift(wallets, amounts);

        assertEq(pyusd.balanceOf(address(giftPYUSD)), total);
        assertEq(giftPYUSD.artistBalance(ARTIST_WALLET), amounts[0]);
        assertEq(giftPYUSD.artistBalance(ANOTHER_ARTIST_WALLET), amounts[1]);
    }

    function testAllocateGift_RevertIfLengthMismatch() public {
        giftPYUSD.registerArtist(ANOTHER_ARTIST_WALLET, ANOTHER_ARTIST_NAME, ANOTHER_ARTIST_IMAGE);

        address[] memory wallets = new address[](1);
        wallets[0] = ARTIST_WALLET;
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = MIN_GIFT_AMOUNT;
        amounts[1] = MIN_GIFT_AMOUNT;

        vm.expectRevert(GiftPYUSD.LENGTH_MISMATCH.selector);
        giftPYUSD.allocateGift(wallets, amounts);
    }

    function testAllocateGift_RevertIfEmpty() public {
        address[] memory wallets = new address[](0);
        uint256[] memory amounts = new uint256[](0);

        vm.expectRevert(GiftPYUSD.EMPTY_GIFT.selector);
        giftPYUSD.allocateGift(wallets, amounts);
    }

    function testAllocateGift_RevertIfArtistMissing() public {
        address[] memory wallets = new address[](1);
        wallets[0] = address(0xDEAD);
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = MIN_GIFT_AMOUNT;

        vm.expectRevert(GiftPYUSD.ARTIST_NOT_FOUND.selector);
        giftPYUSD.allocateGift(wallets, amounts);
    }

    function testAllocateGift_AllowsGiftBelowMinGiftAmount() public {
        address[] memory wallets = new address[](1);
        wallets[0] = ARTIST_WALLET;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = MIN_GIFT_AMOUNT - 1;

        uint256 total = amounts[0];
        pyusd.mint(address(this), total);
        pyusd.approve(address(giftPYUSD), total);

        giftPYUSD.allocateGift(wallets, amounts);

        assertEq(pyusd.balanceOf(address(giftPYUSD)), total);
        assertEq(giftPYUSD.artistBalance(ARTIST_WALLET), total);
    }

    function testSBT_ApproveReverts() public {
        // Mint one to self first
        pyusd.mint(address(this), MIN_GIFT_AMOUNT);
        pyusd.approve(address(giftPYUSD), MIN_GIFT_AMOUNT);
        giftPYUSD.mint(ARTIST_WALLET, MIN_GIFT_AMOUNT);

        // Expect reverts for approvals
        vm.expectRevert(GiftPYUSD.TRANSFERS_DISABLED.selector);
        giftPYUSD.approve(address(0xBEEF), 1);

        vm.expectRevert(GiftPYUSD.TRANSFERS_DISABLED.selector);
        giftPYUSD.setApprovalForAll(address(0xBEEF), true);
    }

    function testSBT_TransfersRevert() public {
        // Mint one to self first
        pyusd.mint(address(this), MIN_GIFT_AMOUNT);
        pyusd.approve(address(giftPYUSD), MIN_GIFT_AMOUNT);
        giftPYUSD.mint(ARTIST_WALLET, MIN_GIFT_AMOUNT);

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
        pyusd.mint(address(this), MIN_GIFT_AMOUNT);
        pyusd.approve(address(giftPYUSD), MIN_GIFT_AMOUNT);
        giftPYUSD.mint(ARTIST_WALLET, MIN_GIFT_AMOUNT);

        // pre-assert: funds are in the contract and artist balance tracked
        assertEq(pyusd.balanceOf(address(giftPYUSD)), MIN_GIFT_AMOUNT);
        assertEq(giftPYUSD.artistBalance(ARTIST_WALLET), MIN_GIFT_AMOUNT);

        // withdraw by the artist payout wallet
        vm.prank(ARTIST_WALLET);
        giftPYUSD.withdrawForArtist(ARTIST_WALLET, MIN_GIFT_AMOUNT);

        // post-assert: funds moved to artist wallet, balances updated
        assertEq(pyusd.balanceOf(address(giftPYUSD)), 0);
        assertEq(pyusd.balanceOf(ARTIST_WALLET), MIN_GIFT_AMOUNT);
        assertEq(giftPYUSD.artistBalance(ARTIST_WALLET), 0);
    }

    function testWithdrawForArtist_RevertIfUnauthorized() public {
        pyusd.mint(address(this), MIN_GIFT_AMOUNT);
        pyusd.approve(address(giftPYUSD), MIN_GIFT_AMOUNT);
        giftPYUSD.mint(ARTIST_WALLET, MIN_GIFT_AMOUNT);

        vm.expectRevert(GiftPYUSD.UNAUTHORIZED.selector);
        giftPYUSD.withdrawForArtist(ARTIST_WALLET, MIN_GIFT_AMOUNT);
    }

    function testWithdrawForArtist_RevertIfInsufficientBalance() public {
        pyusd.mint(address(this), MIN_GIFT_AMOUNT);
        pyusd.approve(address(giftPYUSD), MIN_GIFT_AMOUNT);
        giftPYUSD.mint(ARTIST_WALLET, MIN_GIFT_AMOUNT);

        vm.prank(ARTIST_WALLET);
        vm.expectRevert(GiftPYUSD.INSUFFICIENT_BALANCE.selector);
        giftPYUSD.withdrawForArtist(ARTIST_WALLET, MIN_GIFT_AMOUNT + 1);
    }
}
