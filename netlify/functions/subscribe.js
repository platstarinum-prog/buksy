exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email } = JSON.parse(event.body);

    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email is required' }) };
    }

    // TODO: Add email service API key
    // const API_KEY = process.env.MAILCHIMP_API_KEY;
    // await addSubscriber(email);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Successfully subscribed!' }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
