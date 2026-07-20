# API Documentation

## Smart Contract API (`ConfidentialDonation.sol`)

### `createCampaign(string memory _name, string memory _description, uint256 _goal)`
- **Description:** Creates a new fundraising campaign.
- **Modifiers:** None
- **Emits:** `CampaignCreated(uint256 indexed campaignId, address indexed owner, string name, uint256 goal)`

### `donate(uint256 _campaignId, string memory _encryptedPayload)`
- **Description:** Allows a user to donate native cryptocurrency (AVAX) to a campaign. The transaction must contain `msg.value > 0`.
- **Modifiers:** `payable`, `nonReentrant`
- **Emits:** `DonationReceived(uint256 indexed campaignId, address indexed donor, string encryptedPayload)`

### `withdrawFunds(uint256 _campaignId)`
- **Description:** Transfers all accumulated funds from a campaign to the campaign's creator.
- **Modifiers:** `nonReentrant`
- **Security:** Requires `msg.sender == campaign.owner`.
- **Emits:** `FundsWithdrawn(uint256 indexed campaignId, address indexed owner, uint256 amount)`

### `getDonationsCount(uint256 _campaignId)`
- **Returns:** `uint256` - The total number of donations made to a specific campaign.

### `getDonation(uint256 _campaignId, uint256 _index)`
- **Returns:** `(address donor, string memory encryptedPayload, uint256 timestamp)`

---

## Backend REST API (`server.js`)

> **Note:** The backend serves as an optional caching and indexing layer.

### `GET /api/health`
- **Returns:** `{ "status": "ok" }`

### `GET /api/campaigns`
- **Description:** Retrieves a cached list of all campaigns.
- **Returns:** JSON array of campaign objects.

### `POST /api/campaigns`
- **Description:** Stores a new campaign locally.
- **Body:** `{ name, description, goal, owner, id }`

### `POST /api/donations`
- **Description:** Logs a donation in the backend database.
- **Body:** `{ campaignId, donor, encryptedPayload }`

### `GET /api/campaigns/:id/donations`
- **Description:** Retrieves all donations for a specific campaign ID.
