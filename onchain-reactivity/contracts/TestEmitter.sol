// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TestEmitter {
    event TestEvent(bytes32 indexed topic);
    
    function emitTestEvent(bytes32 topic) external {
        emit TestEvent(topic);
    }
}
