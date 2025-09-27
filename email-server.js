// Custom Email Server for PRIMA - Unlimited Free Email Sending
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// 🔍 DEBUG: Log all environment variables (safely)
console.log('🔍 DEBUG: Environment Variables Check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- EMAIL_USER:', process.env.EMAIL_USER ? '✅ SET' : '❌ MISSING');
console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ SET (length: ' + process.env.EMAIL_PASS.length + ')' : '❌ MISSING');

// Email configuration - Uses environment variables for security
const EMAIL_CONFIG = {
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || '971979002@smtp-brevo.com',
        pass: process.env.EMAIL_PASS || 'LcRqp59AKEWT0FV8'
    }
};

// 🔍 DEBUG: Log email configuration (safely)
console.log('🔍 DEBUG: Email Configuration:');
console.log('- Host:', EMAIL_CONFIG.host);
console.log('- Port:', EMAIL_CONFIG.port);
console.log('- Secure:', EMAIL_CONFIG.secure);
console.log('- User:', EMAIL_CONFIG.auth.user);
console.log('- Pass:', EMAIL_CONFIG.auth.pass ? 'SET (length: ' + EMAIL_CONFIG.auth.pass.length + ')' : 'NOT SET');
console.log('- Pass starts with:', EMAIL_CONFIG.auth.pass ? EMAIL_CONFIG.auth.pass.substring(0, 4) + '...' : 'N/A');

// Create transporter
console.log('🔍 DEBUG: Creating nodemailer transporter...');
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Test email configuration
console.log('🔍 DEBUG: Testing email configuration...');
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email configuration error:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error response:', error.response);
        console.error('❌ Error responseCode:', error.responseCode);
    } else {
        console.log('✅ Email server ready to send emails');
        console.log('✅ SMTP connection verified successfully');
    }
});

// Send email endpoint
app.post('/send-email', async (req, res) => {
    try {
        console.log('🔍 DEBUG: Received email request');
        console.log('🔍 DEBUG: Request body:', JSON.stringify(req.body, null, 2));
        
        const { to, subject, html, text } = req.body;

        // Validate required fields
        if (!to || !subject || (!html && !text)) {
            console.error('❌ DEBUG: Missing required fields');
            console.error('- to:', to ? '✅' : '❌');
            console.error('- subject:', subject ? '✅' : '❌');
            console.error('- html:', html ? '✅' : '❌');
            console.error('- text:', text ? '✅' : '❌');
            
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: to, subject, and html/text'
            });
        }

        console.log('🔍 DEBUG: Creating mail options...');
        const mailOptions = {
            from: `"PRIMA System" <${EMAIL_CONFIG.auth.user}>`,
            to: to,
            subject: subject,
            html: html,
            text: text
        };
        
        console.log('🔍 DEBUG: Mail options created:', {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject,
            hasHtml: !!mailOptions.html,
            hasText: !!mailOptions.text
        });

        console.log('🔍 DEBUG: Attempting to send email...');
        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ DEBUG: Email sent successfully!');
        console.log('✅ DEBUG: Message ID:', info.messageId);
        console.log('✅ DEBUG: Response:', info.response);
        
        res.json({
            success: true,
            message: 'Email sent successfully',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('❌ DEBUG: Email sending error occurred');
        console.error('❌ DEBUG: Error type:', error.constructor.name);
        console.error('❌ DEBUG: Error message:', error.message);
        console.error('❌ DEBUG: Error code:', error.code);
        console.error('❌ DEBUG: Error response:', error.response);
        console.error('❌ DEBUG: Error responseCode:', error.responseCode);
        console.error('❌ DEBUG: Full error object:', error);
        
        res.status(500).json({
            success: false,
            message: 'Failed to send email',
            error: error.message,
            errorCode: error.code,
            errorResponse: error.response
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Email server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log('🔍 DEBUG: Server startup complete');
    console.log(`🚀 Email server running on http://localhost:${PORT}`);
    console.log(`📧 Ready to send unlimited emails!`);
    console.log('🔍 DEBUG: Available endpoints:');
    console.log('- POST /send-email - Send email');
    console.log('- GET /health - Health check');
    console.log('🔍 DEBUG: Server is ready to receive requests');
});
