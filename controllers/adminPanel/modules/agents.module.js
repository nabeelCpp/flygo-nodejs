const fs = require('fs')
const path = require('path')

const bcrypt = require('bcrypt')
/**
 * Intialize required models.
 */
const {Agent, AgentDocuments, sequelize} = require('../../../models')

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
        let id = req.params?.id
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
        }else{
            /**
             * Find All agents registered.
             */
            let allAgents = await Agent.findAll({
                include: AgentDocuments,
                attributes: {
                    exclude: ['password']
                }
            })

            var agents = allAgents.map((agent) => {
                agent.logo = agent.logo?`${process.env.BASE_URL}/agents/logos/${agent.logo}`:agent.logo
                return agent
            })
        }
        /**
         * Sending response back to admin.
         */
        return res.send(agents)
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
        let id = req.params.id
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
        agent.landline = body.landline ? body.landline : agent.landline
        agent.country = body.country ? body.country : agent.country
        agent.city = body.city ? body.city : agent.city
        agent.travelAgentId = body.travelAgentId ? body.travelAgentId : agent.travelAgentId
        agent.representativeName = body.representativeName ? body.representativeName : agent.representativeName
        agent.akama = body.akama ? body.akama : agent.akama
        agent.status = body.status ? body.status : agent.status
        agent.creditLimit = body.creditLimit && body.creditLimit
        agent.serviceCharges = body.serviceCharges && body.serviceCharges
        agent.serviceChargesType = body.serviceChargesType && body.serviceChargesType
        await agent.save()
        /**
        * Confirm transactions and save data to db
        */
        await dbTransaction.commit()
        /**
         * Send response back.
         */
        return res.send({
            success: true,
            message: "Agent updated successfully!",
            data: agent
        })
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

        return res.send({
            success: true,
            message: `Agent <b><u>${agent.representativeName}</u></b> with akama number <b><u>${agent.akama}</b></u> removed successfully!`
        })
        

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
            serviceChargesType : body.serviceChargesType ? body.serviceChargesType : null
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
          * Send response
         */
         return res.send({
             success: true,
             message: "Agent created successfully!",
             data: agent
         })
    } catch (error) {
        /**
         * Roll back transactions if any error occured.
         */
        await dbTransaction.rollback()
        agentAuth.removeFilesUploaded(req)
        return commonController.catchError(res, error)
    }
}