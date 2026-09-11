import assert from 'node:assert/strict';
import { isAdminUser, isSuperAdminUser } from '../src/lib/admin-role.ts';
assert.equal(isSuperAdminUser({ email: '50788@cru.ac.th', app_metadata: { role: 'admin', super_admin: true } }), true);
assert.equal(isSuperAdminUser({ email: '50788@cru.ac.th', user_metadata: { role: 'admin', super_admin: true } }), false);
assert.equal(isSuperAdminUser({ email: 'other@cru.ac.th', app_metadata: { role: 'admin', super_admin: true } }), false);
assert.equal(isSuperAdminUser({ email: '50788@cru.ac.th', app_metadata: { role: 'admin' } }), false);
for (const method of ['GET', 'POST']) {
  const response = await fetch('http://localhost:3000/api/subadmins', { method });
  assert.equal(response.status, 401);
}
assert.equal((await fetch('http://localhost:3000/api/equipment-image', { method: 'POST' })).status, 401);
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
