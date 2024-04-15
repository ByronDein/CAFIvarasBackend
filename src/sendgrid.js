// sendgrid.js

const sgMail = require('@sendgrid/mail');

// Set the SendGrid API key from your .env file
sgMail.setApiKey(process.env.REACT_APP_MAIL_PASSWORD);

// Function to send an email
const sendEmailMiddleware = async (req, res) => {
  const { to, subject, text, html } = req.body;
  const msg = {
    to: to, // Change to your recipient
    from: process.env.REACT_APP_MAIL_DEFAULT_FROM, // Change to your verified sender
    subject: subject,
    text: text,
    html: html,
  }
  
  try {
    await sgMail.send(msg);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Failed to send email:', error);
    // Extract more specific error information from the error object
    let errorMessage = 'Failed to send email';
    if (error.response && error.response.body && error.response.body.errors) {
      errorMessage += ': ' + error.response.body.errors.map(error => error.message).join(', ');
    } else if (error.message) {
      errorMessage += ': ' + error.message;
    }
    res.status(500).json({ error: errorMessage });
  }
    
};

module.exports = sendEmailMiddleware;
