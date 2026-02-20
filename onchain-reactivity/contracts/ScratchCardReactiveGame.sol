// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import { SomniaEventHandler } from "@somnia-chain/reactivity-contracts/contracts/SomniaEventHandler.sol";

contract ScratchCardReactiveGame is SomniaEventHandler {
    event ScratchRequested(address indexed player, uint256 scratchId, uint256 playerNonce);
    event ScratchResolved(address indexed player, uint256 scratchId, uint256 reward, uint256 randomWord);
    event RewardsClaimed(address indexed player, uint256 amount);

    address public immutable owner;

    uint256 public scratchPrice;
    uint256 public jackpotReward;

    uint256 public totalPendingRewards;
    uint256 private scratchCounter;

    mapping(address => uint256) public pendingRewards;
    mapping(address => uint256) public claimedAmount;
    mapping(address => uint256) public totalWonAmount;
    mapping(address => uint256) public totalCardScratches;
    mapping(address => uint256) public playerNonce;

    bytes32 private constant SCRATCH_SIG = keccak256("ScratchRequested(address,uint256,uint256)");

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(uint256 _scratchPrice, uint256 _jackpotReward) {
        owner = msg.sender;
        scratchPrice = _scratchPrice;
        jackpotReward = _jackpotReward;
    }

    receive() external payable {}

    function scratchCard() external payable {
        require(msg.value == scratchPrice, "Wrong scratch price");
        uint256 scratchId = ++scratchCounter;
        uint256 nonce = ++playerNonce[msg.sender];
        emit ScratchRequested(msg.sender, scratchId, nonce);
    }

    function claimRewards(uint256 amount) external {
        require(amount > 0, "Amount is zero");
        require(amount <= pendingRewards[msg.sender], "Insufficient pending rewards");

        pendingRewards[msg.sender] -= amount;
        claimedAmount[msg.sender] += amount;
        totalPendingRewards -= amount;

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Transfer failed");

        emit RewardsClaimed(msg.sender, amount);
    }

    function setScratchPrice(uint256 newPrice) external onlyOwner {
        scratchPrice = newPrice;
    }

    function setJackpotReward(uint256 newJackpotReward) external onlyOwner {
        jackpotReward = newJackpotReward;
    }

    function ownerWithdraw(uint256 amount) external onlyOwner {
        uint256 available = _availableLiquidity();
        require(amount <= available, "Amount exceeds available balance");

        (bool sent, ) = payable(owner).call{value: amount}("");
        require(sent, "Owner withdraw failed");
    }

    function _onEvent(
        address emitter,
        bytes32[] calldata eventTopics,
        bytes calldata data
    ) internal override {
        require(emitter == address(this), "Invalid emitter");
        require(eventTopics.length >= 2, "Invalid event topics");
        require(eventTopics[0] == SCRATCH_SIG, "Not ScratchRequested");

        address player = address(uint160(uint256(eventTopics[1])));
        (uint256 scratchId, uint256 nonce) = abi.decode(data, (uint256, uint256));

        // Pseudo-randomness only. For high-value rewards, prefer VRF/commit-reveal.
        uint256 randomWord = uint256(
            keccak256(
                abi.encodePacked(
                    block.prevrandao,
                    block.timestamp,
                    block.number,
                    player,
                    scratchId,
                    nonce,
                    address(this)
                )
            )
        );

        uint256 reward = _rewardFromRandom(randomWord);
        uint256 available = _availableLiquidity();
        if (reward > available) {
            reward = available;
        }

        pendingRewards[player] += reward;
        totalPendingRewards += reward;
        totalWonAmount[player] += reward;
        totalCardScratches[player] += 1;

        emit ScratchResolved(player, scratchId, reward, randomWord);
    }

    function _rewardFromRandom(uint256 randomWord) internal view returns (uint256) {
        uint256 roll = randomWord % 10_000;

        if (roll < 10) return jackpotReward; // 0.10%
        if (roll < 200) return jackpotReward / 5; // 1.90%
        if (roll < 1_500) return jackpotReward / 20; // 13.00%
        if (roll < 5_000) return jackpotReward / 100; // 35.00%
        return 0;
    }

    function getPlayerStats(address player)
        external
        view
        returns (uint256 pending, uint256 claimed, uint256 totalWon, uint256 scratches)
    {
        return (
            pendingRewards[player],
            claimedAmount[player],
            totalWonAmount[player],
            totalCardScratches[player]
        );
    }

    function _availableLiquidity() internal view returns (uint256) {
        uint256 balance = address(this).balance;
        if (balance <= totalPendingRewards) return 0;
        return balance - totalPendingRewards;
    }
}
