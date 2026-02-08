const grpc = require('@grpc/grpc-js');

console.log('Testing grpc import...');
console.log('grpc.credentials:', grpc.credentials);

console.log('\nCreating insecure credentials...');
const credentials = grpc.credentials.createInsecure();
console.log('Type:', credentials.constructor.name);
console.log('Credentials:', credentials);

console.log('\nTesting if it is ChannelCredentials...');
const ChannelCredentials = require('@grpc/grpc-js').ChannelCredentials;
console.log('Is instance of ChannelCredentials:', credentials instanceof ChannelCredentials);
