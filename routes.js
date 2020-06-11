"use strict";

const express = require("express");
const { check, validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const auth = require("basic-auth");

function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

// Array used to keep track of user records created
const users = [];

// Construct a router instance
const router = express.Router();

// Creates a user
router.post(
  "/users",
  [
    [
      check("name")
        .exists({
          checkNull: true,
          checkFalsy: true,
        })
        .withMessage('Please provide a value for "name"'),
      check("username")
        .exists({
          checkNull: true,
          checkFalsy: true,
        })
        .withMessage('Please provide a value for "username"'),
      check("password")
        .exists({
          checkNull: true,
          checkFalsy: true,
        })
        .withMessage('Please provide a value for "password"'),
    ],
  ],
  (req, res) => {
    // Get validation result from request object
    const errors = validationResult(req);
    // If there are validation errors
    if (!errors.isEmpty()) {
      // Get list of error messages
      const errorMessages = error.array().map((error) => error.msg);
      // Return the validation errors to the client
      return res.status(400).json({ errors: errorMessages });
    }
    // Get the user from request body
    const user = req.body;
    // Hash new user's password
    user.password = bcryptjs.hashSync(user.password);
    // Add user to the `users` array
    user.push(user);
    // set status to 201 and end response
    res.status(201).end();
  }
);

const authenticateUser = (req, res, next) => {
  let message = null;
  // Parse user credentials from Authorization header
  const credentials = auth(req);
  // If the user's credentials are available...
  if (credentials) {
    // Retrieve user data
    const user = users.find((u) => u.username === credentials.name);
    // If a user was successfully retrieved from the data
    if (user) {
      const authenticated = bcryptjs.compareSync(
        credentials.pass,
        user.password
      );
      // If password match
      if (authenticated) {
        console.log(`Authentication successful for username: ${user.username}`);
        req.currentUser = user;
      } else {
        message = `Authentication failure for username: ${user.username}`;
      }
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = "Auth header not found";
  }

  // If user authentication failed
  if (message) {
    console.warn(message);
    // Return response with 401 Unauthorize HTTP status code
    res.status(401).json({ message: "Access Denied" });
  } else {
    next();
  }
};

// Returns current authenticated user
router.get("/users", authenticateUser, (req, res) => {
  const user = req.currentUser;
  res.json({
    name: user.name,
    username: user.username,
  });
});

// Returns a list of courses
router.get("/courses", asyncHandler(async (req, res) => {
  const courses = 
}));

module.exports = router;
