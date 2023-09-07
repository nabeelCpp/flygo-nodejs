exports.catchError = (res, error, status = 500) => {
    return res.status(status).send({
        success: false,
        errors: error.errors ? error.errors.map(e => e.message) : (error.message ? [error.message] : [error])
    })
}

exports.sendSuccess = (res, message, data = [], status = 200) => {
    return res.status(status).send({
        success: true,
        message,
        data
    })
}