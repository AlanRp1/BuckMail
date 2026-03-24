const axios = require('axios');

const API_URL = 'http://localhost:5000/api/webhook/receive';

// To test, first generate an email in the frontend and copy it here
const testRecipient = process.argv[2] || 'user_test@buckmail.com';

const testEmail = {
  sender: 'hacker@cyberpunk.com',
  recipient: testRecipient,
  subject: 'URGENT: Transmission Intercepted',
  'body-html': '<h1>System Breach Detected</h1><p>We have successfully bypassed the firewall. The access codes are hidden in the neural link.</p><p>Regards,<br><b>Cipher</b></p>',
  'body-plain': 'System Breach Detected. We have successfully bypassed the firewall. The access codes are hidden in the neural link.'
};

async function sendTestEmail() {
  try {
    console.log(`Sending test email to ${testRecipient}...`);
    const response = await axios.post(API_URL, testEmail);
    console.log('Status:', response.status);
    console.log('Response:', response.data);
    console.log('Check your BuckMail inbox!');
  } catch (error) {
    console.error('Error sending test email:', error.message);
    if (error.response) {
      console.error('Server response:', error.response.data);
    }
  }
}

sendTestEmail();
