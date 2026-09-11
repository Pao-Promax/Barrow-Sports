import assert from 'node:assert/strict';
import { isSchoolAccount } from '../src/lib/school-account.ts';
const google = { email_confirmed_at: '2026-01-01', app_metadata: { provider: 'google' } };
assert.equal(isSchoolAccount({ ...google, email: '50788@cru.ac.th' }), true);
assert.equal(isSchoolAccount({ ...google, email: 'STUDENT@CRU.AC.TH' }), true);
for (const email of ['student@gmail.com', 'x@cru.ac.th.evil.com', 'x@sub.cru.ac.th', '@cru.ac.th', 'x@y@cru.ac.th', ' x@cru.ac.th']) {
  assert.equal(isSchoolAccount({ ...google, email }), false, email);
}
assert.equal(isSchoolAccount({ ...google, email: 'x@cru.ac.th', email_confirmed_at: undefined }), false);
assert.equal(isSchoolAccount({ ...google, email: 'x@cru.ac.th', app_metadata: { provider: 'email' } }), false);
assert.equal(isSchoolAccount(null), false);
console.log('School account checks passed');
