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

// REVERTING TO ORIGINAL WORKING CONFIGURATION
const EMAIL_CONFIG = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'primaarg1@gmail.com',
        pass: process.env.EMAIL_PASS || 'tpko zgpk ctbi avuy'
    }
};

// 🔍 DEBUG: Log email configuration (safely)
console.log('🔍 DEBUG: Email Configuration:');
console.log('- Service: gmail');
console.log('- User:', EMAIL_CONFIG.auth.user);
console.log('- Pass:', EMAIL_CONFIG.auth.pass ? 'SET (length: ' + EMAIL_CONFIG.auth.pass.length + ')' : 'NOT SET');
console.log('- Pass starts with:', EMAIL_CONFIG.auth.pass ? EMAIL_CONFIG.auth.pass.substring(0, 4) + '...' : 'N/A');
console.log('🔍 DEBUG: Gmail App Password Analysis:');
console.log('- Expected length: 16 characters');
console.log('- Actual length:', EMAIL_CONFIG.auth.pass ? EMAIL_CONFIG.auth.pass.length : 'N/A');
console.log('- Contains spaces:', EMAIL_CONFIG.auth.pass ? EMAIL_CONFIG.auth.pass.includes(' ') : 'N/A');
console.log('- Format check:', EMAIL_CONFIG.auth.pass && EMAIL_CONFIG.auth.pass.length === 16 ? '✅ CORRECT' : '❌ INCORRECT');

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

// Send email endpoint - Using Brevo HTTP API (SMTP blocked by Render)
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

        console.log('🔍 DEBUG: Using Brevo HTTP API (SMTP blocked by Render)...');
        
        // Use Brevo HTTP API instead of SMTP
        const brevoApiKey = process.env.BREVO_API_KEY || 'your-brevo-api-key';
        console.log('🔍 DEBUG: Using Brevo API key:', brevoApiKey ? 'SET (length: ' + brevoApiKey.length + ')' : 'NOT SET');
        
        const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'api-key': brevoApiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sender: { 
                    email: 'primaarg1@gmail.com', 
                    name: 'PRIMA System' 
                },
                to: [{ email: to }],
                subject: subject,
                htmlContent: html || text,
                textContent: text
            })
        });

        console.log('🔍 DEBUG: Brevo API response status:', brevoResponse.status);
        
        if (brevoResponse.ok) {
            const result = await brevoResponse.json();
            console.log('✅ DEBUG: Email sent successfully via Brevo API!');
            console.log('✅ DEBUG: Message ID:', result.messageId);
            
            res.json({
                success: true,
                message: 'Email sent successfully via Brevo API',
                messageId: result.messageId,
                service: 'brevo-api'
            });
        } else {
            const errorData = await brevoResponse.json();
            console.error('❌ DEBUG: Brevo API error:', errorData);
            
            res.status(500).json({
                success: false,
                message: 'Failed to send email via Brevo API',
                error: errorData.message || 'Unknown API error',
                service: 'brevo-api'
            });
        }

    } catch (error) {
        console.error('❌ DEBUG: Email sending error occurred');
        console.error('❌ DEBUG: Error type:', error.constructor.name);
        console.error('❌ DEBUG: Error message:', error.message);
        console.error('❌ DEBUG: Full error object:', error);
        
        res.status(500).json({
            success: false,
            message: 'Failed to send email',
            error: error.message,
            service: 'brevo-api'
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
