/*
============================================
; APIs for the email
;===========================================
*/

const express = require("express");
const BaseResponse = require("../models/base-response");
const router = express.Router();
const Order = require("../models/order");
const checkAuth = require("../middleware/check-auth");
const Client = require("../models/client");

const nodemailer = require('nodemailer');
//const { google } = require('googleapis');
const Imap = require('node-imap');
const inspect = require('util').inspect;
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const quotedPrintable = require('quoted-printable');
//const simpleParser = require('mailparser').simpleParser;

router.post("/send-email", checkAuth, async (req, res) => {
    try {
        console.log(req.body.domainName);
        const emailData = {
            domainName: req.body.domainName,
            clientEmail: req.body.clientEmail,
            // clientName: "Оксана",
            subject: req.body.subject,
            text: req.body.text,
            html: req.body.html,
        }

        let finalResult = await sendEmail(emailData);
        console.log(finalResult);

        const newListResponse = new BaseResponse(200, finalResult);
        res.json(newListResponse.toObject());
    } catch (e) {
        console.log(e);
        let text = 'Обратитесь к администратору. Email не отправлен.';

        const newListCatchErrorResponse = new BaseResponse(
            500,
            text,
            e
        );
        res.status(500).send(newListCatchErrorResponse.toObject());
    }
});

async function sendEmail(emailData) {
    console.log("emailData");
    console.log(emailData);

    let transporter;
    let info;

    if (emailData.domainName == "yandex") {
        transporter = nodemailer.createTransport({
            host: "smtp.yandex.ru",
            port: 465,
            secure: true, // true for port 465, false for other ports
            auth: {
                user: process.env.YANDEX_USERNAME,
                pass: process.env.YANDEX_PASSWORD,
            },
            logger: true
        });
        info = await transporter.sendMail({
            from: '"Оксана Кустова" <o.kustova@starikam.org>', // sender address
            to: emailData.clientEmail, // list of receivers
            bcc: "o.kustova@starikam.org",
            subject: emailData.subject, // Subject line
            text: emailData.text,// plain text body
            html: emailData.html // html body
        });


    }
    if (emailData.domainName == "google") {
        transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // true for port 465, false for other ports
            auth: {
                user: process.env.GOOGLE_USERNAME,
                pass: process.env.GOOGLE_PASSWORD,
            },
            logger: true
        });

        info = await transporter.sendMail({
            from: '"Оксана Кустова" <okskust@gmail.com>', // sender address
            to: emailData.clientEmail, // list of receivers
            //bcc: "okskust@gmail.com",
            subject: emailData.subject, // Subject line
            text: emailData.text,// plain text body
            html: emailData.html // html body
        });
    }



    // verify connection configuration
    /*     transporter.verify(function (error, success) {
            if (error) {
                console.log(error);
    
            } else {
                console.log("Server is ready to take our messages");
    
            }
        }); */

    // send mail with defined transport object

    console.log(info);
    return `Письмо отправлено, ID - ${info.messageId}.`

}


/* 
function findValueOfKey(arr, key) {

    for (let item of arr) {
        console.log("item");
        console.log(item);

        if (Array.isArray(item) && item.length == 1) {
            console.log("item[0][key]");
            console.log(item[0][key]);
            return item[0][key];
        }
        if (Array.isArray(item)) {
            findValueOfKey(item, key);
        }
    }
    return false;
} */


function findValueOfKey(arr, key) {
      console.log("arr");
     console.log(arr);

    if (arr.length == 1) {
          console.log("arr[0][key]");
         console.log(arr[0][key]);
        return arr[0][key];

    } else if (Array.isArray(arr[0])) {
        console.log("arr[0]");
        return findValueOfKey(arr[0], key);
    } else {
        console.log("arr[1]");
        return findValueOfKey(arr[1], key);
    }

}

router.get("/fetch-email/:domain", checkAuth, async (req, res) => {
    try {
        const imap = req.params.domain == "google" ? new Imap({
            user: process.env.GOOGLE_USERNAME,
            password: process.env.GOOGLE_PASSWORD,
            host: 'imap.gmail.com',
            port: 993,
            tls: true
        })
            : new Imap({
                user: process.env.YANDEX_USERNAME,
                password: process.env.YANDEX_PASSWORD,
                host: 'imap.yandex.ru',
                port: 993,
                tls: true
            });

        let resultMessage;
        let arrayOfOrders = [];

        imap.once("ready", () => {
            //console.log("FOO2");
            imap.openBox("UPLOAD", true, (err, box) => {
                if (err) throw err;
                let attributeFlow = imap.seq.fetch(`1:${box.messages.total}`, {
                    //bodies: req.params.domain == "google" ? ["HEADER.FIELDS (FROM SUBJECT)", "1"] : ["HEADER", "1"], // TO  DATE 
                    struct: true
                });


                let emails = [];


                attributeFlow.on("message", (msg, seqno) => {

                    msg.once('attributes', function (attrs) {
                        //console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
                        emails[seqno - 1] = { struct: attrs.struct, messageId: seqno };
                    });
                });

                attributeFlow.once("end", () => {

                    console.log("emails");
                    console.log(emails);

                    let err;

                    for (let mail of emails) {

                        mail.plainId = findValueOfKey(mail.struct, "partID");

                        console.log("mail.plainId");
                        console.log(mail.plainId);

                        if (!mail.plainId) {
                            console.log("inside if (!mail.plainId)");
                            err = true;
                            break;
                        }
                    }


                    if (err) {
                        console.log("ERROR");

                        const errorResponse = new BaseResponse("500", "Internal server error", "Не найдены атрибуты сообщения. Обратитесь к администратору.");
                        res.status(500).send(errorResponse.toObject());
                    } else {
                        emails.forEach((mail) => {
                            console.log("mail.messageId");
                            console.log(mail.messageId);
                            console.log("mail.plainId");
                            console.log(mail.plainId);
                            let f = imap.seq.fetch(mail.messageId, {
                                bodies: req.params.domain == "google" ? ["HEADER.FIELDS (FROM SUBJECT)", mail.plainId] : ["HEADER", mail.plainId], // TO  DATE 
                                struct: true
                            });


                            f.on("message", (msg, seqno) => {
                                console.log(`Message #%d`, seqno);
                                arrayOfOrders[mail.messageId - 1] = {
                                    numberOfMessage: mail.messageId,
                                    color: "black",
                                    backgroundColor: "white",
                                    attributes: mail.struct
                                };

                                let parsedHeader = "";
                                let email = "";

                                let prefix = `(#` + mail.messageId + `)`;

                                msg.on("body", (stream, info) => {
                                    let buffer = "";
                                    stream.on("data", (chunk) => {
                                        // console.log("chunk");
                                        // console.log(chunk);
                                        buffer += chunk.toString("utf8");
                                    });

                                    stream.once("end", () => {
                                        // console.log("BUFFER");
                                        // console.log(buffer);
                                        console.log("info.which");
                                        console.log(info.which);


                                        if (info.which === mail.plainId) {/* + ".TEXT" || info.which === mail.plainId */
                                            console.log(`Message #%d`, mail.messageId);
                                            // console.log("BUFFER");
                                            // console.log(buffer);

                                            arrayOfOrders[mail.messageId - 1].text = buffer;

                                        }
                                        else {
                                            console.log(`Message #%d`, mail.messageId);
                                            // console.log("buffer");
                                            // console.log(buffer);
                                            parsedHeader = Imap.parseHeader(buffer);
                                            const regex = /[^< ]+(?=>)/g;
                                            // console.log("parsedHeader");
                                            // console.log(parsedHeader);

                                            email = parsedHeader.from[0].includes("<") ? regex.exec(parsedHeader.from[0])[0] : parsedHeader.from[0];
                                            console.log("email");
                                            console.log(email);

                                            // console.log(prefix + `Parsed header: %s`, inspect(parsedHeader));
                                            arrayOfOrders[mail.messageId - 1].header = parsedHeader.from[0];
                                            arrayOfOrders[mail.messageId - 1].subject = parsedHeader.subject[0];
                                            arrayOfOrders[mail.messageId - 1].email = email;

                                        }
                                    });

                                });


                            });
                            f.once("error", (err) => {
                                console.log("Fetch error: " + err);
                                resultMessage = "Fetch error: " + err;
                                const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", err);
                                res.status(500).send(findAllListsCatchErrorResponse.toObject());
                                // return resultMessage;
                            });
                            f.once("end", () => {
                                console.log("Done fetching this message!");
                                imap.end();
                                //  console.log("resultMessage");
                                // console.log(resultMessage);

                                //return resultMessage;
                            });
                        });
                    }
                });
                attributeFlow.once("error", (err) => {
                    console.log("Fetch error: " + err);
                    resultMessage = "Fetch error: " + err;
                    const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", err);
                    res.status(500).send(findAllListsCatchErrorResponse.toObject());
                    // return resultMessage;
                });

            });
        });


        imap.once('error', (err) => {
            console.log("err");
            console.log(err);
            resultMessage = "Fetch error: " + err;
            // return resultMessage;
            const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", err);
            res.status(500).send(findAllListsCatchErrorResponse.toObject());
        });


        imap.once("end", () => {
            console.log("Connection ended");
               let err;
            for (let order of arrayOfOrders) {                
                let decodedBody;
               // console.log("attributes");
                //console.log(order.attributes);

                let encoding = findValueOfKey(order.attributes, "encoding");
                /*                 if (order.attributes.length == 1) {
                                    encoding = order.attributes[0].encoding;
                                } else if (order.attributes.length == 2) {
                                    if (order.attributes[1].length == 1) {
                                        encoding = order.attributes[1][0].encoding;
                                    } else {
                                        encoding = order.attributes[1][1][0].encoding;
                                    }
                                } else if (order.attributes.length > 2) {
                                    if (order.attributes[1].length == 1) {
                                        encoding = order.attributes[1][0].encoding;
                                    } else {
                                        console.log("order.attributes[1]");
                                        console.log(order.attributes[1]);
                                        console.log("order.attributes[1][1]");
                                        console.log(order.attributes[1][1]);
                                        encoding = order.attributes[1][1][0].encoding;
                                    }
                                } */
                console.log("encoding");
                console.log(encoding);
             
                if (!encoding) {
                    console.log("inside if (!encoding)");
                    err = true;
                    break;
                }

                if (encoding.toLowerCase() == "quoted-printable") { //QUOTED-PRINTABLE
                    console.log("QUOTED-PRINTABLE");
                    const utf8 = require('utf8');
                    decodedBody = utf8.decode(quotedPrintable.decode(order.text));
                } else {
                    // console.log('order.text');
                    //console.log(order.text);
                    // console.log('Buffer.from(order.text, "base64")');
                    // console.log(Buffer.from(order.text, "base64"));
                    // console.log('Buffer.from(order.text, "base64").toString("utf8")');
                    // console.log(Buffer.from(order.text, "base64").toString("utf8"));
                    decodedBody = Buffer.from(order.text, "base64").toString("utf8");
                }
                const window = new JSDOM('').window;
                const purify = createDOMPurify(window);
                const sanitizedBody = purify.sanitize(decodedBody);
                const cleanBody = sanitizedBody.replace(/(<([^>]+)>)/ig, ' ');
                order.text = cleanBody;
            }

            if (err) {
                console.log("ERROR");

                const errorResponse = new BaseResponse("500", "Internal server error", "Не найдены атрибуты сообщения. Обратитесь к администратору.");
                res.status(500).send(errorResponse.toObject());
            } else {

                console.log("arrayOfOrders");
                console.log(arrayOfOrders);
                resultMessage = "Done fetching all messages!";
                const findAllListsResponse = new BaseResponse("200", resultMessage, arrayOfOrders);
                res.json(findAllListsResponse.toObject());
            }

        });

        imap.connect();

        /*         let f111 = (finalResult) => {
            const findAllListsResponse = new BaseResponse("200", finalResult);
            res.json(findAllListsResponse.toObject());
        }; */
        //fetchEmail(imap);

        /* 
                 fetchEmail(imap).then((finalResult) => {
                    console.log("finalResult");
                    console.log(finalResult);
                    const findAllListsResponse = new BaseResponse("200", finalResult);
                    res.json(findAllListsResponse.toObject());
                }); */




    } catch (e) {
        console.log(e);
        const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", e.message);
        res.status(500).send(findAllListsCatchErrorResponse.toObject());
    }
});







module.exports = router;