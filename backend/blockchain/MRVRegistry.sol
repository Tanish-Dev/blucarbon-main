// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MRVRegistry
 * @dev Store MRV (Monitoring, Reporting, Verification) hashes on-chain
 * @notice This contract stores immutable MRV report hashes for carbon credit projects
 */
contract MRVRegistry {
    
    // Struct to store MRV report data
    struct MRVReport {
        string projectId;
        bytes32 mrvHash;
        string metadata;
        address validator;
        uint256 timestamp;
        bool exists;
    }
    
    // Mapping from project ID to array of MRV reports
    mapping(string => MRVReport[]) public projectReports;
    
    // Mapping from MRV hash to report details
    mapping(bytes32 => MRVReport) public hashToReport;
    
    // Array of all project IDs
    string[] public allProjects;
    mapping(string => bool) private projectExists;
    
    // Events
    event MRVHashStored(
        string indexed projectId,
        bytes32 indexed mrvHash,
        address indexed validator,
        uint256 timestamp
    );
    
    event ProjectRegistered(
        string indexed projectId,
        uint256 timestamp
    );
    
    /**
     * @dev Store MRV hash on blockchain
     * @param projectId The ID of the project
     * @param mrvHash The MRV hash (as bytes32)
     * @param metadata JSON metadata about the report
     */
    function storeMRVHash(
        string memory projectId,
        bytes32 mrvHash,
        string memory metadata
    ) public {
        require(bytes(projectId).length > 0, "Project ID cannot be empty");
        require(mrvHash != bytes32(0), "MRV hash cannot be zero");
        require(!hashToReport[mrvHash].exists, "MRV hash already exists");
        
        // Register project if first time
        if (!projectExists[projectId]) {
            allProjects.push(projectId);
            projectExists[projectId] = true;
            emit ProjectRegistered(projectId, block.timestamp);
        }
        
        // Create MRV report
        MRVReport memory report = MRVReport({
            projectId: projectId,
            mrvHash: mrvHash,
            metadata: metadata,
            validator: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
        
        // Store report
        projectReports[projectId].push(report);
        hashToReport[mrvHash] = report;
        
        emit MRVHashStored(projectId, mrvHash, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Store MRV hash with hex string (convenience function)
     * @param projectId The ID of the project
     * @param mrvHashHex The MRV hash as hex string (with or without 0x prefix)
     * @param metadata JSON metadata about the report
     */
    function storeMRVHashHex(
        string memory projectId,
        string memory mrvHashHex,
        string memory metadata
    ) public {
        bytes32 hash = hexStringToBytes32(mrvHashHex);
        storeMRVHash(projectId, hash, metadata);
    }
    
    /**
     * @dev Get all MRV reports for a project
     * @param projectId The ID of the project
     * @return Array of MRV reports
     */
    function getProjectReports(string memory projectId) 
        public 
        view 
        returns (MRVReport[] memory) 
    {
        return projectReports[projectId];
    }
    
    /**
     * @dev Get number of reports for a project
     * @param projectId The ID of the project
     * @return Number of reports
     */
    function getProjectReportCount(string memory projectId) 
        public 
        view 
        returns (uint256) 
    {
        return projectReports[projectId].length;
    }
    
    /**
     * @dev Get report by MRV hash
     * @param mrvHash The MRV hash
     * @return MRV report
     */
    function getReportByHash(bytes32 mrvHash) 
        public 
        view 
        returns (MRVReport memory) 
    {
        require(hashToReport[mrvHash].exists, "Report not found");
        return hashToReport[mrvHash];
    }
    
    /**
     * @dev Verify if an MRV hash exists
     * @param mrvHash The MRV hash to verify
     * @return True if hash exists
     */
    function verifyHash(bytes32 mrvHash) 
        public 
        view 
        returns (bool) 
    {
        return hashToReport[mrvHash].exists;
    }
    
    /**
     * @dev Get total number of projects
     * @return Number of projects
     */
    function getTotalProjects() 
        public 
        view 
        returns (uint256) 
    {
        return allProjects.length;
    }
    
    /**
     * @dev Get all project IDs
     * @return Array of project IDs
     */
    function getAllProjects() 
        public 
        view 
        returns (string[] memory) 
    {
        return allProjects;
    }
    
    /**
     * @dev Convert hex string to bytes32
     * @param hexString Hex string (with or without 0x prefix)
     * @return Bytes32 value
     */
    function hexStringToBytes32(string memory hexString) 
        internal 
        pure 
        returns (bytes32) 
    {
        bytes memory hexBytes = bytes(hexString);
        require(hexBytes.length == 64 || hexBytes.length == 66, "Invalid hex string length");
        
        uint256 offset = 0;
        if (hexBytes.length == 66) {
            require(hexBytes[0] == '0' && hexBytes[1] == 'x', "Invalid hex prefix");
            offset = 2;
        }
        
        bytes32 result;
        for (uint256 i = 0; i < 32; i++) {
            result |= bytes32(
                (hexCharToUint(hexBytes[offset + i * 2]) * 16 + 
                 hexCharToUint(hexBytes[offset + i * 2 + 1])) << (8 * (31 - i))
            );
        }
        return result;
    }
    
    /**
     * @dev Convert hex character to uint
     * @param c Hex character
     * @return Uint value
     */
    function hexCharToUint(bytes1 c) 
        internal 
        pure 
        returns (uint8) 
    {
        if (c >= '0' && c <= '9') {
            return uint8(c) - uint8('0');
        }
        if (c >= 'a' && c <= 'f') {
            return 10 + uint8(c) - uint8('a');
        }
        if (c >= 'A' && c <= 'F') {
            return 10 + uint8(c) - uint8('A');
        }
        revert("Invalid hex character");
    }
}
