// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProjectRegistry
 * @dev Registry contract for carbon projects with verification and validation
 */
contract ProjectRegistry is Ownable {
    
    // Project status enum
    enum ProjectStatus { DRAFT, IN_REVIEW, MONITORING, ISSUED, REJECTED }

    // Struct to store project data
    struct Project {
        string projectId;
        string title;
        string methodology;
        string ecosystemType;
        uint256 areaHectares; // in wei (multiply by 1e18)
        string vintage;
        string location; // JSON string with coordinates
        address owner;
        address validator;
        ProjectStatus status;
        string ipfsMetadataHash;
        uint256 createdAt;
        uint256 updatedAt;
        bool exists;
    }

    // Mapping from project ID to project data
    mapping(string => Project) public projects;
    
    // Array to store all project IDs
    string[] public projectIds;
    
    // Mapping to track project ownership
    mapping(address => string[]) public ownerProjects;
    
    // Mapping for validator assignments
    mapping(address => string[]) public validatorProjects;

    // Events
    event ProjectRegistered(
        string indexed projectId,
        address indexed owner,
        string title,
        string methodology
    );

    event ProjectStatusUpdated(
        string indexed projectId,
        ProjectStatus newStatus,
        address updatedBy
    );

    event ValidatorAssigned(
        string indexed projectId,
        address indexed validator
    );

    event ProjectMetadataUpdated(
        string indexed projectId,
        string newIpfsHash
    );

    /**
     * @dev Register a new carbon project
     */
    function registerProject(
        string memory projectId,
        string memory title,
        string memory methodology,
        string memory ecosystemType,
        uint256 areaHectares,
        string memory vintage,
        string memory location,
        string memory ipfsMetadataHash
    ) public {
        require(!projects[projectId].exists, "Project already exists");
        require(bytes(projectId).length > 0, "Project ID cannot be empty");
        require(bytes(title).length > 0, "Title cannot be empty");

        projects[projectId] = Project({
            projectId: projectId,
            title: title,
            methodology: methodology,
            ecosystemType: ecosystemType,
            areaHectares: areaHectares,
            vintage: vintage,
            location: location,
            owner: msg.sender,
            validator: address(0),
            status: ProjectStatus.DRAFT,
            ipfsMetadataHash: ipfsMetadataHash,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            exists: true
        });

        projectIds.push(projectId);
        ownerProjects[msg.sender].push(projectId);

        emit ProjectRegistered(projectId, msg.sender, title, methodology);
    }

    /**
     * @dev Update project status (admin or validator only)
     */
    function updateProjectStatus(string memory projectId, ProjectStatus newStatus) public {
        require(projects[projectId].exists, "Project does not exist");
        require(
            msg.sender == owner() || 
            msg.sender == projects[projectId].validator,
            "Not authorized to update status"
        );

        projects[projectId].status = newStatus;
        projects[projectId].updatedAt = block.timestamp;

        emit ProjectStatusUpdated(projectId, newStatus, msg.sender);
    }

    /**
     * @dev Assign validator to project (admin only)
     */
    function assignValidator(string memory projectId, address validator) public onlyOwner {
        require(projects[projectId].exists, "Project does not exist");
        require(validator != address(0), "Invalid validator address");

        address oldValidator = projects[projectId].validator;
        projects[projectId].validator = validator;
        projects[projectId].updatedAt = block.timestamp;

        // Update validator mappings
        if (oldValidator != address(0)) {
            removeFromValidatorProjects(oldValidator, projectId);
        }
        validatorProjects[validator].push(projectId);

        emit ValidatorAssigned(projectId, validator);
    }

    /**
     * @dev Update project metadata IPFS hash
     */
    function updateProjectMetadata(string memory projectId, string memory newIpfsHash) public {
        require(projects[projectId].exists, "Project does not exist");
        require(
            msg.sender == projects[projectId].owner || 
            msg.sender == owner(),
            "Not authorized to update metadata"
        );

        projects[projectId].ipfsMetadataHash = newIpfsHash;
        projects[projectId].updatedAt = block.timestamp;

        emit ProjectMetadataUpdated(projectId, newIpfsHash);
    }

    /**
     * @dev Get project details
     */
    function getProject(string memory projectId) public view returns (Project memory) {
        require(projects[projectId].exists, "Project does not exist");
        return projects[projectId];
    }

    /**
     * @dev Get projects by owner
     */
    function getProjectsByOwner(address owner) public view returns (string[] memory) {
        return ownerProjects[owner];
    }

    /**
     * @dev Get projects by validator
     */
    function getProjectsByValidator(address validator) public view returns (string[] memory) {
        return validatorProjects[validator];
    }

    /**
     * @dev Get total number of projects
     */
    function getTotalProjects() public view returns (uint256) {
        return projectIds.length;
    }

    /**
     * @dev Get all project IDs
     */
    function getAllProjectIds() public view returns (string[] memory) {
        return projectIds;
    }

    /**
     * @dev Get projects by status
     */
    function getProjectsByStatus(ProjectStatus status) public view returns (string[] memory) {
        uint256 count = 0;
        
        // First pass: count matching projects
        for (uint256 i = 0; i < projectIds.length; i++) {
            if (projects[projectIds[i]].status == status) {
                count++;
            }
        }

        // Second pass: populate result array
        string[] memory result = new string[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < projectIds.length; i++) {
            if (projects[projectIds[i]].status == status) {
                result[index] = projectIds[i];
                index++;
            }
        }

        return result;
    }

    /**
     * @dev Check if project exists
     */
    function projectExists(string memory projectId) public view returns (bool) {
        return projects[projectId].exists;
    }

    /**
     * @dev Remove project from validator's list (internal function)
     */
    function removeFromValidatorProjects(address validator, string memory projectId) internal {
        string[] storage validatorProjectList = validatorProjects[validator];
        for (uint256 i = 0; i < validatorProjectList.length; i++) {
            if (keccak256(bytes(validatorProjectList[i])) == keccak256(bytes(projectId))) {
                validatorProjectList[i] = validatorProjectList[validatorProjectList.length - 1];
                validatorProjectList.pop();
                break;
            }
        }
    }
}