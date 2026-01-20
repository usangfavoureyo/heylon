
const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('=======================================');
console.log('Paste these into your Convex Dashboard Environment Variables:');
console.log('=======================================');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('=======================================');
console.log('Also add NEXT_PUBLIC_VAPID_PUBLIC_KEY to your .env.local for Frontend access.');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
