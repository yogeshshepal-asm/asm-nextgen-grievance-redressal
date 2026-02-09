
import emailjs from '@emailjs/browser';

// =========================================================================
// ⚠️ ACTION REQUIRED: REPLACE WITH YOUR EMAILJS CREDENTIALS
// 1. Register at https://emailjs.com/
// 2. Create a 'Service' (e.g. Gmail) and get SERVICE_ID
// 3. Create a 'Email Template' and get TEMPLATE_ID
//    - Template should accept variables: {{to_name}}, {{to_email}}, {{reset_link}}
// 4. Get your PUBLIC_KEY from Account > API Keys
// =========================================================================
const EMAILJS_CONFIG = {
  SERVICE_ID: 'YOUR_SERVICE_ID',     // e.g. 'service_gmail'
  TEMPLATE_ID: 'YOUR_TEMPLATE_ID',   // e.g. 'template_password_reset'
  PUBLIC_KEY: 'YOUR_PUBLIC_KEY'      // e.g. 'user_12345abcde'
};

export const sendResetEmail = async (email: string, name: string, resetLink: string) => {
  // Check if still using placeholders
  if (EMAILJS_CONFIG.PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
    console.warn('EmailJS Credentials missing. Simulating email send.');
    // Simulate network delay for demo purposes if keys aren't set
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { status: 200, text: 'SIMULATED_SUCCESS' };
  }

  try {
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      {
        to_email: email,
        to_name: name,
        reset_link: resetLink,
        message: `You have requested a password reset. Click here to set a new password: ${resetLink}`,
        reply_to: 'support@asmedu.org'
      },
      EMAILJS_CONFIG.PUBLIC_KEY
    );
    return response;
  } catch (error) {
    console.error('EmailJS Send Failed:', error);
    throw error;
  }
};
