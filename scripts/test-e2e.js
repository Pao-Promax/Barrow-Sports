const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log('🚀 STARTING COMPREHENSIVE BARROW-SPORTS E2E TESTS');
  console.log('====================================================\n');

  let testEquipmentId = null;
  let testBorrowId = null;

  try {
    // 1. Test fetching equipment
    console.log('👉 [TEST 1] GET /api/equipment: Fetching equipment catalog...');
    const listRes = await fetch(`${BASE_URL}/api/equipment`);
    if (!listRes.ok) throw new Error(`GET /api/equipment failed with status ${listRes.status}`);
    const listData = await listRes.json();
    console.log(`✅ [PASS] Successfully fetched ${listData.equipment?.length || 0} equipment items from Supabase.`);

    // 2. Test Admin adding new sports equipment
    console.log('\n👉 [TEST 2] POST /api/equipment: Admin adding new sports equipment...');
    const newEquipmentPayload = {
      name: 'ลูกฟุตซอล Molten F9V4800 (Futsal Pro) [E2E-TEST]',
      category: 'football',
      description: 'ลูกฟุตซอลหนังเย็บคุณภาพสูง สำหรับแข่งและซ้อมในโรงเรียน',
      image_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
      total_quantity: 8,
      location: 'ตู้ A-04 (โรงยิม)'
    };

    const addRes = await fetch(`${BASE_URL}/api/equipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEquipmentPayload)
    });

    if (!addRes.ok) {
      const err = await addRes.text();
      throw new Error(`POST /api/equipment failed: ${err}`);
    }

    const addData = await addRes.json();
    testEquipmentId = addData.equipment.id;
    console.log(`✅ [PASS] Successfully added equipment: "${addData.equipment.name}"`);
    console.log(`   - ID: ${testEquipmentId}`);
    console.log(`   - Total Stock: ${addData.equipment.total_quantity}`);
    console.log(`   - Available: ${addData.equipment.available_quantity}`);
    console.log(`   - Location: ${addData.equipment.location}`);

    // 3. Test Student borrowing equipment
    console.log('\n👉 [TEST 3] POST /api/borrow: Student borrowing 2 units for 2 hours...');
    const borrowPayload = {
      equipment_id: testEquipmentId,
      user_name: 'นายกิตติภูมิ ชัยชนะ (นักเรียน ม.5/1)',
      user_email: '50788@cru.ac.th',
      quantity: 2,
      duration_hours: 2
    };

    const borrowRes = await fetch(`${BASE_URL}/api/borrow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(borrowPayload)
    });

    if (!borrowRes.ok) {
      const err = await borrowRes.text();
      throw new Error(`POST /api/borrow failed: ${err}`);
    }

    const borrowData = await borrowRes.json();
    testBorrowId = borrowData.borrow.id;
    console.log(`✅ [PASS] Successfully borrowed equipment!`);
    console.log(`   - Borrow ID: ${testBorrowId}`);
    console.log(`   - Borrowed At: ${borrowData.borrow.borrowed_at}`);
    console.log(`   - Due At: ${borrowData.borrow.due_at}`);
    console.log(`   - Status: ${borrowData.borrow.status}`);

    // 4. Verify stock decrement in database
    console.log('\n👉 [TEST 4] Verifying stock was decremented correctly in Supabase...');
    const verifyRes = await fetch(`${BASE_URL}/api/equipment`);
    const verifyData = await verifyRes.json();
    const updatedItem = verifyData.equipment.find((item) => item.id === testEquipmentId);

    if (!updatedItem) throw new Error('Could not find updated equipment in database');
    console.log(`   - Expected Available Stock: 6 (Original 8 - Borrowed 2)`);
    console.log(`   - Actual Available Stock: ${updatedItem.available_quantity}`);
    if (updatedItem.available_quantity !== 6) {
      throw new Error(`Stock mismatch! Expected 6, got ${updatedItem.available_quantity}`);
    }
    console.log(`✅ [PASS] Stock accurately decremented from 8 to 6.`);

    // 5. Test Over-borrowing protection
    console.log('\n👉 [TEST 5] Testing over-borrowing protection (trying to borrow 10 items when only 6 left)...');
    const overBorrowRes = await fetch(`${BASE_URL}/api/borrow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        equipment_id: testEquipmentId,
        user_name: 'นายทดสอบ (นักเรียน)',
        user_email: 'test@school.ac.th',
        quantity: 10,
        duration_hours: 1
      })
    });

    if (overBorrowRes.status === 400) {
      const overBorrowData = await overBorrowRes.json();
      console.log(`✅ [PASS] System correctly rejected over-borrowing with error: "${overBorrowData.error}"`);
    } else {
      throw new Error(`Expected status 400 for over-borrowing, but got ${overBorrowRes.status}`);
    }

    // 6. Test Returning equipment with photo proof
    console.log('\n👉 [TEST 6] POST /api/return: Student returning equipment with photo proof...');
    const returnPayload = {
      borrow_id: testBorrowId,
      return_proof_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
      return_note: 'นำลูกฟุตซอลมาเก็บเข้าตู้ A-04 โรงยิมเรียบร้อย สภาพสมบูรณ์',
      is_damaged: false,
      damaged_count: 0
    };

    const returnRes = await fetch(`${BASE_URL}/api/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(returnPayload)
    });

    if (!returnRes.ok) {
      const err = await returnRes.text();
      throw new Error(`POST /api/return failed: ${err}`);
    }

    const returnData = await returnRes.json();
    console.log(`✅ [PASS] Successfully returned equipment!`);
    console.log(`   - Status: ${returnData.borrow.status}`);
    console.log(`   - Returned At: ${returnData.borrow.returned_at}`);
    console.log(`   - Proof URL: ${returnData.borrow.return_proof_url}`);

    // 7. Verify stock restored in database
    console.log('\n👉 [TEST 7] Verifying stock was restored to 8 in Supabase...');
    const verifyRestoredRes = await fetch(`${BASE_URL}/api/equipment`);
    const verifyRestoredData = await verifyRestoredRes.json();
    const restoredItem = verifyRestoredData.equipment.find((item) => item.id === testEquipmentId);

    if (restoredItem.available_quantity !== 8) {
      throw new Error(`Stock mismatch after return! Expected 8, got ${restoredItem.available_quantity}`);
    }
    console.log(`✅ [PASS] Stock restored back to ${restoredItem.available_quantity} pieces.`);

    // 8. Test Admin Stock & Damage adjustment
    console.log('\n👉 [TEST 8] PATCH /api/equipment: Admin marking 1 item as damaged...');
    const patchRes = await fetch(`${BASE_URL}/api/equipment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: testEquipmentId,
        available_quantity: 7,
        damaged_quantity: 1,
        location: 'ตู้ A-04 (โรงยิม - รอส่งซ่อม)'
      })
    });

    if (!patchRes.ok) throw new Error('PATCH /api/equipment failed');
    const patchData = await patchRes.json();
    console.log(`✅ [PASS] Successfully adjusted stock:`);
    console.log(`   - Available: ${patchData.equipment.available_quantity}`);
    console.log(`   - Damaged: ${patchData.equipment.damaged_quantity}`);
    console.log(`   - Location: ${patchData.equipment.location}`);

    // 9. Clean up test equipment
    console.log('\n👉 [TEST 9] DELETE /api/equipment: Cleaning up test equipment record...');
    const deleteRes = await fetch(`${BASE_URL}/api/equipment?id=${testEquipmentId}`, {
      method: 'DELETE'
    });
    if (!deleteRes.ok) throw new Error('DELETE failed');
    console.log(`✅ [PASS] Cleaned up test equipment.`);

    console.log('\n====================================================');
    console.log('🎉 ALL 9 E2E TESTS PASSED SUCCESSFULLY 100%!');
    console.log('====================================================');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

runTests();
