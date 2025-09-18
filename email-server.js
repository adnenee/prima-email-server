// Custom Email Server for PRIMA - Unlimited Free Email Sending
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Email configuration - Uses environment variables for security
const EMAIL_CONFIG = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'primaarg1@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
};

// Create transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Test email configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email configuration error:', error);
    } else {
        console.log('✅ Email server ready to send emails');
    }
});

// Send email endpoint
app.post('/send-email', async (req, res) => {
    try {
        const { to, subject, html, text } = req.body;

        if (!to || !subject || (!html && !text)) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: to, subject, and html/text'
            });
        }

        const mailOptions = {
            from: `"PRIMA System" <${EMAIL_CONFIG.auth.user}>`,
            to: to,
            subject: subject,
            html: html,
            text: text
        };

        const info = await transporter.sendMail(mailOptions);
        
        console.log('📧 Email sent successfully:', info.messageId);
        
        res.json({
            success: true,
            message: 'Email sent successfully',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('❌ Email sending error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send email',
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Email server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Email server running on http://localhost:${PORT}`);
    console.log(`📧 Ready to send unlimited emails!`);
});
