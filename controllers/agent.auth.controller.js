const {Agent, sequelize, AgentDocuments} = require('../models');
const config = require("../config/auth.config");
const bcrypt = require('bcrypt');
const  jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
/**
 * Call common controller with all functions.
 */

const commonController = require('./common/commonFuncs')

exports.login = async (req, res) => {
    try {
        /**
         * fetch body from request
        */
        const body = req.body
    
        /**
         * Fetch agent based on email
        */
        const agent = await Agent.findOne({
            where: {
                email: body.email
            }
        })
        if(!agent) {
            return commonController.catchError(res, "Agent not Registered!", 404)
        }
        /**
         * Check if password matches or not.
         */
        if(!bcrypt.compareSync(body.password, agent.password)) {
            return commonController.catchError(res, "Invalid email/password combination", 400)
        }

        /**
         * Send agent detail to function generateToken() to get jwt token
         */
        agent.dataValues.accessToken = await generateToken(agent)
        /**
         * Send response
        */
        delete agent.dataValues.password
        /**
         * Convert logo to public url
         */
        agent.logo = agent.logo?`${process.env.BASE_URL}/agents/logos/${agent.logo}`:agent.logo

        /**
         * Send response
        */
        return commonController.sendSuccess(res, "Agent Loggedin successfully!", agent)
    } catch (error) {
        return commonController.catchError(res, error)
    }
}

exports.register = async (req, res) => {
    /**
     * Start db transactions for data integrity and if any error is there then rollback db changes.
     */
    const dbTransaction = await sequelize.transaction()
    try {
       /**
        * fetch body from request
       */
       const body = req.body
   
       /**
        * CHeck if password matches or not.
        */
       if(body.password !== body.confirm_password) { 
            /**
             *Rollback the uploaded files. 
            */
            removeFilesUploaded(req)
            return commonController.catchError(res, "Password doesnt match!", 409)
       }
       /**
        * Hash the password
        */
       body.password = await bcrypt.hash(body.password, 12)
       
       /**
        * Create agent and save it to db
        */
       let agent = await Agent.create({
            email: body.email,
            landline: body.landline || null,
            mobile: body.mobile,
            country: body.country || null,
            city: body.city || null,
            travelAgentId: body.travelAgentId,
            akama: body.akama,
            representativeName: body.representativeName,
            password: body.password
       }, { dbTransaction })

       

       
       /**
        * Move uploaded files to appropriate desctinations.
        */
       if(req.files['documents'] && req.files['documents'].length > 0) {
           let documents = req.files['documents']
            for (let i = 0; i < documents.length; i++) {
                const doc = documents[i];
                let docTargetDir = doc.destination+'/agents/documents/'+agent.id+'/'
                // Create the target directory if it doesn't exist
                if (!fs.existsSync(docTargetDir)) {
                    // fs.mkdirSync(docTargetDir);
                    await fs.promises.mkdir(docTargetDir, { recursive: true }); // Create the target directory recursively
                }
                /**
                 * Rename the file to add extension.
                 */
                let docFilename = doc.filename+path.extname(doc.originalname)
                await fs.promises.rename(doc.path, docTargetDir + docFilename); // Move document
                

                let docName = path.basename(doc.originalname, path.extname(doc.originalname));
                await AgentDocuments.create({
                    name: docName,
                    url: docFilename,
                    agentId: agent.id
                }, { dbTransaction })
                
                //    fs.renameSync(doc.path,docTargetDir+doc.filename) //Moving document
            }
       }


        /**
        * Move the uploaded files to final destinations
        */
        if(req.files['logo'] && req.files['logo'].length > 0) {
            let logoFile = req.files['logo'][0]
            let logoTargetDir = logoFile.destination+'/agents/logos/'
            // Create the target directory if it doesn't exist
             if (!fs.existsSync(logoTargetDir)) {
                await fs.promises.mkdir(logoTargetDir);
             }
            let logo = logoFile.filename+path.extname(logoFile.originalname)
            await fs.promises.rename(logoFile.path,logoTargetDir+logo) //Moving logo
            agent.logo = logo
            await agent.save({ dbTransaction })
        }

       /**
        * Confirm transactions and save data to db
        */
       await dbTransaction.commit()


        /**
         * Send agent detail to function generateToken() to get jwt token
         */
        agent.dataValues.accessToken = await generateToken(agent)
        /**
         * Send response
        */
        delete agent.dataValues.password
        /**
         * Convert logo to public url
         */
        agent.logo = agent.logo?`${process.env.BASE_URL}/agents/logos/${agent.logo}`:agent.logo

        /**
         * Send response
        */
        return commonController.sendSuccess(res, "Agent registered successfully!", agent)
   } catch (error) {
        /**
         * Roll back transactions if any error occured.
         */
        await dbTransaction.rollback()
        removeFilesUploaded(req)
        return commonController.catchError(res, error)       
   }
}


const generateToken = async (agent) => {
    return jwt.sign({ id: agent.id, role: "agent" }, config.secret, {
        expiresIn: 2*24*60*60 // 2 days
    });
}


const removeFilesUploaded = (req) => {
    if(req.files['logo']) {
        let file = req.files['logo'][0]
        fs.unlinkSync(file.path)
    }

    if(req.files['documents']) {
        let docs = req.files['documents']
        docs.forEach(doc => {
            fs.unlinkSync(doc.path)
        });
    }
}

exports.removeFilesUploaded = (req) => {
    removeFilesUploaded(req)
}