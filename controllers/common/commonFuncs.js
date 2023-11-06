const { SabreToken } = require('../../models')
exports.catchError = (res, error, status = 500) => {
    return res.status(200).send({
        success: false,
        errors: error.errors ? error.errors.map(e => e.message) : (error.message ? [error.message] : ( Array.isArray(error) ? error : [error] ) )
    })
}

exports.sendSuccess = (res, message, data = [], status = 200) => {
    return res.status(status).send({
        success: true,
        message,
        data
    })
}

exports.sendResponseWithError = async (res, error) => {
    // Check if there is accessToken issue then destroy it by setting its expiry to 0. System will regenerate the token again on next call.
    if(error.response && error.response.data && error.response.data.errorCode === 'ERR.2SG.SEC.INVALID_CREDENTIALS') {
        await SabreToken.update({
            expiry: 0
        })
    }
    console.log(error.response?error.response:error)
    return this.catchError(res, error.response ? error.response.data : error, error.response?.status)
}