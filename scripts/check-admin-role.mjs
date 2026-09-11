import assert from 'node:assert/strict';
import { isAdminUser } from '../src/lib/admin-role.ts';
assert.equal(isAdminUser(null), false);
assert.equal(isAdminUser({}), false);
assert.equal(isAdminUser({ user_metadata: { role: 'admin' } }), false);
assert.equal(isAdminUser({ app_metadata: { role: 'student' } }), false);
assert.equal(isAdminUser({ app_metadata: { role: 'admin' } }), true);
for (const headers of [{}, { Authorization: 'Bearer invalid' }]) {
  const response = await fetch('http://localhost:3000/api/equipment', { method: 'POST', headers });
  assert.equal(response.status, 401);
}
console.log('Admin role and unauthenticated API checks passed');
