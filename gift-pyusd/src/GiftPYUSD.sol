// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {ERC721} from "solmate/tokens/ERC721.sol";
import {ERC20} from "solmate/tokens/ERC20.sol";

contract GiftPYUSD is ERC721 {
    uint256 public totalIssued;
    ERC20 public immutable mintToken;
    uint256 public immutable mintPrice;
    address public immutable owner;

    struct Artist {
        address payoutWallet;
        string name;
        string imageURI;
        bool exists;
    }

    mapping(uint256 => Artist) public artists;
    mapping(uint256 => uint256) public tokenArtist;
    mapping(uint256 => uint256) public artistBalances;
    mapping(uint256 => uint256) public tokenAmounts;

    // SBT: disable all transfers/approvals
    error TRANSFERS_DISABLED();
    error NOT_OWNER();
    error ARTIST_EXISTS();
    error ARTIST_NOT_FOUND();
    error INVALID_WALLET();
    error UNAUTHORIZED();
    error INSUFFICIENT_BALANCE();
    error DONATION_TOO_LOW();
    error EMPTY_DONATION();
    error LENGTH_MISMATCH();

    event ArtistRegistered(uint256 indexed artistId, address payoutWallet, string name, string imageURI);
    event ArtistUpdated(uint256 indexed artistId, address payoutWallet, string name, string imageURI);
    event GiftMinted(uint256 indexed tokenId, address indexed giver, uint256 indexed artistId, uint256 amount);
    event ArtistWithdrawn(uint256 indexed artistId, address indexed payoutWallet, uint256 amount);
    event DonationAllocated(address indexed donor, uint256 totalAmount, uint256[] artistIds, uint256[] amounts);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NOT_OWNER();
        _;
    }

    constructor(address _mintToken, uint256 _mintPrice) ERC721("GiftPYUSD", "GIPY") {
        mintToken = ERC20(_mintToken);
        mintPrice = _mintPrice;
        owner = msg.sender;
    }

    function registerArtist(uint256 artistId, address payoutWallet, string calldata name, string calldata imageURI) external onlyOwner {
        if (artists[artistId].exists) revert ARTIST_EXISTS();
        if (payoutWallet == address(0)) revert INVALID_WALLET();

        artists[artistId] = Artist({
            payoutWallet: payoutWallet,
            name: name,
            imageURI: imageURI,
            exists: true
        });

        emit ArtistRegistered(artistId, payoutWallet, name, imageURI);
    }

    function updateArtist(uint256 artistId, address payoutWallet, string calldata name, string calldata imageURI) external onlyOwner {
        Artist storage artist = artists[artistId];
        if (!artist.exists) revert ARTIST_NOT_FOUND();

        if (payoutWallet != address(0)) {
            artist.payoutWallet = payoutWallet;
        }
        if (bytes(name).length != 0) {
            artist.name = name;
        }
        if (bytes(imageURI).length != 0) {
            artist.imageURI = imageURI;
        }

        emit ArtistUpdated(artistId, artist.payoutWallet, artist.name, artist.imageURI);
    }

    function mint(uint256 artistId, uint256 amount) external {
        Artist storage artist = artists[artistId];
        if (!artist.exists) revert ARTIST_NOT_FOUND();

        if (amount < mintPrice) revert DONATION_TOO_LOW();

        // Pull PYUSD from caller first, then mint the NFT
        mintToken.transferFrom(msg.sender, address(this), amount);

        uint256 newTokenId = ++totalIssued;
        tokenArtist[newTokenId] = artistId;
        tokenAmounts[newTokenId] = amount;
        artistBalances[artistId] += amount;

        _mint(msg.sender, newTokenId);

        emit GiftMinted(newTokenId, msg.sender, artistId, amount);
    }

    function allocateDonation(uint256[] calldata artistIds, uint256[] calldata amounts) external onlyOwner {
        uint256 length = artistIds.length;
        if (length == 0) revert EMPTY_DONATION();
        if (length != amounts.length) revert LENGTH_MISMATCH();

        uint256 totalAmount;
        for (uint256 i = 0; i < length; i++) {
            uint256 artistId = artistIds[i];
            Artist storage artist = artists[artistId];
            if (!artist.exists) revert ARTIST_NOT_FOUND();

            uint256 amount = amounts[i];
            if (amount < mintPrice) revert DONATION_TOO_LOW();
            totalAmount += amount;
        }

        mintToken.transferFrom(msg.sender, address(this), totalAmount);

        for (uint256 i = 0; i < length; i++) {
            artistBalances[artistIds[i]] += amounts[i];
        }

        emit DonationAllocated(msg.sender, totalAmount, artistIds, amounts);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return _buildTokenURI(tokenId);
    }

    function _buildTokenURI(uint256 tokenId) internal view returns (string memory) {
        uint256 artistId = tokenArtist[tokenId];
        Artist storage artist = artists[artistId];
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
            '","attributes":[{"trait_type":"Artist ID","value":"',
            _uint2str(artistId),
            '"},{"trait_type":"Donation Amount","value":"',
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

    function withdrawForArtist(uint256 artistId, uint256 amount) external {
        Artist storage artist = artists[artistId];
        if (!artist.exists) revert ARTIST_NOT_FOUND();
        if (msg.sender != artist.payoutWallet) revert UNAUTHORIZED();
        if (amount > artistBalances[artistId]) revert INSUFFICIENT_BALANCE();

        artistBalances[artistId] -= amount;
        mintToken.transfer(artist.payoutWallet, amount);

        emit ArtistWithdrawn(artistId, artist.payoutWallet, amount);
    }

    // Convenience: current PYUSD balance held by this contract
    function contractPYUSDBalance() external view returns (uint256) {
        return mintToken.balanceOf(address(this));
    }

    function artistBalance(uint256 artistId) external view returns (uint256) {
        if (!artists[artistId].exists) revert ARTIST_NOT_FOUND();
        return artistBalances[artistId];
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
