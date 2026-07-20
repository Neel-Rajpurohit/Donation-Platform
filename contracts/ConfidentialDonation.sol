// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ConfidentialDonation
 * @dev A smart contract for private donations using a mock eERC approach.
 * Encrypted payloads are stored on-chain to maintain privacy.
 */
contract ConfidentialDonation is ReentrancyGuard, Ownable {

    struct Campaign {
        uint256 id;
        address payable owner;
        string name;
        string description;
        uint256 goal;
        uint256 totalFunds;
        bool isActive;
    }

    struct Donation {
        address donor; // Can be zero address for full anonymity if paid via relayer, or standard address
        string encryptedPayload; // The eERC encrypted amount/donor info
        uint256 timestamp;
    }

    uint256 public campaignCount;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => Donation[]) public campaignDonations;

    event CampaignCreated(uint256 indexed campaignId, address indexed owner, string name, uint256 goal);
    event DonationReceived(uint256 indexed campaignId, address indexed donor, string encryptedPayload);
    event FundsWithdrawn(uint256 indexed campaignId, address indexed owner, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Creates a new donation campaign.
     * @param _name Name of the campaign.
     * @param _description Description of the campaign.
     * @param _goal Fundraising goal in wei.
     */
    function createCampaign(string memory _name, string memory _description, uint256 _goal) external {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_goal > 0, "Goal must be greater than 0");

        campaignCount++;
        campaigns[campaignCount] = Campaign({
            id: campaignCount,
            owner: payable(msg.sender),
            name: _name,
            description: _description,
            goal: _goal,
            totalFunds: 0,
            isActive: true
        });

        emit CampaignCreated(campaignCount, msg.sender, _name, _goal);
    }

    /**
     * @dev Donates to a campaign. The exact amount transferred is public in the transaction, 
     * but the `_encryptedPayload` can contain the true intended amount if using a privacy pool/eERC,
     * or hidden donor details. For this MVP, we accept native AVAX and store the payload.
     * @param _campaignId ID of the campaign to donate to.
     * @param _encryptedPayload Encrypted eERC payload or donor details.
     */
    function donate(uint256 _campaignId, string memory _encryptedPayload) external payable nonReentrant {
        require(msg.value > 0, "Donation amount must be greater than 0");
        
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.isActive, "Campaign is not active");

        campaign.totalFunds += msg.value;

        campaignDonations[_campaignId].push(Donation({
            donor: msg.sender,
            encryptedPayload: _encryptedPayload,
            timestamp: block.timestamp
        }));

        emit DonationReceived(_campaignId, msg.sender, _encryptedPayload);
    }

    /**
     * @dev Allows the campaign owner to withdraw accumulated funds.
     * @param _campaignId ID of the campaign to withdraw from.
     */
    function withdrawFunds(uint256 _campaignId) external nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender == campaign.owner, "Only campaign owner can withdraw");
        require(campaign.totalFunds > 0, "No funds to withdraw");

        uint256 amountToWithdraw = campaign.totalFunds;
        campaign.totalFunds = 0; // Reset before transfer to prevent reentrancy

        (bool success, ) = campaign.owner.call{value: amountToWithdraw}("");
        require(success, "Withdrawal failed");

        emit FundsWithdrawn(_campaignId, msg.sender, amountToWithdraw);
    }

    /**
     * @dev Returns the total number of donations for a campaign.
     * @param _campaignId ID of the campaign.
     * @return Number of donations.
     */
    function getDonationsCount(uint256 _campaignId) external view returns (uint256) {
        return campaignDonations[_campaignId].length;
    }

    /**
     * @dev Returns details of a specific donation.
     * @param _campaignId ID of the campaign.
     * @param _index Index of the donation.
     * @return donor address, encrypted payload, and timestamp.
     */
    function getDonation(uint256 _campaignId, uint256 _index) external view returns (address, string memory, uint256) {
        require(_index < campaignDonations[_campaignId].length, "Index out of bounds");
        Donation memory donation = campaignDonations[_campaignId][_index];
        return (donation.donor, donation.encryptedPayload, donation.timestamp);
    }
}
