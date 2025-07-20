const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting deployment...');

try {
  // Build the React app
  console.log('📦 Building React app...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  console.log('');
  console.log('🎯 Your AI Assistant is ready for Twilio integration!');
  console.log('');
  console.log('📞 Phone Number: (915) 233-4931');
  console.log('');
  console.log('🔧 Next Steps:');
  console.log('1. Deploy to cloud platform (Heroku, Railway, Render)');
  console.log('2. Configure Twilio webhooks (see TWILIO_SETUP.md)');
  console.log('3. Test by calling your number');
  console.log('');
  console.log('📖 For detailed setup instructions, see: TWILIO_SETUP.md');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
} 