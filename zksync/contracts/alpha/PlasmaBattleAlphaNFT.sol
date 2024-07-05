// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

// import { console2 } from "forge-std/console2.sol";

struct TokenURIParams {
    string name;
    string description;
    string image;
}

contract PlasmaBattleAlphaNFT is ERC721, Ownable {
    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/
    uint public currentTokenId;

    string constant NAME = "PlasmaBattleAlphaNFT";
    string constant DESCRIPTION =
        "This NFT is minted to the early completed user.";

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    constructor(address _minter) ERC721(NAME, NAME) Ownable(_minter) {}

    /*//////////////////////////////////////////////////////////////
                            EXTERNAL UPDATE
    //////////////////////////////////////////////////////////////*/
    function mint(address _to) external onlyOwner {
        currentTokenId++;
        _mint(_to, currentTokenId);
    }

    /*//////////////////////////////////////////////////////////////
                             EXTERNAL VIEW
    //////////////////////////////////////////////////////////////*/

    // prettier-ignore
    function generateImage(uint256 _tokenId)
        public
        pure
        returns (string memory)
    {
        return
            Base64.encode(bytes(
                string(
                    abi.encodePacked(
'<svg width="320" height="320" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg"><defs><style type="text/css">@import url("https://fonts.googleapis.com/css2?family=Londrina+Solid:wght@100;300;400;900");</style></defs>',
'<rect width="100%" height="100%" fill="#FF7A00"/>',
'<rect width="60" height="10" x="100" y="110" fill="#ffef16"/><rect width="60" height="10" x="170" y="110" fill="#ffef16"/><rect width="10" height="10" x="100" y="120" fill="#ffef16"/><rect width="20" height="10" x="110" y="120" fill="#ffffff"/><rect width="20" height="10" x="130" y="120" fill="#000000"/><rect width="10" height="10" x="150" y="120" fill="#ffef16"/><rect width="10" height="10" x="170" y="120" fill="#ffef16"/>',
'<rect width="20" height="10" x="180" y="120" fill="#ffffff"/><rect width="20" height="10" x="200" y="120" fill="#000000"/><rect width="10" height="10" x="220" y="120" fill="#ffef16"/><rect width="40" height="10" x="70" y="130" fill="#ffef16"/><rect width="20" height="10" x="110" y="130" fill="#ffffff"/><rect width="20" height="10" x="130" y="130" fill="#000000"/>',
'<rect width="30" height="10" x="150" y="130" fill="#ffef16"/><rect width="20" height="10" x="180" y="130" fill="#ffffff"/><rect width="20" height="10" x="200" y="130" fill="#000000"/><rect width="10" height="10" x="220" y="130" fill="#ffef16"/><rect width="10" height="10" x="70" y="140" fill="#ffef16"/><rect width="10" height="10" x="100" y="140" fill="#ffef16"/><rect width="20" height="10" x="110" y="140" fill="#ffffff"/>',
'<rect width="20" height="10" x="130" y="140" fill="#000000"/><rect width="10" height="10" x="150" y="140" fill="#ffef16"/><rect width="10" height="10" x="170" y="140" fill="#ffef16"/><rect width="20" height="10" x="180" y="140" fill="#ffffff"/><rect width="20" height="10" x="200" y="140" fill="#000000"/><rect width="10" height="10" x="220" y="140" fill="#ffef16"/><rect width="10" height="10" x="70" y="150" fill="#ffef16"/><rect width="10" height="10" x="100" y="150" fill="#ffef16"/>',
'<rect width="20" height="10" x="110" y="150" fill="#ffffff"/><rect width="20" height="10" x="130" y="150" fill="#000000"/><rect width="10" height="10" x="150" y="150" fill="#ffef16"/><rect width="10" height="10" x="170" y="150" fill="#ffef16"/><rect width="20" height="10" x="180" y="150" fill="#ffffff"/><rect width="20" height="10" x="200" y="150" fill="#000000"/><rect width="10" height="10" x="220" y="150" fill="#ffef16"/><rect width="60" height="10" x="100" y="160" fill="#ffef16"/><rect width="60" height="10" x="170" y="160" fill="#ffef16"/>',
'<text x="150" y="220" font-size="16" fill="#fff" text-anchor="middle" style="font-family: ', "'Londrina Solid'", ';">',
NAME,
' #',
Strings.toString(_tokenId),
'</text></svg>'
                    )
                )
            ));
    }

    function tokenURI(
        uint256 _id
    ) public pure override returns (string memory) {
        TokenURIParams memory params = TokenURIParams({
            name: string(abi.encodePacked(NAME, " #", Strings.toString(_id))),
            description: DESCRIPTION,
            image: generateImage(_id)
        });
        return constructTokenURI(params);
    }

    /*//////////////////////////////////////////////////////////////
                             INTERNAL VIEW
    //////////////////////////////////////////////////////////////*/
    function constructTokenURI(
        TokenURIParams memory params
    ) public pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                params.name,
                                '", "description":"',
                                params.description,
                                '", "image": "data:image/svg+xml;base64,',
                                params.image,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    /*//////////////////////////////////////////////////////////////
                            INTERNAL UPDATE
    //////////////////////////////////////////////////////////////*/
}
