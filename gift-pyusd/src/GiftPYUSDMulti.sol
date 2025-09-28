// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {ERC721} from "solmate/tokens/ERC721.sol";

/// @title GiftPYUSDMulti - Soulbound receipt for gifting multiple artists in one NFT
/// @notice No token transfer or approvals are allowed (SBT). This contract is a receipt layer only;
///         actual PYUSD transfers and artist accounting live in GiftPYUSD.
contract GiftPYUSDMulti is ERC721 {
    // --- State ---
    uint256 public immutable minTotalAmount;
    uint256 public totalIssued;
    address public immutable owner;

    struct GiftSplit {
        uint256 totalAmount;          // Sum of amounts (e.g., 6 decimals for PYUSD)
        address[] wallets;            // Target artist wallets (as used by GiftPYUSD)
        uint256[] amounts;            // Amount per artist (same decimals as PYUSD)
        string title;                 // Optional title/note for the gift
    }

    mapping(uint256 => GiftSplit) internal _gifts;

    // --- Errors ---
    error NOT_OWNER();
    error TRANSFERS_DISABLED();
    error LENGTH_MISMATCH();
    error INVALID_SUM();
    error TOTAL_TOO_LOW();

    // --- Events ---
    event ReceiptMinted(
        uint256 indexed tokenId,
        address indexed giver,
        address[] wallets,
        uint256[] amounts,
        uint256 totalAmount,
        string title
    );

    // --- Modifiers ---
    modifier onlyOwner() {
        if (msg.sender != owner) revert NOT_OWNER();
        _;
    }

    constructor(uint256 _minTotalAmount) ERC721("GiftPYUSDMulti", "GPM") {
        owner = msg.sender;
        minTotalAmount = _minTotalAmount;
    }

    // --- External ---
    /// @notice Mint a soulbound receipt NFT representing a single multi-artist gift action.
    /// @param wallets The list of artist payout wallets
    /// @param totalAmount The total gift amount (will be split equally across wallets)
    /// @param title Optional title/label (empty string allowed)
    function mint(
        address[] calldata wallets,
        uint256 totalAmount,
        string calldata title
    ) external {
        uint256 n = wallets.length;
        if (n == 0) revert LENGTH_MISMATCH();
        if (totalAmount < minTotalAmount) revert TOTAL_TOO_LOW();

        // Compute equal split with remainder distributed from the beginning
        uint256 share = totalAmount / n;
        uint256 rem = totalAmount % n;
        uint256[] memory amounts = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            amounts[i] = share + (i < rem ? 1 : 0);
        }

        uint256 tokenId = ++totalIssued;

        // Store gift split (copy calldata arrays to storage)
        GiftSplit storage g = _gifts[tokenId];
        g.totalAmount = totalAmount;
        g.title = title;
        g.wallets = wallets;
        g.amounts = amounts;

        _mint(msg.sender, tokenId);

        emit ReceiptMinted(tokenId, msg.sender, wallets, amounts, totalAmount, title);
    }

    /// @notice View gift details by token ID.
    function getGift(uint256 tokenId)
        external
        view
        returns (address[] memory wallets, uint256[] memory amounts, uint256 totalAmount, string memory title)
    {
        GiftSplit storage g = _gifts[tokenId];
        return (g.wallets, g.amounts, g.totalAmount, g.title);
    }

    // --- ERC721 (SBT behavior) ---
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return _buildTokenURI(tokenId);
    }

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

    // --- Internal helpers ---
    function _buildTokenURI(uint256 tokenId) internal view returns (string memory) {
        GiftSplit storage g = _gifts[tokenId];

        string memory tokenIdStr = _u2s(tokenId);
        string memory totalStr = _u2s(g.totalAmount);
        string memory totalIssuedStr = _u2s(totalIssued);

        string memory idsJson = _addrArrayToJson(g.wallets);
        string memory amtsJson = _uintArrayToJson(g.amounts);

        return string(abi.encodePacked(
            'data:application/json,',
            '{"name":"GiftPYUSDMulti #', tokenIdStr,
            '","description":"A soulbound receipt representing a gift split across multiple artists.",',
            '"attributes":[',
                '{"trait_type":"Total Amount","value":"', totalStr, '"},',
                '{"trait_type":"Total Issued","value":"', totalIssuedStr, '"}'
            '],',
            '"properties":{',
                '"wallets":', idsJson, ',',
                '"amounts":', amtsJson, ',',
                '"title":"', g.title, '"',
            '}'
        ));
    }

    function _addrArrayToJson(address[] storage arr) internal view returns (string memory) {
        // e.g., ["0x...","0x..."]
        if (arr.length == 0) return "[]";
        bytes memory out = "[";
        for (uint256 i = 0; i < arr.length; i++) {
            out = abi.encodePacked(out, '"', _addrToHex(arr[i]), '"');
            if (i + 1 < arr.length) out = abi.encodePacked(out, ",");
        }
        out = abi.encodePacked(out, "]");
        return string(out);
    }

    function _uintArrayToJson(uint256[] storage arr) internal view returns (string memory) {
        // e.g., [1,2,3]
        if (arr.length == 0) return "[]";
        bytes memory out = "[";
        for (uint256 i = 0; i < arr.length; i++) {
            out = abi.encodePacked(out, _u2s(arr[i]));
            if (i + 1 < arr.length) out = abi.encodePacked(out, ",");
        }
        out = abi.encodePacked(out, "]");
        return string(out);
    }

    function _addrToHex(address a) internal pure returns (string memory) {
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

    function _u2s(uint256 v) internal pure returns (string memory str) {
        if (v == 0) return "0";
        uint256 j = v;
        uint256 len;
        while (j != 0) { len++; j /= 10; }
        bytes memory b = new bytes(len);
        j = v;
        while (j != 0) { b[--len] = bytes1(uint8(48 + (j % 10))); j /= 10; }
        return string(b);
    }
}
