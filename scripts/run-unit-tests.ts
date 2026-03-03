// Run Unit Tests
// Command: npm run test:unit

import { execSync } from 'child_process';

console.log('\n' + '='.repeat(80));
console.log(''.padStart(30) + 'UNIT TESTS');
console.log('='.repeat(80) + '\n');

try {
  execSync('npm run test src\\_tests_\\_unit', { stdio: 'inherit' });
} catch (error) {
  console.error('Test execution failed');
  process.exit(1);
}
