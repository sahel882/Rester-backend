import nodemailer from "nodemailer"

// TELEGRAM NOTIFICATION
export const sendTelegramNotification = async (message: string) => {
    try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN
        const chatId = process.env.TELEGRAM_CHAT_ID

        await fetch(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: "HTML"
                })
            }
        )
        console.log("Telegram notification sent! ✅")
    } catch (error) {
        console.error("Telegram notification failed:", error)
    }
}

// EMAIL NOTIFICATION
export const sendEmail = async (
    subject: string,
    html: string
) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.YOUR_EMAIL,
                pass: process.env.YOUR_EMAIL_PASSWORD
            }
        })

        await transporter.sendMail({
            from: process.env.YOUR_EMAIL,
            to: process.env.YOUR_EMAIL,
            subject,
            html
        })
        console.log("Email sent! ✅")
    } catch (error) {
        console.error("Email failed:", error)
    }
}