import { performance } from 'perf_hooks';

// Mock DB
const db = {};

// Mock Firestore functions
const doc = (db: any, collection: string, id: string) => ({ collection, id });
const setDoc = async (docRef: any, data: any) => {
  return new Promise(resolve => setTimeout(resolve, 5)); // Simulate network latency
};
const deleteDoc = async (docRef: any) => {
  return new Promise(resolve => setTimeout(resolve, 5)); // Simulate network latency
};

// Mock Data
interface ShopProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  inventory: number;
}

const SAMPLE_INVENTORY: ShopProduct[] = Array.from({ length: 100 }, (_, i) => ({
  id: `prod_${i}`,
  name: `Product ${i}`,
  description: `Description ${i}`,
  category: `Category ${i % 5}`,
  price: i * 10,
  inventory: 100
}));

const list: ShopProduct[] = Array.from({ length: 80 }, (_, i) => ({
  id: `prod_${i}`,
  name: i % 2 === 0 ? `Product ${i}` : `Old Product ${i}`,
  description: `Description ${i}`,
  category: `Category ${i % 5}`,
  price: i * 10,
  inventory: 100
}));
// Adding some items to be deleted
for(let i=100; i<120; i++){
  list.push({
    id: `prod_${i}`,
    name: `Old Product ${i}`,
    description: `Description ${i}`,
    category: `Category ${i % 5}`,
    price: i * 10,
    inventory: 100
  });
}

async function optimizedImplementation() {
  const currentList = [...list];

  const promises: Promise<void>[] = [];

  // Self-healing synchronization upgrade: insert or UPDATE items to match updated clean certified titles & sizes, prices, and stock
  for (const sample of SAMPLE_INVENTORY) {
    const existingIndex = currentList.findIndex(p => p.id === sample.id);
    if (existingIndex === -1) {
      promises.push((async () => {
        try {
          await setDoc(doc(db, 'shopItems', sample.id), sample);
          currentList.push(sample);
        } catch (err) {
          console.error(`Failed to auto-provision item: ${sample.id}`, err);
        }
      })());
    } else {
      const existing = currentList[existingIndex];
      if (
        existing.name !== sample.name ||
        existing.description !== sample.description ||
        existing.category !== sample.category ||
        existing.price !== sample.price ||
        existing.inventory !== sample.inventory
      ) {
        promises.push((async () => {
          try {
            await setDoc(doc(db, 'shopItems', sample.id), {
              ...existing,
              name: sample.name,
              description: sample.description,
              category: sample.category,
              price: sample.price,
              inventory: sample.inventory
            });
            currentList[existingIndex] = {
              ...existing,
              name: sample.name,
              description: sample.description,
              category: sample.category,
              price: sample.price,
              inventory: sample.inventory
            };
          } catch (err) {
            console.error(`Failed to auto-update item: ${sample.id}`, err);
          }
        })());
      }
    }
  }

  // Proactively prune outdated/removed inventory sizes/products from Firestore
  const activeSampleIds = new Set(SAMPLE_INVENTORY.map(s => s.id));
  for (const item of currentList) {
    if (!activeSampleIds.has(item.id)) {
      promises.push((async () => {
        try {
          await deleteDoc(doc(db, 'shopItems', item.id));
        } catch (err) {
          console.error(`Failed to auto-delete obsolete database item: ${item.id}`, err);
        }
      })());
    }
  }

  await Promise.all(promises);
}

async function run() {
  const start = performance.now();
  await optimizedImplementation();
  const end = performance.now();
  console.log(`Optimized implementation took: ${end - start} ms`);
}

run();
