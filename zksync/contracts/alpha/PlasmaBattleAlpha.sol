// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {PlasmaBattle, Result} from "../core/PlasmaBattle.sol";

contract PlasmaBattleAlpha is PlasmaBattle {
    error InvalidUnitId();
    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/
    // Mapping(stage => newUnit)
    mapping(uint => uint[5]) public newUnits;
    // Mapping(playerAddress => stage)
    mapping(address => uint) public playerStage;
    // Mapping(playerAddress => playerUnits)
    mapping(address => uint[5]) playerUnits;
    mapping(address => uint[5]) subUnits;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    constructor(address _signer) PlasmaBattle(_signer) {}

    /*//////////////////////////////////////////////////////////////
                            EXTERNAL UPDATE
    //////////////////////////////////////////////////////////////*/
    function startBattle(
        uint[5] memory _playerUnits,
        uint[5] memory _subUnits
    ) external returns (uint) {
        if (!validateUnits(playerStage[msg.sender], _playerUnits, _subUnits)) {
            revert InvalidUnitId();
        }
        playerUnits[msg.sender] = _playerUnits;
        subUnits[msg.sender] = _subUnits;
        return _startBattle();
    }

    function endBattle(
        uint _battleId,
        Result _result,
        bytes memory _signature
    ) external {
        _endBattle(_battleId, _result, _signature);
        address _player = battleRecord[_battleId].player;
        if (_result == Result.WIN) {
            //Increment player stage if win
            uint _newStage = playerStage[_player] + 1;
            playerStage[_player] = _newStage;

            //Add new units to _subUnits
            uint[5] storage _subUnits = subUnits[_player];
            for (uint8 i = 0; i < 5; i++) {
                if (_subUnits[i] == 0) {
                    _subUnits[i] = _getNewUnit(_newStage);
                    break;
                }
            }
        }
    }

    /*//////////////////////////////////////////////////////////////
                             EXTERNAL VIEW
    //////////////////////////////////////////////////////////////*/
    function getPlayerUnits(
        address _player
    ) external view returns (uint[5] memory) {
        return playerUnits[_player];
    }

    function getSubUnits(
        address _player
    ) external view returns (uint[5] memory) {
        return subUnits[_player];
    }

    //TODO Owner can change this
    function getEnemyUnits(uint _stage) external pure returns (uint[5] memory) {
        if (_stage == 0) {
            return [uint(6), 0, 0, 0, 0];
        } else if (_stage == 1) {
            return [uint(6), 7, 0, 0, 0];
        } else if (_stage == 2) {
            return [uint(6), 7, 8, 0, 0];
        } else if (_stage == 3) {
            return [uint(6), 7, 8, 9, 0];
        } else if (_stage == 4) {
            return [uint(6), 7, 8, 9, 10];
        }
        return [uint(0), 0, 0, 0, 0];
    }

    function validateUnits(
        uint _stage,
        uint[5] memory _playerUnits,
        uint[5] memory _subUnits
    ) public pure returns (bool) {
        uint _maxUnitId;
        if (_stage == 0) {
            _maxUnitId = 1;
        } else if (_stage == 1) {
            _maxUnitId = 2;
        } else if (_stage == 2) {
            _maxUnitId = 3;
        } else if (_stage == 3) {
            _maxUnitId = 4;
        } else if (_stage == 4) {
            _maxUnitId = 5;
        }

        //Check if playerUnits and subUnits within maxUnitId and not duplicate ecept for 0
        uint[10] memory _allUnits;
        for (uint i = 0; i < 5; i++) {
            _allUnits[i] = _playerUnits[i];
            _allUnits[i + 5] = _subUnits[i];
        }
        for (uint i = 0; i < 10; i++) {
            if (_allUnits[i] > _maxUnitId) {
                // console2.log("Over maxUnitId");
                return false;
            }
            for (uint j = i + 1; j < 10; j++) {
                if (_allUnits[i] == _allUnits[j] && _allUnits[i] != 0) {
                    // console2.log("Duplicate unitIds");
                    return false;
                }
            }
        }

        return true;
    }

    /*//////////////////////////////////////////////////////////////
                            INTERNAL UPDATE
    //////////////////////////////////////////////////////////////*/

    /*//////////////////////////////////////////////////////////////
                             INTERNAL VIEW
    //////////////////////////////////////////////////////////////*/
    function _getNewUnit(uint _stage) internal pure returns (uint) {
        if (_stage == 1) {
            return 2;
        } else if (_stage == 2) {
            return 3;
        } else if (_stage == 3) {
            return 4;
        } else if (_stage == 4) {
            return 5;
        }
        return 0;
    }
}
