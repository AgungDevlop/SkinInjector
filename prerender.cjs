const { run } = require('react-snap');

run({
  source: 'dist', 
  publicPath: '/',
}).catch((err) => {
  console.error('Prerendering failed:', err);
  process.exit(1);
});