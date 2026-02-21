// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CarbonCreditNFT
 * @dev NFT contract for carbon credits with enhanced metadata and verification
 */
contract CarbonCreditNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // Credit status enum
    enum CreditStatus { DRAFT, PENDING, ISSUED, RETIRED, CANCELLED }

    // Struct to store credit metadata
    struct CreditData {
        string projectId;
        uint256 amount; // tCO2e in wei (multiply by 1e18)
        string vintage;
        string methodology;
        string mrvHash;
        string dataBundleURI;
        string uncertaintyClass;
        uint256 issuedAt;
        uint256 retiredAt;
        CreditStatus status;
        address issuedTo;
        address retiredBy;
    }

    // Mapping from token ID to credit data
    mapping(uint256 => CreditData) public credits;

    // Mapping to track retired credits
    mapping(uint256 => bool) public isRetired;

    // Events
    event CreditIssued(
        uint256 indexed tokenId,
        string indexed projectId,
        address indexed to,
        uint256 amount,
        string vintage
    );

    event CreditRetired(
        uint256 indexed tokenId,
        address indexed retiredBy,
        uint256 retiredAt
    );

    event CreditStatusUpdated(
        uint256 indexed tokenId,
        CreditStatus newStatus
    );

    constructor() ERC721("CarbonCreditNFT", "CCN") {}

    /**
     * @dev Mint a new carbon credit NFT
     */
    function issueCredit(
        address to,
        string memory projectId,
        uint256 amount,
        string memory vintage,
        string memory methodology,
        string memory mrvHash,
        string memory dataBundleURI,
        string memory uncertaintyClass,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        credits[tokenId] = CreditData({
            projectId: projectId,
            amount: amount,
            vintage: vintage,
            methodology: methodology,
            mrvHash: mrvHash,
            dataBundleURI: dataBundleURI,
            uncertaintyClass: uncertaintyClass,
            issuedAt: block.timestamp,
            retiredAt: 0,
            status: CreditStatus.ISSUED,
            issuedTo: to,
            retiredBy: address(0)
        });

        emit CreditIssued(tokenId, projectId, to, amount, vintage);
        return tokenId;
    }

    /**
     * @dev Retire a carbon credit (burns the NFT)
     */
    function retireCredit(uint256 tokenId) public {
        require(_exists(tokenId), "Credit does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner of this credit");
        require(!isRetired[tokenId], "Credit already retired");

        isRetired[tokenId] = true;
        credits[tokenId].status = CreditStatus.RETIRED;
        credits[tokenId].retiredAt = block.timestamp;
        credits[tokenId].retiredBy = msg.sender;

        // Burn the NFT
        _burn(tokenId);

        emit CreditRetired(tokenId, msg.sender, block.timestamp);
    }

    /**
     * @dev Update credit status (admin only)
     */
    function updateCreditStatus(uint256 tokenId, CreditStatus newStatus) public onlyOwner {
        require(_exists(tokenId), "Credit does not exist");
        credits[tokenId].status = newStatus;
        emit CreditStatusUpdated(tokenId, newStatus);
    }

    /**
     * @dev Get credit details
     */
    function getCreditData(uint256 tokenId) public view returns (CreditData memory) {
        require(_exists(tokenId) || isRetired[tokenId], "Credit does not exist");
        return credits[tokenId];
    }

    /**
     * @dev Get total credits issued
     */
    function getTotalCreditsIssued() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Check if a credit is retired
     */
    function isCreditRetired(uint256 tokenId) public view returns (bool) {
        return isRetired[tokenId];
    }

    /**
     * @dev Get credits by project ID
     */
    function getCreditsByProject(string memory projectId) public view returns (uint256[] memory) {
        uint256 totalSupply = _tokenIdCounter.current();
        uint256[] memory projectCredits = new uint256[](totalSupply);
        uint256 count = 0;

        for (uint256 i = 0; i < totalSupply; i++) {
            if (keccak256(bytes(credits[i].projectId)) == keccak256(bytes(projectId))) {
                projectCredits[count] = i;
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = projectCredits[i];
        }

        return result;
    }

    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}