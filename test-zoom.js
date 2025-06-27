require('dotenv').config();
const { createZoomMeeting } = require('./utils/zoomApi');

async function testZoomIntegration() {
  console.log('🧪 Testing Zoom API Integration...\n');
  
  try {
    // Test data
    const testTopic = 'Test Konsultasi - ' + new Date().toISOString();
    const testStartTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
    
    console.log('Test Topic:', testTopic);
    console.log('Test Start Time:', testStartTime);
    console.log('Test Duration: 60 minutes\n');
    
    // Test Zoom meeting creation
    const zoomLink = await createZoomMeeting(testTopic, testStartTime, 60);
    
    console.log('✅ Zoom meeting created successfully!');
    console.log('Join URL:', zoomLink);
    
  } catch (error) {
    console.error('❌ Zoom API test failed:', error.message);
    
    if (error.message.includes('Missing Zoom API credentials')) {
      console.log('\n💡 Solution: Check your .env file and make sure all Zoom credentials are set correctly');
    } else if (error.message.includes('401')) {
      console.log('\n💡 Solution: Check your Zoom API credentials - they might be invalid');
    } else if (error.message.includes('403')) {
      console.log('\n💡 Solution: Check your Zoom account permissions and API scopes');
    } else if (error.message.includes('404')) {
      console.log('\n💡 Solution: Check your ZOOM_USER_ID - it might be incorrect');
    }
  }
}

// Run the test
testZoomIntegration(); 