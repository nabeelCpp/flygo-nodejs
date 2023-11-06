const { default: axios } = require('axios')
const { SabreToken } = require('../../models')
const commonController = require('../../controllers/common/commonFuncs')

exports.getAccessToken = async (req, res) => {
    // fetch record from db.
    const sabreAuthFromDb = await SabreToken.findOne()
    // Check if record exist or not.
    if( !sabreAuthFromDb ){
        // Fetch new token from API and save it to db. 
        // REST OAuth Token Create /v2
        let responseFromSabreAuthAPi = await callRestOauthTokenCreate()
        if(responseFromSabreAuthAPi.status === 200) {
            // save the token to db
            let apiData = responseFromSabreAuthAPi.data
            SabreToken.create({
                accessToken: apiData.access_token,
                expiry: new Date().getTime() + apiData.expires_in - (24 * 60 * 60)  // set the expiry for 6 days for secuirty purpose. We will refresh the token once the token is been used for 6 days. API giving us 7 days expiry but we will use 6 days for safe side. (1 day = 24 hrs * 60 mins * 60 secs)
            })
        }
        return responseFromSabreAuthAPi
    }

    // If token already exists in db then check its expiry.
    if(new Date().getTime() < parseInt(sabreAuthFromDb.expiry) ) {
        return { 
            status: 200,  
            data: { 
                access_token: sabreAuthFromDb.accessToken 
            } 
        }
    }else{
        // generate new token and update it to db with new expiry.
        // Fetch new token from API and save it to db. 
        // REST OAuth Token Create /v2
        let responseFromSabreAuthAPi = await callRestOauthTokenCreate()
        if(responseFromSabreAuthAPi.status === 200) {
            // save the token to db
            let apiData = responseFromSabreAuthAPi.data
            sabreAuthFromDb.accessToken = apiData.access_token
            sabreAuthFromDb.expiry = new Date().getTime() + apiData.expires_in - (24 * 60 * 60)
            sabreAuthFromDb.save()
        }
        return responseFromSabreAuthAPi
    }
}

const callRestOauthTokenCreate = async () => {
    // Create secret
    try {
        let base64EncodedSabreUsernamePcc = Buffer.from(`V1:${process.env.SABRE_USERNAME}:${process.env.SABRE_PCC}:AA`).toString('base64')
        let base64EncodedSabrePassword = Buffer.from(`${process.env.SABRE_PASSWORD}`).toString('base64')
        let secret = Buffer.from(`${base64EncodedSabreUsernamePcc}:${base64EncodedSabrePassword}`).toString('base64')
        let response = await axios.post(`${process.env.SABRE_URL}/v2/auth/token`, {
            grant_type: 'client_credentials'
        }, {
            headers: {
                Authorization: `Basic ${secret}`,
                'Content-Type' : 'application/x-www-form-urlencoded'
            }
        })
        return response
    } catch (error) {
        console.log(error)
        return { data: error.response.data, status: error.response.status }
    }
}