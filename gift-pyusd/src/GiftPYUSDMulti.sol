// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {ERC721} from "solmate/tokens/ERC721.sol";

/// @title MultiGiftSBT - Soulbound receipt for gifting multiple artists in one NFT
/// @notice No token transfer or approvals are allowed (SBT). This contract is a receipt layer only;
///         actual PYUSD transfers and artist accounting live in GiftPYUSD.
contract MultiGiftSBT is ERC721 {
    // --- State ---
    uint256 public immutable minTotalAmount;
    uint256 public totalIssued;
    address public immutable owner;

    struct GiftSplit {
        uint256 totalAmount;          // Sum of amounts (e.g., 6 decimals for PYUSD)
        uint256[] artistIds;          // Target artist IDs (as used by GiftPYUSD)
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
        uint256[] artistIds,
        uint256[] amounts,
        uint256 totalAmount,
        string title
    );

    // --- Modifiers ---
    modifier onlyOwner() {
        if (msg.sender != owner) revert NOT_OWNER();
        _;
    }

    constructor(uint256 _minTotalAmount) ERC721("MultiGiftReceipt", "MGFT") {
        owner = msg.sender;
        minTotalAmount = _minTotalAmount;
    }

    // --- External ---
    /// @notice Mint a soulbound receipt NFT representing a single multi-artist gift action.
    /// @param artistIds The list of artist IDs
    /// @param totalAmount The total gift amount (will be split equally across artistIds)
    /// @param title Optional title/label (empty string allowed)
    function mint(
        uint256[] calldata artistIds,
        uint256 totalAmount,
        string calldata title
    ) external {
        uint256 n = artistIds.length;
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
        g.artistIds = artistIds;
        g.amounts = amounts;

        _mint(msg.sender, tokenId);

        emit ReceiptMinted(tokenId, msg.sender, artistIds, amounts, totalAmount, title);
    }

    /// @notice View gift details by token ID.
    function getGift(uint256 tokenId)
        external
        view
        returns (uint256[] memory artistIds, uint256[] memory amounts, uint256 totalAmount, string memory title)
    {
        GiftSplit storage g = _gifts[tokenId];
        return (g.artistIds, g.amounts, g.totalAmount, g.title);
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

        // Build arrays as JSON strings
        string memory idsJson = _uintArrayToJson(g.artistIds);
        string memory amtsJson = _uintArrayToJson(g.amounts);

        return string(abi.encodePacked(
            'data:application/json,',
            '{"name":"Multi Gift #', tokenIdStr,
            '","description":"A soulbound receipt representing a gift split across multiple artists.",',
            '"attributes":[',
                '{"trait_type":"Total Amount","value":"', totalStr, '"},',
                '{"trait_type":"Total Issued","value":"', totalIssuedStr, '"}',
            '],',
            '"properties":{',
                '"artistIds":', idsJson, ',',
                '"amounts":', amtsJson, ',',
                '"title":"', g.title, '"',
            '}',
            '}'
        ));
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
