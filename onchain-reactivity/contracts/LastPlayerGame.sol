// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LastPlayerGame {
    uint256 public constant ENTRY_AMOUNT = 1 ether;
    uint256 public constant ROUND_DURATION = 60;

    address public lastPlayer;
    uint256 public lastEntryTime;
    bool public roundActive;

    event PlayerEntered(address indexed player, uint256 timestamp);
    event WinnerPaid(address indexed winner, uint256 amount);

    constructor() {
        roundActive = true;
    }

    function enterGame() external payable {
        require(msg.value == ENTRY_AMOUNT, "Must send exactly 1 token");
        require(roundActive, "Round not active");

        lastPlayer = msg.sender;
        lastEntryTime = block.timestamp;

        emit PlayerEntered(msg.sender, block.timestamp);
    }

    function payoutWinner() external {
        require(roundActive, "Round already ended");
        require(
            block.timestamp >= lastEntryTime + ROUND_DURATION,
            "Timer not expired"
        );
        require(lastPlayer != address(0), "No players");

        roundActive = false;

        uint256 pot = address(this).balance;
        payable(lastPlayer).transfer(pot);

        emit WinnerPaid(lastPlayer, pot);
    }

    function startNewRound() external {
        require(!roundActive, "Round still active");

        lastPlayer = address(0);
        lastEntryTime = 0;
        roundActive = true;
    }
}
