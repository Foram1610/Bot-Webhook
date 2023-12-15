
const axios = require("axios");
exports.handleUncaughtExceptions = () => {
    try {
        let exceptionCount
        process.on('uncaughtException', (ex) => {
            console.log("Node Process Started")
            if (exceptionCount > 0) {
                // While trying to process the uncaught exception, we threw an exception.
                // Just give up. :-(
                process.exit(1);
            }
            exceptionCount += 1;
            // list to contain various part of the email body
            const messages = ['Error!'];

            let err = ex;

            // if the exception has the error object then
            // we assume it comes from the custom made error object from the
            // intercepted middlewire.
            if (ex.req) {
                console.log("Node Process Started")
                const { req, err: error } = ex;
                // Re-assign the error object to the actual error object.
                err = error;
                // Prepraing the full URL of the request.
                const fullUrl = `${req.protocol}://${req.headers.host}${req.url}`;

                const headerInfo = Object.entries(req.headers)
                    .map(([key, value]) => (`${key}: ${value}`))
                    .join('\n\n');

                messages.push(fullUrl, headerInfo.join('\n\n'));
            }

            // Making the whole body with request parameters.
            messages.push(err.stack);

            function sendErrorEmail() {
                try {
                    const request = axios.post(
                        "https://hook.eu1.make.com/nxbyuc26m2qoey6fhebhppsgte975wj9",
                        {
                            subject: "Error",
                            text: messages
                        }
                    );
                } catch (error) {
                    console.log(error)
                }
                console.log(err)
            }
            sendErrorEmail()
        });
    } catch (error) {
        console.log(error)
    }

}



