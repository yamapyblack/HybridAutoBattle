// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {PlasmaBattle, Result} from "../core/PlasmaBattle.sol";

// import {console2} from "forge-std/console2.sol";

interface IERC721Alpha {
    function mint(address to) external;
}

contract PlasmaBattleAlpha is PlasmaBattle {
    error InvalidUnitId();
    error StaminaNotEnough();
    error StaminaRecoveryPaymentInvalid();
    error StaminaRecoveryAlreadyFull();
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
    // For alpha testing
    mapping(uint => uint) public newUnitByStage;
    mapping(uint => uint[5]) public enemyUnitsByStage;
    mapping(uint => uint) public maxUnitIdByStage;
    //Stamina Mapping(playerAddress => stamina)
    mapping(address => uint8) public staminas;
    uint8 public maxStamina = 6;
    uint public starminaRecoveryCost = 0.01 ether;

    //For completing the game
    address public nftAddress;

    uint public maxStage = 3;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    constructor(address _signer) PlasmaBattle(_signer) {
        //Set newUnitsByStage
        newUnitByStage[1] = 4;
        newUnitByStage[2] = 5;
        newUnitByStage[3] = 6;
        //Set enemyUnitsByStage
        enemyUnitsByStage[0] = [8001, 8002, 8003];
        enemyUnitsByStage[1] = [8002, 8002, 8003, 8003];
        enemyUnitsByStage[2] = [8004, 8005, 8004];
        enemyUnitsByStage[3] = [8006, 8006, 8004, 8005, 8004];
        //Set maxUnitIdByStage
        // maxUnitIdByStage[0] = 1;
        // maxUnitIdByStage[1] = 2;
        // maxUnitIdByStage[2] = 3;
    }

    /*//////////////////////////////////////////////////////////////
                            OWNER UPDATE
    //////////////////////////////////////////////////////////////*/
    function setNewUnitByStage(
        uint _stage,
        uint _newUnitId
    ) external onlyOwner {
        newUnitByStage[_stage] = _newUnitId;
    }

    function setEnemyUnitsByStage(
        uint _stage,
        uint[5] memory _enemyUnits
    ) external onlyOwner {
        enemyUnitsByStage[_stage] = _enemyUnits;
    }

    function setMaxUnitIdByStage(
        uint _stage,
        uint _maxUnitId
    ) external onlyOwner {
        maxUnitIdByStage[_stage] = _maxUnitId;
    }

    function setMaxStamina(uint8 _maxStamina) external onlyOwner {
        maxStamina = _maxStamina;
    }

    function setStaminaRecoveryCost(
        uint _starminaRecoveryCost
    ) external onlyOwner {
        starminaRecoveryCost = _starminaRecoveryCost;
    }

    function setMaxStage(uint _maxStage) external onlyOwner {
        maxStage = _maxStage;
    }

    function setNftAddress(address _nftAddress) external onlyOwner {
        nftAddress = _nftAddress;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /*//////////////////////////////////////////////////////////////
                            EXTERNAL UPDATE
    //////////////////////////////////////////////////////////////*/

    function startBattle(
        uint[5] memory _playerUnits,
        uint[5] memory _subUnits
    ) external returns (uint) {
        if (staminas[msg.sender] >= maxStamina) {
            revert StaminaNotEnough();
        }
        staminas[msg.sender]++;
        //TODO revisit this
        // if (!validateUnits(playerStage[msg.sender], _playerUnits, _subUnits)) {
        //     revert InvalidUnitId();
        // }
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
            if (playerStage[_player] == maxStage) {
                //mintNFT
                IERC721Alpha(nftAddress).mint(msg.sender);
                return;
            }

            //Increment player stage if win
            uint _newStage = playerStage[_player] + 1;
            playerStage[_player] = _newStage;

            //Add new units to _subUnits
            uint[5] storage _subUnits = subUnits[_player];
            for (uint8 i = 0; i < 5; i++) {
                if (_subUnits[i] == 0) {
                    _subUnits[i] = newUnitByStage[_newStage];
                    break;
                }
            }
        }
    }

    function recoverStamina() external payable {
        if (staminas[msg.sender] == 0) revert StaminaRecoveryAlreadyFull();
        //to recover, pay ETH
        if (msg.value != starminaRecoveryCost)
            revert StaminaRecoveryPaymentInvalid();

        staminas[msg.sender] = 0;
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

    function getEnemyUnits(uint _stage) external view returns (uint[5] memory) {
        return enemyUnitsByStage[_stage];
    }

    function validateUnits(
        uint _stage,
        uint[5] memory _playerUnits,
        uint[5] memory _subUnits
    ) public view returns (bool) {
        uint _maxUnitId = maxUnitIdByStage[_stage];

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
}
