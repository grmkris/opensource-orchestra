// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {ERC721} from "solmate/tokens/ERC721.sol";
import {ERC20} from "solmate/tokens/ERC20.sol";

contract GiftPYUSD is ERC721 {
    uint256 public totalIssued;
    ERC20 public immutable mintToken;
    uint256 public immutable mintPrice;
    address public immutable owner;
    
    // SBT: disable all transfers/approvals
    error TRANSFERS_DISABLED();

    constructor(address _mintToken, uint256 _mintPrice) ERC721("GiftPYUSD", "GIPY") {
        mintToken = ERC20(_mintToken);
        mintPrice = _mintPrice;
        owner = msg.sender;
    }

    function mint() external {
        // Pull PYUSD from caller first, then mint the NFT
        mintToken.transferFrom(msg.sender, address(this), mintPrice);
        _mint(msg.sender, ++totalIssued);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return _buildTokenURI(tokenId);
    }

    function _buildTokenURI(uint256 tokenId) internal view returns (string memory) {
        // Build JSON metadata for the SBT with placeholder image
        return string(abi.encodePacked(
            'data:application/json,{"name":"Gift PYUSD SBT #',
            _uint2str(tokenId),
            '","description":"A special Soulbound Token (SBT) purchased with PYUSD. This non-transferable NFT represents your participation in the Gift PYUSD ecosystem. Each SBT is unique and permanently bound to its original owner.","image":"',
            'https://via.placeholder.com/400x400/4A90E2/FFFFFF?text=SBT%23',
            _uint2str(tokenId),
            '","attributes":[{"trait_type":"Mint Price","value":"1 PYUSD"},{"trait_type":"Total Issued","value":"',
            _uint2str(totalIssued),
            '"},{"trait_type":"Token Standard","value":"SBT (Non-Transferable)"},{"trait_type":"Network","value":"Sepolia"}]}'
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

    // Owner-only: withdraw PYUSD from this contract to a recipient
    function withdraw(address to, uint256 amount) external {
        require(msg.sender == owner, "NOT_OWNER");
        mintToken.transfer(to, amount);
    }

    // Convenience: current PYUSD balance held by this contract
    function contractPYUSDBalance() external view returns (uint256) {
        return mintToken.balanceOf(address(this));
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
