// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {ERC721} from "solmate/tokens/ERC721.sol";
import {ERC20} from "solmate/tokens/ERC20.sol";

contract HelloPYUSD is ERC721 {
    uint256 public totalIssued;
    ERC20 public immutable mintToken;
    uint256 public immutable mintPrice;
    address public immutable owner;

    constructor(address _mintToken, uint256 _mintPrice) ERC721("HelloPYUSD", "HIPYPL") {
        mintToken = ERC20(_mintToken);
        mintPrice = _mintPrice;
        owner = msg.sender;
    }

    function mint() external {
        // Pull PYUSD from caller first, then mint the NFT
        mintToken.transferFrom(msg.sender, address(this), mintPrice);
        _mint(msg.sender, ++totalIssued);
    }

    function tokenURI(uint256) public pure override returns (string memory) {
        return "";
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
}
