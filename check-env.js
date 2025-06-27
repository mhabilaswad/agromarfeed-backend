require('dotenv').config();

console.log('🔍 Checking environment variables...\n');

// Check Zoom API credentials
console.log('=== ZOOM API CREDENTIALS ===');
console.log('ZOOM_ACCOUNT_ID:', process.env.ZOOM_ACCOUNT_ID ? '✅ Set' : '❌ Missing');
console.log('ZOOM_CLIENT_ID:', process.env.ZOOM_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('ZOOM_CLIENT_SECRET:', process.env.ZOOM_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
console.log('ZOOM_USER_ID:', process.env.ZOOM_USER_ID ? '✅ Set' : '❌ Missing');

// Check Midtrans credentials
console.log('\n=== MIDTRANS CREDENTIALS ===');
console.log('MIDTRANS_SERVER_KEY:', process.env.MIDTRANS_SERVER_KEY ? '✅ Set' : '❌ Missing');
console.log('MIDTRANS_CLIENT_KEY:', process.env.MIDTRANS_CLIENT_KEY ? '✅ Set' : '❌ Missing');
console.log('MIDTRANS_IS_PRODUCTION:', process.env.MIDTRANS_IS_PRODUCTION ? '✅ Set' : '❌ Missing');

// Check Email credentials
console.log('\n=== EMAIL CREDENTIALS ===');
console.log('EMAIL_USERNAME:', process.env.EMAIL_USERNAME ? '✅ Set' : '❌ Missing');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Missing');

// Check Database
console.log('\n=== DATABASE ===');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');

// Check Server config
console.log('\n=== SERVER CONFIG ===');
console.log('PORT:', process.env.PORT || '4000 (default)');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development (default)');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ Set' : '❌ Missing');

// Check URLs
console.log('\n=== URLS ===');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || '❌ Missing');
console.log('BACKEND_URL:', process.env.BACKEND_URL || '❌ Missing');
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN || '❌ Missing');

console.log('\n=== VALIDATION ===');
const requiredVars = [
  'ZOOM_ACCOUNT_ID',
  'ZOOM_CLIENT_ID', 
  'ZOOM_CLIENT_SECRET',
  'ZOOM_USER_ID',
  'MIDTRANS_SERVER_KEY',
  'MIDTRANS_CLIENT_KEY',
  'EMAIL_USERNAME',
  'EMAIL_PASSWORD',
  'MONGODB_URI',
  'SESSION_SECRET'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length === 0) {
  console.log('✅ All required environment variables are set!');
} else {
  console.log('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.log(`   - ${varName}`));
}

console.log('\n🔍 Environment check completed!'); 