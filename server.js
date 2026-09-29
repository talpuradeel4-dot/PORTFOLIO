    require("dotenv").config();

    const express = require("express");
    const fs = require("fs");
    const path = require("path");
    const nodemailer = require("nodemailer");

    const app = express();
    const PORT = 3000;


    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    app.use((req, res, next) => {
        console.log(`Incoming request: ${req.method} ${req.url}`);
        next();
    });

    const MESSAGES_FILE = path.join(__dirname, "message.json");
    console.log("Message file location:", MESSAGES_FILE);

    // If message.json doesn't exist yet, create it with an empty array
    if (!fs.existsSync(MESSAGES_FILE)) {
        fs.writeFileSync(MESSAGES_FILE, "[]");
    }

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(express.static(__dirname));

    // Contact form
    app.post("/contact", async function(req, res) {

        const name = req.body.name;
        const email = req.body.email;
        const comment = req.body.comment;

    console.log("Received form data:");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Comment:", comment);

    console.log("Saving to:", MESSAGES_FILE);

    const newMessage = {
        name: name,
        email: email,
        comment: comment,
        date: new Date().toISOString()
    };

    const messages = JSON.parse(
        fs.readFileSync(MESSAGES_FILE, "utf8")
    );

    messages.push(newMessage);

    fs.writeFileSync(
        MESSAGES_FILE,
        JSON.stringify(messages, null, 2)
    );

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
            subject: "New Message from Portfolio",
            text: `
    Name: ${name}
    Email: ${email}

    Message:
    ${comment}
            `
        };

        try {
            await transporter.sendMail(mailOptions);

            console.log("Email sent successfully!");

            res.json({
        success: true,
        message: "Message sent successfully!"
    });

        } catch (error) {
            console.log("Error sending email:", error);

            res.status(500).send("Failed to send message.");
        }
    });


    app.listen(PORT, function () {
        console.log(`Server is running on http://localhost:${PORT}`);
    });