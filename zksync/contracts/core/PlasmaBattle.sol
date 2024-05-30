// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

struct Battle {
    address player;
    Result result;
    uint256 startTimestamp;
    uint256 endTimestamp;
}

enum Result {
    NOT_YET,
    WIN,
    LOSE,
    DRAW
}

library PlasmaBattleErrors {
    error InvalidSignature();
    error BattleAlreadyEnd();
    error BattleNotStartedYet();
    error MustResultEnd();
}

event BattleIdIncremented(uint battleId);
event BattleRecorded(uint indexed battleId, address indexed player, Result indexed result, uint startTimestamp, uint endTimestamp);

abstract contract PlasmaBattle is Ownable {

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/
    uint public battleId;
    address public signer;
    // mapping(battlId => info)
    mapping(uint => Battle) public battleRecord;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    constructor(address _signer) Ownable(msg.sender) {
        signer = _signer;
    }

    /*//////////////////////////////////////////////////////////////
                            OWNER UPDATE
    //////////////////////////////////////////////////////////////*/
    function setSigner(address _signer) external onlyOwner {
        signer = _signer;
    }

    /*//////////////////////////////////////////////////////////////
                            EXTERNAL UPDATE
    //////////////////////////////////////////////////////////////*/

    /*//////////////////////////////////////////////////////////////
                             EXTERNAL VIEW
    //////////////////////////////////////////////////////////////*/

    /*//////////////////////////////////////////////////////////////
                            INTERNAL UPDATE
    //////////////////////////////////////////////////////////////*/
    function _startBattle() internal virtual returns (uint) {
        battleId++;
        emit BattleIdIncremented(battleId);

        battleRecord[battleId] = Battle(
            msg.sender,
            Result.NOT_YET,
            block.timestamp,
            0
        );
        emit BattleRecorded(battleId, msg.sender, Result.NOT_YET, block.timestamp, 0);
        return battleId;
    }

    function _endBattle(
        uint _battleId,
        Result _result,
        bytes memory _signature
    ) internal virtual{
        if (_result == Result.NOT_YET) revert PlasmaBattleErrors.MustResultEnd();

        if (battleRecord[_battleId].startTimestamp == 0)
            revert PlasmaBattleErrors.BattleNotStartedYet();

        if (
            battleRecord[_battleId].result != Result.NOT_YET ||
            battleRecord[_battleId].endTimestamp != 0
        ) revert PlasmaBattleErrors.BattleAlreadyEnd();


        bytes32 digest = MessageHashUtils.toEthSignedMessageHash(
            keccak256(abi.encodePacked(_battleId, _result))
        );
        if (!_isValidSignature(digest, _signature)) revert PlasmaBattleErrors.InvalidSignature();

        battleRecord[_battleId].result = _result;
        battleRecord[_battleId].endTimestamp = block.timestamp;
        emit BattleRecorded(_battleId, battleRecord[_battleId].player, _result, battleRecord[_battleId].startTimestamp, block.timestamp);
    }

    /*//////////////////////////////////////////////////////////////
                             INTERNAL VIEW
    //////////////////////////////////////////////////////////////*/
    function _isValidSignature(
        bytes32 hash,
        bytes memory signature
    ) internal virtual view returns (bool) {
        return ECDSA.recover(hash, signature) == signer;
    }

}
