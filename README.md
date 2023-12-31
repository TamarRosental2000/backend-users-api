# Users Web List Application

## Overview

This is a simple Users Web List application implemented in Node.js using an external API (https://reqres.in/) to manage user data. The application provides endpoints to read, create, update, and delete users.

## Endpoints

1. **Reading all USERS from a specific page:**
   - Route: `/getUsers/{page}`
   - Method: GET

2. **Read specific USER:**
   - Route: `/getUser/{id}`
   - Method: GET

3. **Create a new USER:**
   - Route: `/createUser`
   - Method: POST

4. **Update USER:**
   - Route: `/updateUser/{id}`
   - Method: PUT
   - Note: Ensure to search if the user exists before updating.

5. **Delete USER:**
   - Route: `/deleteUser/{id}`
   - Method: DELETE
   - Note: Ensure to search if the user exists before deleting.

## CORS Configuration

Configure your app to be consumed only by the following origins:

- https://localhost
- https://www.google.com
- https://www.facebook.com

## Design Patterns

Apply design patterns as necessary to write readable, clean, and efficient code. Consider organizing the code in a modular and scalable manner.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/TamarRosental2000/backend-users-api
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Configure the environment variables:

    Create a `.env` file in the root directory and add the following:

    ```dotenv
    PORT=5000
    ```

## Running the Application

Start the server:

```bash
node app.js
