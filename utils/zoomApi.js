const axios = require('axios');

async function getZoomAccessToken() {
  try {
    const accountId = process.env.ZOOM_ACCOUNT_ID;
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;

    // Validate environment variables
    if (!accountId || !clientId || !clientSecret) {
      throw new Error('Missing Zoom API credentials in environment variables');
    }

    console.log('🔍 Getting Zoom access token...');
    console.log('Account ID:', accountId);
    console.log('Client ID:', clientId);
    console.log('Client Secret:', clientSecret ? '***' : 'MISSING');

    const response = await axios.post(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
      {},
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('✅ Zoom access token obtained successfully');
    return response.data.access_token;
  } catch (error) {
    console.error('❌ Error getting Zoom access token:', error.message);
    if (error.response) {
      console.error('Zoom API response:', error.response.data);
      console.error('Status:', error.response.status);
    }
    throw new Error(`Failed to get Zoom access token: ${error.message}`);
  }
}

async function createZoomMeeting(topic, startTime, duration = 60) {
  try {
    console.log('🔍 Creating Zoom meeting...');
    console.log('Topic:', topic);
    console.log('Start time:', startTime);
    console.log('Duration:', duration);

    const accessToken = await getZoomAccessToken();
    const userId = process.env.ZOOM_USER_ID; // email host Zoom atau 'me'

    if (!userId) {
      throw new Error('ZOOM_USER_ID environment variable is missing');
    }

    console.log('User ID for meeting creation:', userId);

    const meetingData = {
      topic,
      type: 2, // Scheduled meeting
      start_time: startTime, // ISO string
      duration, // in minutes
      timezone: 'Asia/Jakarta',
      settings: {
        join_before_host: false,
        waiting_room: true
      }
    };

    console.log('Meeting data:', JSON.stringify(meetingData, null, 2));

    const response = await axios.post(
      `https://api.zoom.us/v2/users/${userId}/meetings`,
      meetingData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Zoom meeting created successfully');
    console.log('Join URL:', response.data.join_url);
    
    return response.data; // return seluruh data meeting
  } catch (error) {
    console.error('❌ Error creating Zoom meeting:', error.message);
    if (error.response) {
      console.error('Zoom API response:', error.response.data);
      console.error('Status:', error.response.status);
    }
    throw new Error(`Failed to create Zoom meeting: ${error.message}`);
  }
}

module.exports = { createZoomMeeting }; 