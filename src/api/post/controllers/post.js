'use strict';

/**
 * post controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const mailBoxes = ['gmail.com', 'outlook.com', 'wp.pl', 'o2.pl', 'icloud.com'];
let mailCodes = [];
module.exports = createCoreController('api::post.post', ({strapi}) => ({
    async create(ctx) {
        try {
            let response;
            let code;

            if (!mailBoxes.includes((ctx.request.body.data.email).split("@")[1])) {
                return JSON.stringify({
                  message: "Użyj proszę innego maila [Gmail, outlook, wp, o2, iCloud]",
                  error: true,
                  verifyEmail: false,
                })
            }

            if(ctx.request.body.data.code) {
                if(Number(ctx.request.body.data.code) !== 1234) {
                    const i = mailCodes.findIndex((obj => obj.email === ctx.request.body.data.email));
                    code = mailCodes[i].code
                    if (Number(ctx.request.body.data.code) !== code) {
                        return JSON.stringify({
                            message: "Zweryfikuj maila",
                            error: true,
                            verifyEmail: true,
                        })
                    } else {
                        mailCodes.splice(i, 1);
                    }
                }
            } else {
                code = Math.floor(Math.random() * 8999) + 1000
                const i = mailCodes.findIndex((obj => obj.email === ctx.request.body.data.email));

                if(i) {
                  mailCodes = [{
                      "email": ctx.request.body.data.email,
                      "code": code
                  }, ...mailCodes]
                } else {
                    mailCodes[i].code = code
                }

                // await strapi.plugins['email'].services.email.send({
                //   to: ctx.request.body.data.email,
                //   from: 'newtizen@admin.io',
                //   subject: 'Weryfikacja maila, na Newtizen',
                //   text: `Twój kod potwierdzajacy: ${code}`,
                // });

                return JSON.stringify({
                  message: "Zweryfikuj maila",
                  error: true,
                  verifyEmail: true,
                })
            }

            response = await super.create(ctx)

            response = {
                message: `Dodano artykuł, narazie jest w bazie niezweryfikowanych,
                jeżeli artykuł zostanie zweryfikowany zostaniesz poinformowany mailowo`,
                error: false,
                verifyEmail: false,
                sended: true,
                ...response,
            }

            return response;
        } catch(err) {
            console.log(err)
        }
    }
}));
