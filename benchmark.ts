const NUM_ITEMS = 86;
const MOCK_LATENCY = 50; // 50ms network latency per operation

async function mockSetDoc(id: string) {
  return new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY));
}

async function runSequential() {
  const start = performance.now();
  for (let i = 0; i < NUM_ITEMS; i++) {
    await mockSetDoc(`item_${i}`);
  }
  const end = performance.now();
  console.log(`Sequential: ${(end - start).toFixed(2)}ms`);
  return end - start;
}

async function runPromiseAll() {
  const start = performance.now();
  const promises = [];
  for (let i = 0; i < NUM_ITEMS; i++) {
    promises.push(mockSetDoc(`item_${i}`));
  }
  await Promise.all(promises);
  const end = performance.now();
  console.log(`Promise.all: ${(end - start).toFixed(2)}ms`);
  return end - start;
}

async function main() {
  console.log("Running baseline (Sequential)...");
  const baseline = await runSequential();

  console.log("Running optimized (Promise.all)...");
  const optimized = await runPromiseAll();

  console.log(`\nImprovement: ${((baseline - optimized) / baseline * 100).toFixed(2)}% faster`);
}

main();
