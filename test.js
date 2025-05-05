
const SERVER = process.env.SERVER || 'localhost';
const isProduction = SERVER.toUpperCase() === 'PRODUCTION';
console.log(`SERVER: ${SERVER}`);
console.log(`isProduction: ${isProduction}`);