// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {ERC721} from "solmate/tokens/ERC721.sol";
import {ERC20} from "solmate/tokens/ERC20.sol";
import {SafeTransferLib} from "solmate/utils/SafeTransferLib.sol";

contract GiftPYUSD is ERC721 {
    uint256 public totalIssued;
    ERC20 public immutable mintToken;
    uint256 public immutable minGiftAmount;
    address public immutable owner;

    struct Artist {
        address payoutWallet;
        string name;
        string imageURI;
        bool exists;
    }

    mapping(address => Artist) public artists; // wallet-keyed
    mapping(uint256 => address) public tokenArtist; // tokenId => artist wallet
    mapping(address => uint256) public artistBalances; // wallet-keyed balance
    mapping(uint256 => uint256) public tokenAmounts;

    // SBT: disable all transfers/approvals
    error TRANSFERS_DISABLED();
    error NOT_OWNER();
    error ARTIST_EXISTS();
    error ARTIST_NOT_FOUND();
    error INVALID_WALLET();
    error UNAUTHORIZED();
    error INSUFFICIENT_BALANCE();
    error GIFT_TOO_LOW();
    error EMPTY_GIFT();
    error LENGTH_MISMATCH();

    event ArtistRegistered(address indexed wallet, string name, string imageURI);
    event ArtistUpdated(address indexed wallet, string name, string imageURI);
    event GiftMinted(uint256 indexed tokenId, address indexed giver, address indexed wallet, uint256 amount);
    event ArtistWithdrawn(address indexed wallet, address indexed payoutWallet, uint256 amount);
    event GiftAllocated(address indexed donor, uint256 totalAmount, address[] wallets, uint256[] amounts);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NOT_OWNER();
        _;
    }

    constructor(address _mintToken, uint256 _minGiftAmount) ERC721("GiftPYUSD", "GIPY") {
        mintToken = ERC20(_mintToken);
        minGiftAmount = _minGiftAmount;
        owner = msg.sender;
    }

    function registerArtist(address wallet, string calldata name, string calldata imageURI) external {
        if (artists[wallet].exists) revert ARTIST_EXISTS();
        if (wallet == address(0)) revert INVALID_WALLET();

        artists[wallet] = Artist({
            payoutWallet: wallet,
            name: name,
            imageURI: imageURI,
            exists: true
        });

        emit ArtistRegistered(wallet, name, imageURI);
    }

    function updateArtist(address wallet, string calldata name, string calldata imageURI) external {
        Artist storage artist = artists[wallet];
        if (!artist.exists) revert ARTIST_NOT_FOUND();
        if (msg.sender != wallet) revert UNAUTHORIZED();

        if (bytes(name).length != 0) {
            artist.name = name;
        }
        if (bytes(imageURI).length != 0) {
            artist.imageURI = imageURI;
        }

        emit ArtistUpdated(wallet, artist.name, artist.imageURI);
    }

    function mint(address wallet, uint256 amount) external {
        Artist storage artist = artists[wallet];
        if (!artist.exists) revert ARTIST_NOT_FOUND();

        if (amount < minGiftAmount) revert GIFT_TOO_LOW();

        // Pull PYUSD from caller first, then mint the NFT
        SafeTransferLib.safeTransferFrom(mintToken, msg.sender, address(this), amount);

        uint256 newTokenId = ++totalIssued;
        tokenArtist[newTokenId] = wallet;
        tokenAmounts[newTokenId] = amount;
        artistBalances[wallet] += amount;

        _mint(msg.sender, newTokenId);

        emit GiftMinted(newTokenId, msg.sender, wallet, amount);
    }

    function allocateGift(address[] calldata wallets, uint256[] calldata amounts) external {
        uint256 length = wallets.length;
        if (length == 0) revert EMPTY_GIFT();
        if (length != amounts.length) revert LENGTH_MISMATCH();

        uint256 totalAmount;
        for (uint256 i = 0; i < length; i++) {
            address wallet = wallets[i];
            Artist storage artist = artists[wallet];
            if (!artist.exists) revert ARTIST_NOT_FOUND();

            uint256 amount = amounts[i];
            totalAmount += amount;
        }

        SafeTransferLib.safeTransferFrom(mintToken, msg.sender, address(this), totalAmount);

        for (uint256 i = 0; i < length; i++) {
            artistBalances[wallets[i]] += amounts[i];
        }

        emit GiftAllocated(msg.sender, totalAmount, wallets, amounts);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return _buildTokenURI(tokenId);
    }

    function _buildTokenURI(uint256 tokenId) internal view returns (string memory) {
        address wallet = tokenArtist[tokenId];
        Artist storage artist = artists[wallet];
        if (!artist.exists) revert ARTIST_NOT_FOUND();

        string memory tokenIdStr = _uint2str(tokenId);
        string memory mintAmountStr = _uint2str(tokenAmounts[tokenId]);
        string memory totalIssuedStr = _uint2str(totalIssued);

        // Build JSON metadata for the SBT with artist-specific fields
        return string(abi.encodePacked(
            'data:application/json,{"name":"',
            artist.name,
            ' #',
            tokenIdStr,
            '","description":"A soulbound token representing a gift by pyUSD to artist ',
            artist.name,
            '. This token is non-transferable and acknowledges the supporter.","image":"',
            artist.imageURI,
            '","attributes":[{"trait_type":"Artist Wallet","value":"',
            _addressToHex(wallet),
            '"},{"trait_type":"Gift Amount","value":"',
            mintAmountStr,
            '"},{"trait_type":"Total Issued","value":"',
            totalIssuedStr,
            '"},{"trait_type":"Token Standard","value":"SBT (Non-Transferable)"}]}'
        ));
    }

    function _uint2str(uint256 _i) internal pure returns (string memory str) {
        if (_i == 0) return "0";
        
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        return string(bstr);
    }

    function withdrawForArtist(address wallet, uint256 amount) external {
        Artist storage artist = artists[wallet];
        if (!artist.exists) revert ARTIST_NOT_FOUND();
        if (msg.sender != artist.payoutWallet) revert UNAUTHORIZED();
        if (amount > artistBalances[wallet]) revert INSUFFICIENT_BALANCE();

        artistBalances[wallet] -= amount;
        SafeTransferLib.safeTransfer(mintToken, artist.payoutWallet, amount);

        emit ArtistWithdrawn(wallet, artist.payoutWallet, amount);
    }

    // Convenience: current PYUSD balance held by this contract
    function contractPYUSDBalance() external view returns (uint256) {
        return mintToken.balanceOf(address(this));
    }

    function artistBalance(address wallet) external view returns (uint256) {
        if (!artists[wallet].exists) revert ARTIST_NOT_FOUND();
        return artistBalances[wallet];
    }

    // Helper to encode address as hex string
    function _addressToHex(address a) internal pure returns (string memory) {
        bytes20 data = bytes20(a);
        bytes memory out = new bytes(42);
        out[0] = '0'; out[1] = 'x';
        bytes16 hexSymbols = 0x30313233343536373839616263646566; // 0-9a-f
        for (uint256 i = 0; i < 20; i++) {
            uint8 b = uint8(data[i]);
            out[2 + i * 2] = bytes1(hexSymbols[b >> 4]);
            out[3 + i * 2] = bytes1(hexSymbols[b & 0x0f]);
        }
        return string(out);
    }

    // ---------- SBT Overrides: disable transfers and approvals ----------
    function approve(address, uint256) public override {
        revert TRANSFERS_DISABLED();
    }

    function setApprovalForAll(address, bool) public override {
        revert TRANSFERS_DISABLED();
    }

    function transferFrom(address, address, uint256) public override {
        revert TRANSFERS_DISABLED();
    }

    function safeTransferFrom(address, address, uint256) public override {
        revert TRANSFERS_DISABLED();
    }

    function safeTransferFrom(address, address, uint256, bytes calldata) public override {
        revert TRANSFERS_DISABLED();
    }
}
