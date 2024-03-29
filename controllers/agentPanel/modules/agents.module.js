const fs = require('fs')
const path = require('path')

const bcrypt = require('bcrypt')
/**
 * Intialize required models.
 */
const {Agent, AgentDocuments, sequelize, Transactions} = require('../../../models')

/**
 * INITIALIZE auth admin controller to undo file upload
 */

const agentAuth = require('../../agent.auth.controller')

/**
 * Call common controller with all functions.
 */

const commonController = require('../../common/commonFuncs')
/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns all agents or agent by id stored in db.
 */
exports.index = async (req, res) => {
    try {
        let id = req.agent ? req.agent.id : req.params?.id
        if(id) { 
            /**
             * Find agent by id.
             */
            var agents = await Agent.findByPk(id, {
                include: AgentDocuments,
                attributes: {
                    exclude: ['password']
                }
            })
            if(!agents) {
                return commonController.catchError(res, '404 Agent not found!', 404)
            }
            agents.logo = agents.logo?`${process.env.BASE_URL}/agents/logos/${agents.logo}`:agents.logo
            if(agents.AgentDocuments) {
                let agentDocuments = agents.AgentDocuments.map(d => {
                    d.url = d.url?`${process.env.BASE_URL}/agents/documents/${agents.id}/${d.url}`:d.url
                    return d
                })
                agents.AgentDocuments = agentDocuments
            }
        }else{
            /**
             * Find All agents registered.
             */
            let allAgents = await Agent.findAll({
                order: [
                    ['id', 'DESC']
                ],
                include: AgentDocuments,
                attributes: {
                    exclude: ['password']
                }
            })

            var agents = allAgents.map((agent) => {
                agent.logo = agent.logo?`${process.env.BASE_URL}/agents/logos/${agent.logo}`:agent.logo
                if(agent.AgentDocuments) {
                    let agentDocuments = agent.AgentDocuments.map(d => {
                        d.url = d.url?`${process.env.BASE_URL}/agents/documents/${agent.id}/${d.url}`:d.url
                        return d
                    })
                    agent.AgentDocuments = agentDocuments
                }
                return agent
            })
        }
        /**
         * Sending response back to admin.
         */
        return commonController.sendSuccess(res, "Agent/s fetched successfully!", agents)
    } catch (error) {
        return commonController.catchError(res, error)
    }
}


/**
 * 
 * @param {params.id, body} req 
 * @param {success: boolean, message: string, data: object} res 
 * @returns 
 */
exports.update = async (req, res) => {
    /**
     * Initialize db transactions
     */
    const dbTransaction = await sequelize.transaction()
    try {
        /**
         * get id from params
         */
        let id = req.agent ? req.agent.id : req.params?.id
        /**
         * Body from request
         */
        let body = req.body
        /**
         * Check if agent exist or not
         */

        let agent = await Agent.findByPk(id)
        if(!agent) {
            return res.status(404).send({
                success: false,
                message: 'Agent not found!'
            })
        }
        /**
         * Update values to db
         */
        agent.mobile = body.mobile ? body.mobile : agent.mobile
        agent.email = body.email ? body.email : agent.email
        agent.landline = body.landline ? body.landline : agent.landline
        agent.country = body.country ? body.country : agent.country
        agent.city = body.city ? body.city : agent.city
        agent.travelAgentId = body.travelAgentId ? body.travelAgentId : agent.travelAgentId
        agent.representativeName = body.representativeName ? body.representativeName : agent.representativeName
        agent.akama = body.akama ? body.akama : agent.akama
        agent.status = body.status ? body.status : agent.status
        agent.creditLimit = body.creditLimit ? body.creditLimit : agent.creditLimit
        agent.serviceCharges = body.serviceCharges ? body.serviceCharges : agent.serviceCharges
        agent.serviceChargesType = body.serviceChargesType ? body.serviceChargesType : agent.serviceChargesType
        agent.companyName = body.companyName ? body.companyName : agent.companyName
        await agent.save()
        /**
        * Confirm transactions and save data to db
        */
        await dbTransaction.commit()
         /**
         * delete password string.
        */
         delete agent.dataValues.password
         /**
          * Convert logo to public url
          */
         agent.logo = agent.logo?`${process.env.BASE_URL}/agents/logos/${agent.logo}`:agent.logo
        /**
         * Send response back.
         */
        
        return commonController.sendSuccess(res, "Agent updated successfully!", agent)
    } catch (error) {
        await dbTransaction.rollback()
        return commonController.catchError(res, error)
    }
}


/**
 * 
 * @param {params.id: int} req 
 * @param {success: boolean, message: string} res 
 * @returns 
 */
exports.delete = async (req, res) => {
    /**
     * Initialize db transactions
     */
    const dbTransaction = await sequelize.transaction()
    try {
        /**
         * get id from params
         */
        let id = req.params.id

        /**
         * Check if agent exist or not
         */

        let agent = await Agent.findByPk(id, { dbTransaction })
        if(!agent) {
            return res.status(404).send({
                success: false,
                message: 'Agent not found!'
            })
        }


        /**
         * Destroy Agent from records.
         */
        await Agent.destroy({
            where: {
                id: id
            }
        }, { dbTransaction })

        /**
         * Remove All documents it includes.
         */
        await AgentDocuments.destroy({
            where: {
                agentId: id
            }
        }, { dbTransaction })
        
        

        /**
         * Remove the directory of agent documents from filesystems.
         */
        let directoryPath = path.resolve(__dirname, `../../../public/agents/documents/${id}/`)
        await fs.promises.rm(directoryPath, { recursive: true }, (err) => {
            if (err) {
                console.error(`Error removing directory: ${err}`);
            } else {
                console.log(`Directory ${directoryPath} removed successfully`);
            }
        });
        /**
         * Commit the changes to database.
         */
        await dbTransaction.commit();


        /**
         * Return the delete success response response
         */
        return commonController.sendSuccess(res, `Agent <b><u>${agent.representativeName}</u></b> with akama number <b><u>${agent.akama}</b></u> removed successfully!`)
    } catch (error) {
        /**
         * roll back changes made to db
         */
        await dbTransaction.rollback()
        return commonController.catchError(res, error)
    }
}

/**
 * 
 * @param {body} req 
 * @param {success: boolean, message: string, data: object} res 
 * @returns {
 *      success: boolean,
 *      message: string,
 *      data: object
 * }
 */
exports.create = async (req, res) => {
    /**
     * Initialize db transaction
     */
    const dbTransaction = await sequelize.transaction()
    try {
        /**
         * fetch body from request
        */
        const body = req.body
        /**
         * Hash the password
         */
        body.password = await bcrypt.hash(body.password, 12)
        
        /**
         * Create agent and save it to db
         */
        let agent = await Agent.create({
            mobile: body.mobile ? body.mobile : null ,
            email: body.email ? body.email : null,
            landline: body.landline ? body.landline : null,
            country: body.country ? body.country : null,
            city: body.city ? body.city : null,
            travelAgentId: body.travelAgentId ? body.travelAgentId : null,
            akama: body.akama ? body.akama : null,
            representativeName: body.representativeName ? body.representativeName : null,
            password: body.password,
            status : body.status ? body.status : null,
            creditLimit : body.creditLimit ? body.creditLimit : null,
            serviceCharges : body.serviceCharges ? body.serviceCharges : null,
            serviceChargesType : body.serviceChargesType ? body.serviceChargesType : null,
            companyName : body.companyName ? body.companyName : null,
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
                await fs.promises.mkdir(logoTargetDir, { recursive: true });
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
         * delete password string.
        */
         delete agent.dataValues.password
         /**
          * Convert logo to public url
          */
         agent.logo = agent.logo?`${process.env.BASE_URL}/agents/logos/${agent.logo}`:agent.logo
 
         /**
          * Send response
         */

         return commonController.sendSuccess(res, "Agent created successfully!", agent)
    } catch (error) {
        /**
         * Roll back transactions if any error occured.
         */
        await dbTransaction.rollback()
        agentAuth.removeFilesUploaded(req)
        return commonController.catchError(res, error)
    }
}


/**
 * Agent logo update
 */
exports.logoUpdate = async (req, res) => {
    /**
     * Initialize db transaction
     */
    const dbTransaction = await sequelize.transaction()
    try {
        /**
         * fetch id from request
        */
        let id = req.agent ? req.agent.id : req.params?.id
        /**
         * Check if agent exist or not
         */

        let agent = await Agent.findByPk(id, { dbTransaction })
        if(!agent) {
            return res.status(404).send({
                success: false,
                message: 'Agent not found!'
            })
        }
 
        
        
        /**
        * Move uploaded logo to appropriate destinations and remove the old logo.
        */
        if(req.files['logo'] && req.files['logo'].length > 0) {
            let logoFile = req.files['logo'][0]
            var oldLogo = agent.logo
            var logoTargetDir = logoFile.destination+'/agents/logos/'
            // Create the target directory if it doesn't exist
            if (!fs.existsSync(logoTargetDir)) {
                await fs.promises.mkdir(logoTargetDir, { recursive: true });
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
         * Remove old logo if exist
         */
        if(oldLogo){
            fs.unlinkSync(logoTargetDir+oldLogo)
        }

         /**
         * delete password string.
        */
         delete agent.dataValues.password
         /**
          * Convert logo to public url
          */
         agent.logo = agent.logo?`${process.env.BASE_URL}/agents/logos/${agent.logo}`:agent.logo
 
         /**
          * Send response
         */
        return commonController.sendSuccess(res, "Agent logo updated successfully!", agent)
    } catch (error) {
        /**
         * Roll back transactions if any error occured.
         */
        await dbTransaction.rollback()
        agentAuth.removeFilesUploaded(req)
        return commonController.catchError(res, error)
    }
}

/**
 * Remove Logo
 */
exports.logoRemove = async (req, res) => {
    /**
     * initialize transaction
     */
    const dbTransaction = await sequelize.transaction()
    try {
        let id = req.agent ? req.agent.id : req.params?.id
        /**
         * Fetch agent from db based on id.
         */
        let agent = await Agent.findByPk(id, {
            attributes: {
                exclude: ['password']
            }
        }, { dbTransaction })

        /**
         * Check if agent exists or not
         */

        if( !agent ) {
            return commonController.catchError(res, "Agent not found!", 404)
        }

        /**
         * check logo
         */
        if( !agent.logo ) {
            return commonController.catchError(res, "No logo attached with agent.", 404)
        }

        /**
         * remove logo and update the logo path as null
         */
        let logoPath = path.resolve(__dirname, `../../../public/agents/logos/${agent.logo}`)
        if(fs.existsSync(logoPath)) {
            await fs.promises.unlink(logoPath)
        }

        agent.logo = null

        await agent.save({ dbTransaction })

        /**
         * Commit the transaction
         */

        await dbTransaction.commit()

        /**
         * Send response!
         */
        return commonController.sendSuccess(res, "Logo removed successfully!", agent)
    } catch (error) {
        /**
         * Rollback changes
         */
        await dbTransaction.rollback()
        return commonController.catchError(res, error)
    }
}

/**
 * Top up of agent account by admin
 * we can edit this method once we are ready to implement real payments
 */
exports.topup = async (req, res) => {
    let body = req.body
    const dbTransaction = await sequelize.transaction()
    try {
        let trx_id = trxId()
        /**
         * Check if agent exists or not
         */
        let agent = await Agent.findByPk(body.agent_id)
        if(!agent) {
            return commonController.catchError(res, 'Agent not found!')
        }
        let transaction = await Transactions.create({
            trx_id: trx_id,
            agentId: body.agent_id,
            topped_up_by: req.admin.id,
            balance: body.balance,
            description: body?.description,
            transaction_type: body.type
        }, { transaction: dbTransaction })

        agent.wallet = transaction.transaction_type === 'credit' ? parseFloat(agent.wallet) + transaction.balance : parseFloat(agent.wallet) - transaction.balance
        console.log(agent)
        await agent.save() // update the wallet of agent
        dbTransaction.commit()

        return commonController.sendSuccess(res, `Balance of amount ${body.balance} ${body.type}ed successfully to agent ${agent.representativeName}!`, transaction)
    } catch (error) {
        await dbTransaction.rollback()
        return commonController.catchError(res, error)
    }
}

const trxId = (length = 10) => {
    // Generate a random string of characters and numbers
    const randomString = Math.random().toString(36).substring(2, length+2);
    // Combine the random string and timestamp to create a unique transaction ID
    const transactionId = `trx-${randomString}`;

    return transactionId;
}