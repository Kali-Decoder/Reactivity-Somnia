// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import { SomniaEventHandler } from "@somnia-chain/reactivity-contracts/contracts/SomniaEventHandler.sol";

interface ILastPlayerGame {
    function payoutWinner() external;
}
contract LastPlayerReactiveHandler is SomniaEventHandler {

    address public gameContract;

    constructor(address _game) {
        gameContract = _game;
    }
    function _onEvent(
        address emitter,
        bytes32[] calldata topics,
        bytes calldata
    ) internal override {

        // Ensure event comes from correct game contract
        if (emitter != gameContract) return;

        // PlayerEntered topic hash
        bytes32 playerEnteredTopic =
            keccak256("PlayerEntered(address,uint256)");

        if (topics[0] == playerEnteredTopic) {

            // Check if timer expired
            ILastPlayerGame game = ILastPlayerGame(gameContract);

            // Try calling payout
            try game.payoutWinner() {
                // success = winner paid
            } catch {
                // timer not expired yet → ignore
            }
        }
    }
}
