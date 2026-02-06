// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { SomniaEventHandler } from "@somnia-chain/reactivity-contracts/contracts/SomniaEventHandler.sol";

contract MyEventHandler is SomniaEventHandler {

    event ReactedToEvent(address emitter, bytes32 topic);
    
    // Storage to track reactivity execution
    uint256 public reactionCount;
    mapping(address => uint256) public reactionsByEmitter;
    mapping(bytes32 => uint256) public reactionsByTopic;

    function _onEvent(
        address emitter,
        bytes32[] calldata eventTopics,
        bytes calldata data
    ) internal override {
        // Your business logic here
        // Example: Emit a new event or update storage
        
        // Update storage to track reactivity
        reactionCount++;
        reactionsByEmitter[emitter]++;
        if (eventTopics.length > 0) {
            reactionsByTopic[eventTopics[0]]++;
        }
        
        // Emit the reaction event
        emit ReactedToEvent(emitter, eventTopics.length > 0 ? eventTopics[0] : bytes32(0));

        // Be cautious: Avoid reentrancy or infinite loops (e.g., don't emit events that trigger this handler)
    }
}
