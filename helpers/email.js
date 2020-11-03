exports.registerEmailParams = (email, token) => {
    return {
        Source: process.env.EMAIL_FROM,
        Destination: {
            ToAddresses: [email]
        },
        ReplyToAddresses: [process.env.EMAIL_TO],
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: `
                    <html>
                    <body>
                        <h1>Verify your email address</h1>
                        <p>Please use the following link to complete you registration</p>
                        <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
                    </body>
                    </html>
                    `
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Complete your registration'
            }
        }
    }
}

exports.forgotPasswordEmailParams = (email, token) => {
    return {
        Source: process.env.EMAIL_FROM,
        Destination: {
            ToAddresses: [email]
        },
        ReplyToAddresses: [process.env.EMAIL_TO],
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: `
                    <html>
                    <body>
                        <h1>Reset Password Link</h1>
                        <p>Please use the following link to reset your password</p>
                        <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                    </body>
                    </html>
                    `
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Reset your password'
            }
        }
    }
}

exports.linkPublishedParams = (email, data) => {
    return {
        Source: process.env.EMAIL_FROM,
        Destination: {
            ToAddresses: [email]
        },
        ReplyToAddresses: [process.env.EMAIL_TO],
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: `
                    <html>
                    <body style="height: 100%">
                        <h1>New link published | hackrlinks.com</h1>
                        <p>A new link titled <b>${data.title}</b> has been published in the following categories:</p>
                        ${data.categories.map( c => {
                            return `
                                <div>
                                    <h2>${c.name}</h2>
                                    <img src="${c.image.url}" alt="${c.name}" style="height: 50%; width: 100%;"/>
                                    <h3><a href="${process.env.CLIENT_URL}/links/${c.slug}">Check out the link</a>
                                </div>
                            `
                        }).join('--------------------')}

                        <br />
                        <p>Turn off notifications <b>Dashboard </b>, update profile and uncheck the categories </p>
                        <p>${process.env.CLIENT_URL}/user/profile/update</p>
                    </body>
                    </html>
                    `
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'New Link Published'
            }
        }
    }
}