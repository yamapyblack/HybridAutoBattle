// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {PlasmaBattleAlpha} from "../alpha/PlasmaBattleAlpha.sol";

contract PlasmaBattleAlphaMock is PlasmaBattleAlpha {
    constructor(address _signer) PlasmaBattleAlpha(_signer) {}

    function setNewUnits(uint _stage, uint[5] memory _newUnits) external {
        newUnits[_stage] = _newUnits;
    }

    function setPlayerStage(address _player, uint _stage) external {
        playerStage[_player] = _stage;
    }

    function setPlayerUnits(
        address _player,
        uint[5] memory _playerUnits
    ) external {
        playerUnits[_player] = _playerUnits;
    }

    function setSubUnits(address _player, uint[5] memory _subUnits) external {
        subUnits[_player] = _subUnits;
    }
}
