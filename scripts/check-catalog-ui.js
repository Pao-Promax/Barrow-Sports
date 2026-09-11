// Run with Playwright's browser_run_code_unsafe filename option against the local dev server.
async (page) => {
  const catalog = await (await page.request.get('http://localhost:3000/api/equipment')).json();
  if (!catalog.equipment?.length) throw new Error('Catalog needs equipment to verify the UI');
  const results = [];
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.locator('article').first().waitFor();
    for (const theme of ['light', 'dark']) {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      if (await page.evaluate(() => document.documentElement.classList.contains('dark')) !== (theme === 'dark')) {
        await page.getByRole('button', { name: 'Toggle theme' }).click();
      }
      for (const item of catalog.equipment) {
        const card = page.getByRole('article', { name: item.name, exact: true });
        if (!(await card.innerText()).includes(`พร้อมยืม ${item.available_quantity} ชิ้น`)) throw new Error(`Incorrect stock: ${item.name}`);
        if (await card.getByRole('button').isDisabled() !== (item.available_quantity <= 0)) throw new Error(`Incorrect borrow state: ${item.name}`);
      }
      await page.locator('article img').evaluateAll(images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode(); })));
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Page overflows');
      await page.screenshot({ path: `.playwright-mcp/catalog-${width}-${theme}.png`, fullPage: true });
      results.push(`${width}px ${theme}: stock, images, layout passed`);
    }
  }
  await page.getByRole('article').first().getByRole('button').click();
  await page.getByRole('heading', { name: 'ยืนยันการยืมอุปกรณ์กีฬา' }).waitFor();
  // Exercise empty stock without changing inventory in the database.
  await page.route('**/api/equipment*', route => route.fulfill({
    json: { equipment: [{ ...catalog.equipment[0], available_quantity: 0 }] },
  }));
  await page.reload();
  const emptyItem = page.getByRole('article').first();
  await emptyItem.waitFor();
  if (!(await emptyItem.getByRole('button').isDisabled())) throw new Error('Empty stock must disable borrowing');
  if (!(await emptyItem.innerText()).includes('พร้อมยืม 0 ชิ้น')) throw new Error('Empty stock must show zero');
  await page.unroute('**/api/equipment*');
  await page.reload();
  results.push('Borrow dialog and zero-stock state passed');
  return results;
}
