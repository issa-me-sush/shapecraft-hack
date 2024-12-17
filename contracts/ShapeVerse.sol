// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ShapeVerse is ERC20, Ownable, ReentrancyGuard {
    // State variables
    mapping(string => bool) public activeLocations;
    mapping(address => mapping(string => uint256)) public lastClaim;
    mapping(uint256 => LocationNFT) public locationNFTs;
    mapping(address => mapping(string => StakeInfo)) public userStakes;
    mapping(string => uint256) public totalLocationStakes;
    
    uint256 public nftCounter;
    uint256 public constant DAILY_CLAIM_INTERVAL = 1 days;
    uint256 public constant STAKE_APR = 1500; // 15% APR
    uint256 public constant APR_DENOMINATOR = 10000;

    // Structs
    struct LocationNFT {
        uint256 tokenId;
        string placeId;
        address owner;
        string imageUri;
        uint256 timestamp;
    }

    struct StakeInfo {
        uint256 amount;
        uint256 timestamp;
    }

    // Events
    event AuraClaimed(address indexed user, string placeId, uint256 amount);
    event LocationNFTMinted(address indexed owner, string placeId, uint256 tokenId);
    event AuraStaked(address indexed user, string placeId, uint256 amount);
    event AuraUnstaked(address indexed user, string placeId, uint256 amount, uint256 rewards);
    event QuestCompleted(address indexed user, uint256 amount);
    event LocationActivated(string placeId, address activator);

    constructor() ERC20("ShapeVerse Aura", "SAURA") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10**decimals()); // 1M tokens
    }

    // Modified claimAura function that auto-activates locations
    function claimAura(string memory placeId) external nonReentrant {
        // Auto-activate if not active
        if (!activeLocations[placeId]) {
            activeLocations[placeId] = true;
            emit LocationActivated(placeId, msg.sender);
        }

        require(
            block.timestamp >= lastClaim[msg.sender][placeId] + DAILY_CLAIM_INTERVAL,
            "Too soon to claim"
        );

        uint256 amount = 100 * 10**decimals(); // 100 SAURA per claim
        lastClaim[msg.sender][placeId] = block.timestamp;

        _mint(msg.sender, amount);
        emit AuraClaimed(msg.sender, placeId, amount);
    }

    // NFT functions
    function mintLocationNFT(string memory placeId, string memory imageUri) external {
        require(activeLocations[placeId], "Location not active");
        
        nftCounter++;
        locationNFTs[nftCounter] = LocationNFT(
            nftCounter,
            placeId,
            msg.sender,
            imageUri,
            block.timestamp
        );

        emit LocationNFTMinted(msg.sender, placeId, nftCounter);
    }

    // Staking functions
    function stake(string memory placeId, uint256 amount) external nonReentrant {
        require(activeLocations[placeId], "Location not active");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        _transfer(msg.sender, address(this), amount);

        StakeInfo storage userStake = userStakes[msg.sender][placeId];
        if (userStake.amount > 0) {
            _claimStakingRewards(msg.sender, placeId);
        }
        userStake.amount += amount;
        userStake.timestamp = block.timestamp;
        totalLocationStakes[placeId] += amount;

        emit AuraStaked(msg.sender, placeId, amount);
    }

    function unstake(string memory placeId) external nonReentrant {
        StakeInfo storage userStake = userStakes[msg.sender][placeId];
        require(userStake.amount > 0, "No stake found");

        uint256 rewards = _calculateRewards(msg.sender, placeId);

        uint256 stakedAmount = userStake.amount;
        totalLocationStakes[placeId] -= stakedAmount;
        userStake.amount = 0;
        userStake.timestamp = 0;

        _mint(msg.sender, rewards);
        _transfer(address(this), msg.sender, stakedAmount);

        emit AuraUnstaked(msg.sender, placeId, stakedAmount, rewards);
    }

    // Quest completion
    function completeQuest(address user, uint256 amount) external onlyOwner {
        _mint(user, amount);
        emit QuestCompleted(user, amount);
    }

    // Event access check
    function checkEventAccess(uint256 minAura) external view returns (bool) {
        return balanceOf(msg.sender) >= minAura;
    }

    // Internal functions
    function _calculateRewards(address user, string memory placeId) internal view returns (uint256) {
        StakeInfo memory userStake = userStakes[user][placeId];
        if (userStake.amount == 0) return 0;

        uint256 timeStaked = block.timestamp - userStake.timestamp;
        return (userStake.amount * STAKE_APR * timeStaked) / (365 days * APR_DENOMINATOR);
    }

    function _claimStakingRewards(address user, string memory placeId) internal {
        uint256 rewards = _calculateRewards(user, placeId);
        if (rewards > 0) {
            _mint(user, rewards);
            userStakes[user][placeId].timestamp = block.timestamp;
        }
    }
} 