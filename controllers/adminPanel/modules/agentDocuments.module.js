const fs = require('fs')
const path = require('path')

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
        let agentId = req.params.agent_id
        
        /**
         * Get agent from agent_id
         */
        let agent = await Agent.findByPk(agentId)
        if( !agent ) {
            return commonController.catchError(res, "Agent not found!", 404)
        }
        
        
        /**
        * Move uploaded files to appropriate destinations.
        */
        if(req.files['documents'] && req.files['documents'].length > 0) {
            let documents = req.files['documents']
            for (let i = 0; i < documents.length; i++) {
                const doc = documents[i];
                let docTargetDir = doc.destination+'/agents/documents/'+agentId+'/'
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
                    agentId: agentId
                }, { dbTransaction })
            }
        }

        /**
         * Confirm transactions and save data to db
        */
        await dbTransaction.commit()

        /**
         * Fetch all documents
         */
        let documents = await AgentDocuments.findAll({
            where: {
                agentId: agentId
            }
        })

        let agentDocuments = documents.map(d => {
            d.url = d.url?`${process.env.BASE_URL}/agents/documents/${agentId}/${d.url}`:d.url
            return d
        })
 
        /**
         * Send response
        */
        return commonController.sendSuccess(res, "Agent's Documents saved successfully!", agentDocuments)
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
 * Remove Document by id
 */

exports.remove = async (req, res) => {
    /**
     * Initialize db transaction
     */
    const dbTransaction = await sequelize.transaction()

    try {
        /**
         * Fetch id from parameters
         */
        let docId = req.params.document_id
        let agentId = req.params.agent_id
    
        /**
         * check agent via agentId
         */
    
        let agent = await Agent.findByPk(agentId)
    
        if( !agent ) {
            return commonController.catchError(res, "Agent not found!", 404)
        }
        
        /**
         * Check document by id
         */
        let document = await AgentDocuments.findOne({
            where: {
                id: docId,
                agentId: agentId
            } 
        })

        if( !document ) {
            return commonController.catchError(res, "Document not found!", 404)
        }

        /**
         * Run query to remove record from db
         */

        await AgentDocuments.destroy({
            where: {
                id: docId
            }
        }, { dbTransaction })

        /**
         * Remove document from file directory.
         */
        let docDir = path.resolve(__dirname, `../../../public/agents/documents/${document.agentId}/${document.url}`)
        await fs.promises.unlink(docDir)

        /**
         * Commit db transaction
         */
        await dbTransaction.commit()

        /**
         * Return the response.
         */
        return commonController.sendSuccess(res, "Document removed successfully!")
    } catch (error) {
        /**
         * Roll back db transactions
         */
        await dbTransaction.rollback()
        return commonController.catchError(res, error)
    }
}


/**
 * Get all documents.
 */

exports.index = async (req, res) => {
    try {
        let agentId = req.params.agent_id
        let documents = await AgentDocuments.findAll({
            where: {
                agentId
            }
        })
        return commonController.sendSuccess(res, "Agent docs fetched successfully!", documents) 
    } catch (error) {
        return commonController.catchError(res, error)
    }
}