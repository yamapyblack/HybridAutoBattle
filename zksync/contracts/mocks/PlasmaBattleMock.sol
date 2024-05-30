// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {PlasmaBattle, Result} from "../core/PlasmaBattle.sol";

contract PlasmaBattleMock is PlasmaBattle {
    constructor(address _signer) PlasmaBattle(_signer) {}

    function startBattle() external returns (uint) {
        return _startBattle();
    }

    function endBattle(
        uint _battleId,
        Result _result,
        bytes memory _signature
    ) external {
        _endBattle(_battleId, _result, _signature);
    }
}
