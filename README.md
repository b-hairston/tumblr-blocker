# Tumblr Block Transfer Tool

This project is a web application that allows Tumblr users to transfer their block lists from one blog to another. Built using Next.js, the app leverages Tumblr's OAuth2 API to authenticate two separate accounts, retrieve the list of blocked blogs from a source account, and apply those blocks to a target account in bulk.

## Features

- **OAuth2 Authentication** for source and target Tumblr accounts
- **Retrieve Blocked Blogs** from the source account
- **Bulk Block on Target Account** to apply the source's blocked list to the target account

## Table of Contents

- [Installation](#installation)
- [Setup and Configuration](#setup-and-configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Technical Details](#technical-details)
- [Troubleshooting](#troubleshooting)

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/tumblr-block-transfer.git
   cd tumblr-block-transfer

## Setup and Configuration
Tumblr API Credentials

Create a Tumblr application by visiting the Tumblr Developer Console. Once created, note the following:

    Client ID (OAuth Consumer Key)
    Client Secret

Environment Variables

Create a .env.local file in the project root with the following environment variables:

env

NEXT_PUBLIC_TUMBLR_CLIENT_ID=your_client_id
TUMBLR_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/api/auth/callback

Start the Development Server

bash

    npm run dev

    Your application should now be running at http://localhost:3000.

## Usage

    Log into the Source Account
        Click "Login with Tumblr (Source Account)" to authenticate and authorize access to the source Tumblr account.
        After login, enter the Source Blog Identifier and click "Fetch Blocked Blogs".

    Log into the Target Account
        Click "Login with Tumblr (Target Account)" to authenticate and authorize access to the target Tumblr account.

    Bulk Block on Target
        Enter the Target Blog Identifier.
        Click "Bulk Block on Target" to apply the source's blocked list to the target account.

## Project Structure

    app/ – Contains the Next.js app pages and API routes.
        page.tsx – The main page where users can log in, retrieve blocks, and apply blocks to the target.
        api/auth/ – Contains routes for handling Tumblr OAuth authentication.
            login/route.ts – Initiates the login flow for source or target account.
            callback/route.ts – Handles the OAuth callback and token exchange.
            transfer/route.ts – Manages retrieving blocked blogs and performing bulk blocks.

## Technical Details

    OAuth2 Authentication: Uses Tumblr's OAuth2 API to securely authenticate both the source and target accounts.
    Axios: Used for making API requests to Tumblr's endpoints.
    Cookies: Used to store access tokens for the source and target accounts to maintain session states.

## Troubleshooting
Common Issues

    OAuth Authentication Issues
        If you encounter a 403 or 404 error during token exchange, ensure:
            The correct Tumblr API endpoint is used.
            Your client_id and client_secret are correct and set as environment variables.

    Source Account Login Appears During Target Login
        Due to Tumblr session caching, sometimes the source account authorization page appears while logging in as the target.
        If this occurs, clear cookies or open a private/incognito window to ensure a fresh login.


