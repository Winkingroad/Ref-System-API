# Referral System API

## Overview

This Node.js backend server implements a referral system allowing users to generate unique referral links. Upon successful referral link usage, users receive 5000 credits in their wallet. Referral links expire after 5 uses, prompting users to create new links.

## User Model

The user model, defined in `userModel.js`, includes:

- `userId`: Unique identifier (auto-generated if not provided)
- `username`: Unique user identifier
- `password`: Hashed user password for security
- `balance`: Defaulted to 0; updated on referral link usage
- `referralLink`: Generated on user request
- `referralCount`: Tracks link usage, defaults to 0
- `referralExpiry`: Expiry date of referral links
- `referralLinkUsageHistory`: Records link usage and users involved
- `role`: Specifies user role ('user' or 'admin', default is 'user')

## API Endpoints

- **POST /register**: Registers a new user.
- **POST /login**: Logs in a user.
- **POST /referral/verify**: Verifies and uses a referral link.
- **POST /add-balance**: Adds balance to a user's account.
- **POST /referral/expire**: Expires a user's referral link.
- **GET /referral/generate**: Generates a unique referral link for a user.
- **GET /balance**: Returns a user's current balance.
- **GET /myProfile**: Returns user profile information.
- **GET /users**: Returns a list of all users in the database (admin only).
- **GET /users/:userId**: Returns profile information of a specific user by ID (admin only).
- **PUT /users/:userId**: Updates a user's balance (admin only).
- **PUT /referral/expire/:userId**: Expires a user's referral link (admin only).

## Detailed API Documentation

- Access detailed API documentation by hitting the `/api-docs` endpoint.
- Refer to the `swagger.yaml` file for comprehensive API details.

### Security Measures

- Passwords are hashed and salted before storage.
- JWT used for authentication and authorization.
- Rate limiting prevents abuse on referral link generation.
- Proper error handling with meaningful error messages.

### Database and Tools

- MongoDB stores user info, referral data, and balances.
- Mongoose connects the database and models the User schema.
- Mongoose methods query the database efficiently.

## Functionality Breakdown

- `registerUser`: Registers a new user, hashing the password and saving user data.
- `loginUser`: Handles user login, generating a JWT token upon successful login.
- `registerWithReferral`: Extends registration to include a referral link, updating balances for valid referrals.
- `addBalance`: Adds balance to a user's account based on the provided username and amount.
- `generateReferralLink`: Generates a unique referral link for the authenticated user.
- `getBalance`: Retrieves the current balance of the authenticated user.
- `expireReferralLink`: Expires the referral link of a specific user.
- `getUserProfile`: Fetches the profile information of the authenticated user.
- `getAllUsers`: Fetches a list of all users' information (admin access).
- `getUserById`: Fetches profile information of a specific user by ID (admin access).
- `updateUserBalance`: Allows an admin to update a specific user's balance.
- `expireReferralLinkAdmin`: Allows an admin to expire the referral link of a specific user.


## Middleware - `authorizeAdmin`

### Overview

This middleware function ensures that only users with an 'admin' role can access specific routes or perform admin-specific actions.

### Functionality

- **authorizeAdmin(req, res, next)**:
  - Verifies the user's JWT token to determine their role.
  - Retrieves the user from the database based on the token's payload.
  - Checks if the user exists and has an 'admin' role.
  - Allows access to the next middleware or route if the user is an admin.
  - Sends a '403 Forbidden' error if the user is not authorized.

### Usage

This middleware should be utilized in routes or endpoints that require admin access:

```javascript
const { authorizeAdmin } = require('./middleware/authorizeAdmin');

// Example route requiring admin access
app.get('/admin-route', authorizeAdmin, (req, res) => {
  // Handle admin-only actions
});

```

## Bonus Functionalities

### 1. Rate Limiting

#### Implemented Rate Limiting

To prevent abuse of the referral link generation and verification endpoints, rate limiting has been implemented. This ensures that users cannot excessively generate or verify referral links within a specific time frame.

#### Implementation Details

The `express-rate-limit` middleware has been integrated to set rate limits for the respective endpoints. For instance:

```javascript
const rateLimit = require('express-rate-limit');

const referralLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many requests for referral link generation. Please try again later.',
});

// Apply the limiter to the referral link generation endpoint
app.post('/referral/generate', referralLimiter, (req, res) => {
  // Handle referral link generation
});
```

### User Profile

#### Implemented User Profile View

Users can now access their profile, which includes details such as their referral link, current balance, and referral link usage history. This functionality provides users with insights into their account activities.

#### Implementation Details

An endpoint `/myProfile` has been created to fetch and return the user's profile information based on their authenticated token.

### Admin Dashboard

#### Implemented Admin Dashboard

An admin dashboard has been developed to monitor and manage user accounts, balances, and referral links. This interface provides administrators with centralized access to oversee and perform administrative actions on user accounts.

#### Implementation Details

Admin-specific interfaces or endpoints have been created to:

- Fetch a comprehensive list of users along with their information.
- Enable updates to user balances or roles.
- Expire referral links for specific users.
- View detailed user profiles and referral link usage.


