
// // const Member = require('../models/member');
// // const Corona = require('../models/corona');
// const axios = require('axios'); 


// // const authenticate = (req, res, next) => {
// //   // Your authentication logic goes here
// //   // For simplicity, let's assume there's a token in the request header
// //   const token = req.header('Authorization');

// //   if (!token || !validateToken(token)) {
// //     return res.status(401).json({ error: 'Unauthorized' });
// //   }

// //   next();
// // };

// // // Validate token (dummy function for illustration)
// // const validateToken = (token) => {
// //   // Implement your token validation logic here
// //   return token === 'your_secret_token';
// // };


// exports.getUsers = async (req, res) => {
//   try {
//     const page = req.params.page;
//     const response = await axios.get(`https://reqres.in/api/users?page=${page}`);
//     const users = response.data.data;
//     res.status(200).json(users);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error getUsers' });
//   }

// };

// exports.getById = async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const response = await axios.get(`https://reqres.in/api/users/${userId}`);
//     const user = response.data.data;
//     res.status(200).json(user);
//   } 
//   catch (error) {
//     console.error(error);
//     res.status(404).json({ error: 'User not found' });
//   }
// };

// exports.createUser = async (req, res) => {
//   try {
//     // Validate the request body
//     if (!req.body.name || !req.body.job) {
//       return res.status(400).json({ error: 'Invalid request body' });
//     }

//     // Create a new user using ReqRes API
//     const response = await axios.post('https://reqres.in/api/users', req.body);
//     const createdUser = response.data;

//     res.status(201).json(createdUser);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error createUser' });
//   }
// };

// exports.updateUser = async  (req, res) => {
//   try {

//     const userId = req.params.userId;
//     // Check if the user exists in the external API
//     const userExists = await doesUserExist(userId);
//     // Check if the user exists in your cache

//     if (!userExists) {
//       return res.status(404).json({ error: 'User not found ' });
//     }


//     // Update the user using ReqRes API
//     const response = await axios.put(`https://reqres.in/api/users/${userId}`, req.body);
//     const updatedUserData = response.data;

//     // Update the user in your data store
//     // if (existingUser) {
//     //   existingUser.name = updatedUserData.name;
//     //   existingUser.job = updatedUserData.job;
//     // } else {
//     //   // If not found in the local data store, add it
//     //   users.push(updatedUserData);
//     // }

//     res.status(200).json(updatedUserData);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error updateUser' });
//   }
// };

// exports.deleteUser = async  (req, res) => {
//   try {

//     const userId = req.params.userId;

//     // const existingUser = users.find(user => user.id === userId);
//     // Check if the user exists in the external API
//     const userExists = await doesUserExist(userId);
//     // Check if the user exists in your cache

//     if (!userExists) {
//       return res.status(404).json({ error: 'User not found' });
//     }


//     // Update the user using ReqRes API
//     const response = await axios.delete(`https://reqres.in/api/users/${userId}`);

//     // Update the user in your data store
//     // if (existingUser) {
//     //   existingUser.name = updatedUserData.name;
//     //   existingUser.job = updatedUserData.job;
//     // } else {
//     //   // If not found in the local data store, add it
//     //   users.push(updatedUserData);
//     // }

//     res.status(200).json({userId});
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error deleteUser' });
//   }
// };
// const doesUserExist = async (userId) => {
//   try {
//     const response = await axios.get(`https://reqres.in/api/users/${userId}`);
//     return response.status === 200;
//   } catch (error) {
//     return false;
//   }
// };
const axios = require('axios');
const fs = require('fs');
const filePath = 'cache.json';
const jwt = require('jsonwebtoken');
const existingData = fs.readFileSync(filePath, 'utf-8');
const lockfile = require('proper-lockfile');

async function withLock(action) {
  const release = await lockfile.lock('cache.lock');

  try {
    return await action();
  } finally {
    await release();
  }
}

const secretKey = 'your_secret_key'; // Replace with a strong secret key

const authenticate = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - Missing token' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

exports.login = (req, res) => {
  const user = { id: 1, username: 'example' };

  const token = jwt.sign({ user }, secretKey, { expiresIn: '1h' });

  res.json({ token });
};

exports.getUsers = async (req, res) => {
  try {
    const page = req.params.page;
    const response = await axios.get(`https://reqres.in/api/users?page=${page}`);

    const users = response.data.data;

    // Add the users to the cache
    AddUsersToCache(users);

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error getUsers' });
  }

};

exports.getById = async (req, res) => {
  try {

    const userId = req.params.userId;
    const cacheResponse = GetUserFromCache(userId);
    if (!cacheResponse) {
      const response = await axios.get(`https://reqres.in/api/users/${userId}`);
      const user = response.data.data;
      AddUserToCache(user);
      res.status(200).json(user);

    }
    else {
      res.status(200).json(cacheResponse);
    }

  }
  catch (error) {
    console.error(error);
    res.status(404).json({ error: 'User not found' });
  }
};
function AddUserToCache(user) {
  return withLock(async () => {
    try {

      // Parse the JSON data into a JavaScript array
      const dataArray = JSON.parse(existingData);

      // Add the new user to the array
      dataArray.push(user);

      // Convert the updated array back to a JSON string
      const updatedJsonData = JSON.stringify(dataArray, null, 2);

      // Write the updated JSON data back to the cache file
      fs.writeFileSync(filePath, updatedJsonData, 'utf-8');

      console.log('New user added to cache successfully.');
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error AddUserToCache' });
    }
  });
};
function GetUserFromCache(userIdToFind) {
  return withLock(async () => {
    try {

      // Parse the JSON data into a JavaScript array
      const dataArray = JSON.parse(existingData);

      // Find the specific user in the array based on the unique identifier
      const specificUser = dataArray.find(user => user.id === userIdToFind);

      // Check if the user was found
      if (specificUser) {
        // Perform operations with the specific user
        console.log('Specific user found:', specificUser);
        return specificUser;
      } else {
        console.log('User not found.');
      }
      return null;
    }
    catch (error) {
      console.error(error);
      return null;
    }
  });
};
function AddUsersToCache(users) {
  return withLock(async () => {
    try {
      // Read existing JSON data from the cache file
      const existingData = fs.readFileSync(filePath, 'utf-8');

      // Parse the JSON data into a JavaScript array
      const dataArray = JSON.parse(existingData);

      // Add the new users to the array
      dataArray.push(...users);

      // Convert the updated array back to a JSON string
      const updatedJsonData = JSON.stringify(dataArray, null, 2);

      // Write the updated JSON data back to the cache file
      fs.writeFileSync(filePath, updatedJsonData, 'utf-8');

      console.log('New users added to cache successfully.');
      // Assuming you are not sending a response in this function
      // If you need to send a response, consider removing the 'res' parameter
    } catch (error) {
      console.error(error);
      // If you need to send a response, handle it accordingly
      // res.status(500).json({ error: 'Internal Server Error AddUsersToCache' });
    }
  });
}

exports.createUser = async (req, res) => {
  try {
    // Validate the request body
    if (!req.body.name || !req.body.job) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Create a new user using ReqRes API
    const response = await axios.post('https://reqres.in/api/users', req.body);
    const createdUser = response.data;

    res.status(201).json(createdUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error createUser' });
  }
};

exports.updateUser = async (req, res) => {
  try {

    const userId = req.params.userId;
    // Check if the user exists in the external API
    const userExists = await doesUserExist(userId);
    // Check if the user exists in your cache

    if (!userExists) {
      return res.status(404).json({ error: 'User not found ' });
    }


    // Update the user using ReqRes API
    const response = await axios.put(`https://reqres.in/api/users/${userId}`, req.body);
    const updatedUserData = response.data;

    // Update the user in your data store
    // if (existingUser) {
    //   existingUser.name = updatedUserData.name;
    //   existingUser.job = updatedUserData.job;
    // } else {
    //   // If not found in the local data store, add it
    //   users.push(updatedUserData);
    // }

    res.status(200).json(updatedUserData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error updateUser' });
  }
};

exports.deleteUser = async (req, res) => {
  try {

    const userId = req.params.userId;

    // const existingUser = users.find(user => user.id === userId);
    // Check if the user exists in the external API
    const userExists = await doesUserExist(userId);
    // Check if the user exists in your cache

    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }


    // Update the user using ReqRes API
    const response = await axios.delete(`https://reqres.in/api/users/${userId}`);

    // Update the user in your data store
    // if (existingUser) {
    //   existingUser.name = updatedUserData.name;
    //   existingUser.job = updatedUserData.job;
    // } else {
    //   // If not found in the local data store, add it
    //   users.push(updatedUserData);
    // }

    res.status(200).json({ userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error deleteUser' });
  }
};

const doesUserExist = async (userId) => {
  try {
    const response = await axios.get(`https://reqres.in/api/users/${userId}`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
};


