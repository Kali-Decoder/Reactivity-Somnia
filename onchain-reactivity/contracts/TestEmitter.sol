// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TestEmitter
 * @notice A contract that emits various events for testing Somnia reactivity
 * @dev This contract demonstrates different event types that can trigger reactive handlers
 */
contract TestEmitter {
    // Simple event with indexed topic
    event TestEvent(bytes32 indexed topic);
    
    // Event with multiple indexed parameters
    event UserAction(address indexed user, uint256 indexed actionId, string action);
    
    // Event with indexed address and data
    event Transfer(address indexed from, address indexed to, uint256 amount);
    
    // Counter to track emissions
    uint256 public emissionCount;
    
    /**
     * @notice Emit a simple test event
     * @param topic The topic to emit
     */
    function emitTestEvent(bytes32 topic) external {
        emissionCount++;
        emit TestEvent(topic);
    }
    
    /**
     * @notice Emit a user action event
     * @param actionId The action identifier
     * @param action The action description
     */
    function emitUserAction(uint256 actionId, string calldata action) external {
        emissionCount++;
        emit UserAction(msg.sender, actionId, action);
    }
    
    /**
     * @notice Emit a transfer event
     * @param to The recipient address
     * @param amount The transfer amount
     */
    function emitTransfer(address to, uint256 amount) external {
        emissionCount++;
        emit Transfer(msg.sender, to, amount);
    }
    
    /**
     * @notice Emit multiple events in one transaction
     * @param count Number of events to emit
     */
    function emitMultipleEvents(uint256 count) external {
        for (uint256 i = 0; i < count; i++) {
            emissionCount++;
            emit TestEvent(keccak256(abi.encodePacked("batch", i, block.timestamp)));
        }
    }
}
