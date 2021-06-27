const ApiResponse = (status,msg,data) => {
    return {
        status: status,
        message: msg,
        data: data
    }
}

module.exports = {
    ApiResponse
}