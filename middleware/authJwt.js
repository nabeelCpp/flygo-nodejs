/**
 * load Required libraries like jwt
 */
const jwt = require("jsonwebtoken");

/**
 * Configurations for jwt secret.
 */
const config = require("../config/auth.config.js");

/**
 * Load required models
 * */
const {User, Agent, Admin} = require("../models");


/**
 * Check if token is added to headers while recieving requests.
 */
verifyToken = (req, res, next) => {
  if(!req.headers["authorization"]){
    return res.status(403).send({
      message: 'Authorization token is required'
    })
  }
  let token = req.headers["authorization"].split(" ")[1];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    req.userId = decoded.id;
    req.role = decoded.role;
    next();
  });
};


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns if admin is authenticated or not.
 */
const isAdmin = (req, res, next) => {
  if(req.role == 'admin'){
    Admin.findByPk(req.userId, {
      attributes: { exclude: ['password'] },
    }).then(admin => {
      if(admin){
        req.admin = admin;
       next();
       return; 
      }
      res.status(404).send({
        message: "No Admin found!"
      });
      return;
    })
  }else{
    res.status(403).send({
      message: "Require Admin Role!"
    });
    return;
  }
};


/**
 * Used to check if token is verified user token or not
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns nothing if everything goes smooth. If any issue then it will return the message to user.
 */
const isUser = (req, res, next) => {
  if(req.role == 'user'){
    User.findByPk(req.userId, {
      attributes: { exclude: ['password'] },
    }).then(user => {
      if(user){
        req.user = user;
       next();
       return; 
      }
      res.status(404).send({
        message: "No user found!"
      });
      return;
    })
  }else{
    res.status(403).send({
      message: "Require User Role!"
    });
    return;
  }
};


/**
 * Used to check if token is verified agent token or not
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns nothing if everything goes smooth. If any issue then it will return the message to agent.
 */
const isAgent = (req, res, next) => {
  if(req.role == 'agent'){
    Agent.findByPk(req.userId, {
      attributes: { exclude: ['password'] },
    }).then(agent => {
      if(agent){
        req.agent = agent;
       next();
       return; 
      }
      res.status(404).send({
        message: "No Agent found!"
      });
      return;
    })
  }else{
    res.status(403).send({
      message: "Require Agent Role!"
    });
    return;
  }
};





const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
  isUser: isUser,
  isAgent: isAgent,
};
module.exports = authJwt;