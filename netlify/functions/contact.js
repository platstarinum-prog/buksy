exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name, email, subject, message } = JSON.parse(event.body);

    if (!email || !message) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email and message are required' }) };
    }

    // TODO: Add API key for email service
    // const API_KEY = process.env.CONTACT_API_KEY;
    // await sendEmail({ to: 'info@buksy.studio', from: email, subject, text: message });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Message received. We will get back to you soon.' }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
