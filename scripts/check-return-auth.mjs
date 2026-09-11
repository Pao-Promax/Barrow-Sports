import assert from 'node:assert/strict';
const base = process.argv[2] || 'http://localhost:3000';
for (const [path, method] of [['/api/return','POST'],['/api/return','PATCH'],['/api/borrow','GET'],['/api/borrow','POST'],['/api/upload','POST'],['/api/equipment','PATCH'],['/api/equipment','DELETE']]) {
 const response = await fetch(base + path, { method });
 assert.equal(response.status, 401, `${method} ${path} must require login`);
}
console.log('PASS: borrowing, return submission, receipt and stock mutation require login');
