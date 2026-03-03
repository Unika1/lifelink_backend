// Run Integration Tests
// Command: npm run test:integration

import { execSync } from 'child_process';

console.log('\n' + '='.repeat(80));
console.log(''.padStart(25) + 'INTEGRATION TESTS');
console.log('='.repeat(80) + '\n');

try {
  execSync('npm run test src\\_tests_\\_integration', { stdio: 'inherit' });
} catch (error) {
  console.error('Test execution failed');
  process.exit(1);
}
