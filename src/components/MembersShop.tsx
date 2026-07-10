import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  ShoppingBag,
  ShoppingCart,
  Users,
  CheckCircle,
  X,
  Clock,
  Edit,
  ClipboardList,
  User,
  Loader2,
  ShieldAlert,
  BadgeCheck,
  Search,
  UserPlus,
  LogIn,
  Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  addDoc,
  serverTimestamp,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { triggerHaptic } from '../lib/haptics';
import { safeLocalStorage } from '../lib/storage';
import { handleFirestoreError, OperationType } from '../lib/db';
import { ShopProduct, MemberProfile, CartItem, OrderDetail, ShippingOption } from '../lib/shopTypes';
import { SAMPLE_INVENTORY } from '../data/shopInventory';
export type { ShopProduct, MemberProfile, CartItem, OrderDetail, ShippingOption };
export { findShopProductMatch, getCleanDescription, getEstimatedDeliveryDate, getShippingOptions, getSalePrice } from '../lib/shopHelpers';
import { getCleanDescription, getEstimatedDeliveryDate, getShippingOptions, getSalePrice, getKitSellPrice, getChinaKitSellPrice, getChinaVialSellPrice, findShopProductMatch, getSecondaryBenefit, getSecondaryBenefitStyle, parseShippingAddress, getProductBaseAndSize } from '../lib/shopHelpers';
import { fetchWholesaleBook, getProductCostPerVial, type WholesaleBook } from '../lib/wholesale';
import { usePricingConfig } from '../lib/pricingConfig';
import ShopCartView from './shop/ShopCartView';
import ShopCheckoutView from './shop/ShopCheckoutView';
import ShopOrdersView from './shop/ShopOrdersView';
import AdminMembersPanel from './shop/AdminMembersPanel';
import AdminOrdersPanel from './shop/AdminOrdersPanel';
import AdminPricingPanel from './shop/AdminPricingPanel';
import ShopCatalogView from './shop/ShopCatalogView';
import ProductDrawerModal from './shop/ProductDrawerModal';
import OrderSuccessModal from './shop/OrderSuccessModal';
import CertificationModal from './shop/CertificationModal';
import AdminProductFormModal from './shop/AdminProductFormModal';
import NorwayHeritageModal from './shop/NorwayHeritageModal';
import ShopRegistrationView from './shop/ShopRegistrationView';
import ProductVialVisual from './shop/ProductVialVisual';

type LabratThemeMode = 'neon' | 'clinical' | 'clinical-light';

function resolveLabratTheme(): LabratThemeMode {
  if (typeof document === 'undefined') return 'neon';
  const t = document.documentElement.getAttribute('data-labrat-theme');
  if (t === 'clinical') return 'clinical';
  if (t === 'clinical-light') return 'clinical-light';
  return 'neon';
}


interface MembersShopProps {
  onRequestAuth?: (mode: 'signin' | 'signup') => void;
}

export default function MembersShop({ onRequestAuth }: MembersShopProps) {
  const pricingConfig = usePricingConfig();
  const [currentUser, setCurrentUser] = useState<any>(auth.currentUser);
  const [labratTheme, setLabratTheme] = useState<LabratThemeMode>(() => resolveLabratTheme());
  
  const renderWithLabRatBranding = (text: string) => {
    if (!text || !text.includes('LabRat')) return text;
    const parts = text.split('LabRat');
    return (
      <>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className="font-sans font-black tracking-tighter bg-gradient-to-r from-[#00c5f5] via-[#2176ff] to-[#a05eff] bg-clip-text text-transparent uppercase select-none inline-block">LABRAT</span>
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  const [isAdminPreviewCustomer, setIsAdminPreviewCustomer] = useState(false);
  const [isAdminPreviewKit, setIsAdminPreviewKit] = useState(false);
  const [isAdminPreviewChinaKit, setIsAdminPreviewChinaKit] = useState(false);
  const [isAdminPreviewChinaVial, setIsAdminPreviewChinaVial] = useState(false);


  useEffect(() => {
    if (typeof document === 'undefined') return;

    const syncTheme = () => setLabratTheme(resolveLabratTheme());
    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-labrat-theme']
    });

    window.addEventListener('storage', syncTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', syncTheme);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setCurrentUser(u);
    });
    return () => unsubscribe();
  }, []);

  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);

  const isAdminUser = currentUser?.email?.toLowerCase() === 'kyleheiser@gmail.com';
  const isViewingAsAdmin = isAdminUser && !isAdminPreviewCustomer;

  // Each status tier is locked to its own pricing — no cross-source toggle.
  // Anyone without an explicit tier (guest, no profile yet, or pending) now
  // defaults to China per-vial pricing so they can browse real prices first.
  const hasExplicitTier = !!memberProfile && ['approved', 'kit', 'chinakit', 'chinavial'].includes(memberProfile.status);
  const isKitPricing = (memberProfile?.status === 'kit' && !isAdminUser) || (isAdminUser && isAdminPreviewKit);
  const isChinaKitPricing = (memberProfile?.status === 'chinakit' && !isAdminUser) || (isAdminUser && isAdminPreviewChinaKit);
  const isChinaVialPricing = (memberProfile?.status === 'chinavial' && !isAdminUser) || (isAdminUser && isAdminPreviewChinaVial) || (!isAdminUser && !hasExplicitTier);
  const isApprovedVialPricing = (memberProfile?.status === 'approved' && !isAdminUser) || (isAdminUser && isAdminPreviewCustomer && !isAdminPreviewKit && !isAdminPreviewChinaKit && !isAdminPreviewChinaVial);

  // Application Layout Views
  // Users view: 'catalog' | 'cart' | 'checkout' | 'orders' | 'status_check'
  // Admin view: 'admin_members' | 'admin_orders' | 'admin_products'
  const [view, setView] = useState<string>('catalog');

  // Push a history entry so the back gesture navigates within the shop before closing the app
  const navigateView = useCallback((newView: string) => {
    window.history.pushState({ tab: 'shop', shopView: newView }, '');
    setView(newView);
  }, []);

  // Ref so the popstate handler can always see the current drawer state without stale closure
  const drawerOpenRef = React.useRef(false);

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      // If a product drawer is open, close it and stay on the current shop view
      if (drawerOpenRef.current) {
        setSelectedParentProductGroup(null);
        return;
      }
      if (e.state?.tab === 'shop' && e.state?.shopView) {
        setView(e.state.shopView);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const [showCertifications, setShowCertifications] = useState<boolean>(false);
  const [selectedCertKey, setSelectedCertKey] = useState<string | null>(null);
  const [showNorwayModal, setShowNorwayModal] = useState<boolean>(false);

  useEffect(() => {
    if (isAdminUser && !isAdminPreviewCustomer) {
      setView(v => ['admin_members', 'admin_orders', 'admin_pricing', 'catalog'].includes(v) ? v : 'admin_members');
    } else {
      setView(v => ['catalog', 'cart', 'orders'].includes(v) ? v : 'catalog');
    }
  }, [isAdminUser, isAdminPreviewCustomer]);
  
  // Database States
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [allOrdersGlobal, setAllOrdersGlobal] = useState<OrderDetail[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<Record<string, string>>({});

  // Make sure the server price book covers custom (Firestore-added) products too
  useEffect(() => {
    if (products.length) pricingConfig.ensureNames?.(products.map(p => p.name));
  }, [products, pricingConfig.ensureNames]);

  // Wholesale costs for the admin product form (admin-only endpoint)
  const [wholesaleBook, setWholesaleBook] = useState<WholesaleBook>({});
  useEffect(() => {
    if (!isAdminUser) return;
    fetchWholesaleBook(products.map(p => p.name))
      .then(setWholesaleBook)
      .catch(e => console.error('[shop] Failed to load wholesale costs:', e));
  }, [isAdminUser, products]);

  // Immersive Compound Dosages selector modal state
  const [selectedParentProductGroup, setSelectedParentProductGroup] = useState<{
    baseName: string;
    category: string;
    description: string;
    options: (ShopProduct & { size: string })[];
  } | null>(null);

  // Keep drawerOpenRef in sync so the popstate handler above can read it without a stale closure
  useEffect(() => {
    drawerOpenRef.current = selectedParentProductGroup !== null;
  }, [selectedParentProductGroup]);

  // Opening the drawer pushes a history entry so back-swipe closes it instead of leaving the shop
  const openProductDrawer = useCallback((group: { baseName: string; category: string; description: string; options: (ShopProduct & { size: string })[] } | null) => {
    if (group) window.history.pushState({ tab: 'shop', shopView: view, drawerOpen: true }, '');
    setSelectedParentProductGroup(group);
  }, [view]);
  const [selectedOptionIdInDrawer, setSelectedOptionIdInDrawer] = useState<string>('');
  const [drawerQuantity, setDrawerQuantity] = useState<number>(1);

  // Ticker: RAF-based auto-scroll so the user can also drag/swipe it natively
  const tickerRef = useRef<HTMLDivElement>(null);
  const tickerPausedRef = useRef(false);
  const tickerResumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const el = tickerRef.current;
    if (!el) return;
    let raf: number;
    let prev = 0;
    const step = (ts: number) => {
      if (!tickerPausedRef.current) {
        const dt = prev ? (ts - prev) / 1000 : 0;
        el.scrollLeft += 45 * dt;
        if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft -= el.scrollWidth / 2;
      }
      prev = ts;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      setSelectedProductIds(prev => {
        const next = { ...prev };
        products.forEach(p => {
          const { baseName } = getProductBaseAndSize(p.name);
          
          // Find all sizes of this compound name and sort by in-stock status (highest priority), then by price
          const sameCompound = products.filter(item => {
            const info = getProductBaseAndSize(item.name);
            return info.baseName === baseName;
          });
          sameCompound.sort((a, b) => {
            const stockA = getProductAvailableStock(a.id, a.inventory);
            const stockB = getProductAvailableStock(b.id, b.inventory);
            const hasA = stockA > 0 ? 1 : 0;
            const hasB = stockB > 0 ? 1 : 0;
            if (hasA !== hasB) {
              return hasB - hasA; // prioritize in stock
            }
            return a.price - b.price;
          });
          
          const bestOptionId = sameCompound[0]?.id;

          if (!next[baseName]) {
            if (bestOptionId) {
              next[baseName] = bestOptionId;
            }
          } else {
            const currentSelectedId = next[baseName];
            const currentSelectedOption = sameCompound.find(item => item.id === currentSelectedId);
            const currentStock = currentSelectedOption ? getProductAvailableStock(currentSelectedOption.id, currentSelectedOption.inventory) : 0;
            
            // Auto-heal and switch to in-stock size if currently selected is out-of-stock but an in-stock size is available
            const bestStock = sameCompound[0] ? getProductAvailableStock(bestOptionId, sameCompound[0].inventory) : 0;
            if (currentStock <= 0 && bestStock > 0 && bestOptionId) {
              next[baseName] = bestOptionId;
            }
          }
        });
        return next;
      });
    }
  }, [products, allOrdersGlobal]);
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [adminMembersList, setAdminMembersList] = useState<MemberProfile[]>([]);
  const [adminOrdersList, setAdminOrdersList] = useState<OrderDetail[]>([]);
  const pendingApprovalCount = adminMembersList.filter(member => member.status === 'pending').length;
  const newOrderCount = adminOrdersList.filter(order => order.status === 'placed').length;
  
  // Loading states — skip spinner when no user is present (auth.currentUser is sync)
  const [profileLoading, setProfileLoading] = useState(() => !!auth.currentUser);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState(() => {
    // Deep-link seed set by the AI assistant's "recommend product" action.
    const seed = safeLocalStorage.getItem('labrat_shop_search_seed');
    if (seed) {
      safeLocalStorage.removeItem('labrat_shop_search_seed');
      return seed;
    }
    return '';
  });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showShopSuggestions, setShowShopSuggestions] = useState(false);

  // Registration / Join Waitlist inputs
  const [joinForm, setJoinForm] = useState({
    shippingAddress: '',
    phone: '',
    pricingPreference: 'vial' as 'vial' | 'kit',
    source: 'norway' as 'norway' | 'china',
    selectedProducts: [] as string[]
  });

  // Compute product groups for registration form — groups unique base compound names by category with source availability
  const registrationProductGroups = useMemo(() => {
    const CATEGORY_ORDER = ['Muscle Growth','Weight Loss','Healing & Repair','Cognitive & Focus','Longevity & Cellular','Immune & Health','Beauty & Radiance','Sleep & Recovery'];
    const groups: Record<string, { category: string; availableNorway: boolean; availableChina: boolean }> = {};
    for (const p of SAMPLE_INVENTORY) {
      if (p.category === 'Reconstitution Solvents') continue;
      const { baseName } = getProductBaseAndSize(p.name);
      if (!groups[baseName]) groups[baseName] = { category: p.category, availableNorway: false, availableChina: false };
      if (!p.sourceRestriction || p.sourceRestriction === 'norway') groups[baseName].availableNorway = true;
      if (!p.sourceRestriction || p.sourceRestriction === 'china') groups[baseName].availableChina = true;
    }
    return CATEGORY_ORDER
      .map(cat => ({
        category: cat,
        products: Object.entries(groups)
          .filter(([, g]) => g.category === cat)
          .map(([name, g]) => ({ name, ...g }))
          .sort((a, b) => a.name.localeCompare(b.name))
      }))
      .filter(g => g.products.length > 0);
  }, []);

  // Shipping details for checkout inputs
  const [shippingForm, setShippingForm] = useState({
    fullName: currentUser?.displayName || '',
    addressLine1: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    notes: ''
  });

  // Shipping Carrier and Rates states
  const [selectedShippingOptionId, setSelectedShippingOptionId] = useState<string>('usps_ground');
  const [shippingCarrierFilter, setShippingCarrierFilter] = useState<'ALL' | 'USPS' | 'UPS'>('ALL');

  // Local Shopping Cart State (Cached in LocalStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = safeLocalStorage.getItem('labrat_member_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // BAC water add-on quantity at checkout (for China/Norway customers)
  const [bacWaterQty, setBacWaterQty] = useState(0);

  // Active Order Success Feedback Modals
  const [lastPlacedOrder, setLastPlacedOrder] = useState<OrderDetail | null>(null);
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);
  const [errorToast, setErrorToast] = useState('');
  const errorToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showErrorToast = (msg: string) => {
    setErrorToast(msg);
    if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
    errorToastTimer.current = setTimeout(() => setErrorToast(''), 6000);
  };

  // Dynamic Product Creator inputs (Admin Only)
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ShopProduct | null>(null);
  const [confirmDeleteProductId, setConfirmDeleteProductId] = useState<string | null>(null);
  const [confirmDeleteOrderId, setConfirmDeleteOrderId] = useState<string | null>(null);
  const [confirmDeleteMemberId, setConfirmDeleteMemberId] = useState<string | null>(null);
  const [productValidationError, setProductValidationError] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    price: 0,
    inventory: 50,
    sourceRestriction: '' as '' | 'china' | 'norway'
  });

  // Live-subscribe to member profile so status changes (e.g. approved → kit) take effect immediately
  useEffect(() => {
    if (!currentUser) {
      setMemberProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    let formInitialized = false;

    const unsubscribe = onSnapshot(
      doc(db, 'members', currentUser.uid),
      (snap) => {
        setProfileLoading(false);
        if (snap.exists()) {
          const profileData = snap.data() as MemberProfile;
          setMemberProfile(profileData);
          if (!formInitialized) {
            formInitialized = true;
            setJoinForm(prev => ({
              ...prev,
              shippingAddress: profileData.shippingAddress || '',
              phone: profileData.phone || ''
            }));
            const parsed = parseShippingAddress(profileData.shippingAddress || '');
            setShippingForm(prev => ({
              ...prev,
              fullName: prev.fullName || currentUser.displayName || '',
              addressLine1: parsed.addressLine1 || '',
              city: parsed.city || '',
              state: parsed.state || '',
              zipCode: parsed.zipCode || '',
              phone: profileData.phone || prev.phone || ''
            }));
          }
        } else {
          setMemberProfile(null);
        }
      },
      (e) => {
        console.error('Error subscribing to member profile', e);
        setProfileLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Sync Cart to LocalStorage
  useEffect(() => {
    safeLocalStorage.setItem('labrat_member_cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch all orders globally to calculate dynamic inventory.
  // Admin-only: order docs contain customer PII (names, addresses, phones),
  // and member views treat every product as in-stock anyway.
  const fetchGlobalOrders = async () => {
    if (!isAdminUser) return;
    try {
      const snap = await getDocs(collection(db, 'orders'));
      const list: OrderDetail[] = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as OrderDetail);
      });
      setAllOrdersGlobal(list);
    } catch (e) {
      console.warn('Failed to fetch global orders (expected for pending/non-member users):', e);
    }
  };

  // Unified available stock computer (takes base product stock and subtracting quantities from active orders)
  function getProductAvailableStock(prodId: string, baseInventory: number): number {
    // All products are in stock for every customer view; only the admin sees real inventory counts
    if (!isViewingAsAdmin) return 999;
    let stock = baseInventory;

    allOrdersGlobal.forEach(order => {
      const item = order.items?.find((i: any) => i.id === prodId);
      if (item) {
        // Parse order date
        const orderDate = new Date(order.createdAt);
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        
        const isUnpaidAndExpired = order.paymentStatus !== 'paid' && orderDate < fourteenDaysAgo;
        
        // Only deduct if order is active (not unpaid & expired)
        if (!isUnpaidAndExpired) {
          stock -= item.quantity;
        }
      }
    });
    
    return Math.max(0, stock);
  }

  // Catalog display filter: BAC / bacteriostatic water is only offered in 10ml.
  const catalogFilter = (list: ShopProduct[]): ShopProduct[] => list.filter(p => {
    const n = (p.name || '').toLowerCase();
    const isWater = n.includes('bac water') || n.includes('bacteriostatic');
    if (!isWater) return true;
    const size = getProductBaseAndSize(p.name).size.toLowerCase().replace(/\s/g, '');
    return size === '' || size === '10ml';
  });

  // Load Inventory Catalog
  const fetchProducts = async () => {
    setCatalogLoading(true);
    try {
      await fetchGlobalOrders();

      // Start from SAMPLE_INVENTORY so the catalog is always visible even if
      // Firestore read permissions are denied for regular members.
      const displayList: ShopProduct[] = [...SAMPLE_INVENTORY];

      // Attempt Firestore read — override display items with stored values if available.
      // Also keep a separate list for sync comparison so self-healing still works for admins.
      let firestoreItems: ShopProduct[] = [];
      try {
        const colRef = collection(db, 'shopItems');
        const snap = await getDocs(colRef);
        snap.forEach(docSnap => {
          firestoreItems.push({ id: docSnap.id, ...docSnap.data() } as ShopProduct);
        });
        firestoreItems.forEach(item => {
          const idx = displayList.findIndex(p => p.id === item.id);
          if (idx !== -1) {
            const sample = displayList[idx];
            // Preserve sourceRestriction from SAMPLE_INVENTORY when Firestore record predates it
            displayList[idx] = {
              ...item,
              sourceRestriction: item.sourceRestriction ?? sample.sourceRestriction
            };
          }
        });
      } catch (firestoreErr) {
        console.warn('Firestore shopItems read failed, using local inventory as fallback', firestoreErr);
      }

      // Self-healing sync: only admins can write shopItems — skip entirely for regular members
      if (isAdminUser) {
        const syncPromises: Promise<void>[] = [];

        for (const sample of SAMPLE_INVENTORY) {
          const existingIndex = firestoreItems.findIndex(p => p.id === sample.id);
          if (existingIndex === -1) {
            syncPromises.push(
              setDoc(doc(db, 'shopItems', sample.id), sample)
                .then(() => { firestoreItems.push(sample); })
                .catch(err => { console.error(`Failed to auto-provision item: ${sample.id}`, err); })
            );
          } else {
            const existing = firestoreItems[existingIndex];
            if (
              existing.name !== sample.name ||
              existing.description !== sample.description ||
              existing.category !== sample.category ||
              existing.price !== sample.price ||
              existing.inventory !== sample.inventory ||
              existing.sourceRestriction !== sample.sourceRestriction
            ) {
              const updated = {
                ...existing,
                name: sample.name,
                description: sample.description,
                category: sample.category,
                price: sample.price,
                inventory: sample.inventory,
                ...(sample.sourceRestriction ? { sourceRestriction: sample.sourceRestriction } : {})
              };
              syncPromises.push(
                setDoc(doc(db, 'shopItems', sample.id), updated)
                  .then(() => {
                    firestoreItems[existingIndex] = updated;
                  })
                  .catch(err => { console.error(`Failed to auto-update item: ${sample.id}`, err); })
              );
            }
          }
        }

        const activeSampleIdsSet = new Set(SAMPLE_INVENTORY.map(s => s.id));
        const obsoleteItems = firestoreItems.filter(item => !activeSampleIdsSet.has(item.id));
        await Promise.all([
          ...syncPromises,
          ...obsoleteItems.map(item =>
            deleteDoc(doc(db, 'shopItems', item.id)).catch(err =>
              console.error(`Failed to auto-delete obsolete database item: ${item.id}`, err)
            )
          )
        ]);
      }

      // Display list is already filtered to SAMPLE_INVENTORY ids (seeded above)
      setProducts(catalogFilter(displayList));
    } catch (e) {
      console.error('Failed fetching shop inventory', e);
      // Fall back to local inventory so the catalog is never blank
      setProducts(catalogFilter([...SAMPLE_INVENTORY]));
      handleFirestoreError(e, OperationType.LIST, 'shopItems');
    } finally {
      setCatalogLoading(false);
    }
  };

  useEffect(() => {
    // Catalog is now visible to everyone (China-vial pricing by default), so
    // always load it — falls back to SAMPLE_INVENTORY if Firestore is denied.
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberProfile, isAdminUser]);

  // Fetch User's Orders history
  const fetchUserOrders = async () => {
    if (!currentUser) return;
    setOrdersLoading(true);
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
      const snap = await getDocs(q);
      const list: OrderDetail[] = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as OrderDetail);
      });
      // Sort orders descending by date / ID
      list.sort((a,b) => b.id.localeCompare(a.id));
      setOrders(list);
    } catch (e) {
      console.error('Failed loading order history', e);
      handleFirestoreError(e, OperationType.LIST, 'orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'orders') {
      fetchUserOrders();
    }
  }, [view]);

  // Auto-scroll up to show purchased items, order status, or when checking/updating shipping address details
  useEffect(() => {
    if (view === 'checkout' || view === 'orders' || view === 'cart' || showOrderSuccessModal) {
      setTimeout(() => {
        const anchor = document.getElementById('shop-viewport-anchor');
        if (anchor) {
          anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    }
  }, [view, showOrderSuccessModal]);

  // Loading Admin datasets
  const fetchAdminData = async () => {
    if (!isAdminUser) return;

    const shouldShowMemberSpinner = view === 'admin_members';
    const shouldShowOrderSpinner = view === 'admin_orders';

    if (shouldShowMemberSpinner) setMembersLoading(true);
    if (shouldShowOrderSpinner) setOrdersLoading(true);

    try {
      const snap = await getDocs(collection(db, 'members'));
      const list: MemberProfile[] = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as MemberProfile);
      });
      list.sort((a, b) => {
        const rank: Record<MemberProfile['status'], number> = { pending: 0, approved: 1, kit: 2, chinakit: 3, chinavial: 4, blocked: 5 };
        const statusRank = rank[a.status] - rank[b.status];
        if (statusRank !== 0) return statusRank;
        return (b.updatedAt || b.createdAt || '').toString().localeCompare((a.updatedAt || a.createdAt || '').toString());
      });
      setAdminMembersList(list);
    } catch (e) {
      console.error('Failed fetching member registrations', e);
      handleFirestoreError(e, OperationType.LIST, 'members');
    } finally {
      if (shouldShowMemberSpinner) setMembersLoading(false);
    }

    try {
      const snap = await getDocs(collection(db, 'orders'));
      const list: OrderDetail[] = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as OrderDetail);
      });
      list.sort((a, b) => {
        const toMs = (v: any) => v ? new Date(typeof v.toDate === 'function' ? v.toDate() : v).getTime() : 0;
        return toMs(b.createdAt) - toMs(a.createdAt);
      });
      setAdminOrdersList(list);
    } catch (e) {
      console.error('Failed loading all retail orders', e);
      handleFirestoreError(e, OperationType.LIST, 'orders');
    } finally {
      if (shouldShowOrderSpinner) setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminUser) {
      fetchAdminData();
    }
  }, [view, isAdminUser]);

  // Seeding Catalog with default products (Admin Only)
  const handleSeedDatabase = async () => {
    triggerHaptic('medium');
    setActionLoading('seed');
    try {
      const batch = writeBatch(db);
      for (const item of SAMPLE_INVENTORY) {
        const docRef = doc(db, 'shopItems', item.id);
        batch.set(docRef, item);
      }
      await batch.commit();
      await fetchProducts();
    } catch (e) {
      console.error('Failed seeding products catalog', e);
    } finally {
      setActionLoading(null);
    }
  };

  // Submit Membership Application
  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    triggerHaptic('medium');
    setActionLoading('join');
    try {
      const ref = doc(db, 'members', currentUser.uid);
      const payload: MemberProfile = {
        id: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName || 'Anonymous LabRat',
        status: 'pending',
        pricingPreference: joinForm.pricingPreference,
        shippingAddress: joinForm.shippingAddress,
        phone: joinForm.phone,
        requestedSource: joinForm.source,
        requestedProducts: joinForm.selectedProducts,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(ref, payload);
      setMemberProfile(payload);
      const parsed = parseShippingAddress(payload.shippingAddress || '');
      setShippingForm(prev => ({
        ...prev,
        fullName: prev.fullName || currentUser.displayName || '',
        addressLine1: parsed.addressLine1 || '',
        city: parsed.city || '',
        state: parsed.state || '',
        zipCode: parsed.zipCode || '',
        phone: payload.phone || prev.phone || ''
      }));
    } catch (err) {
      console.error('Error submitting application', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Admin approval mechanics
  const handleSetMemberStatus = async (userId: string, status: 'pending' | 'approved' | 'blocked' | 'kit' | 'chinakit' | 'chinavial') => {
    triggerHaptic('light');
    setActionLoading(`member_${userId}_${status}`);
    try {
      const ref = doc(db, 'members', userId);
      await updateDoc(ref, { 
        status,
        updatedAt: new Date().toISOString()
      });
      // Update local admin state cleanly
      setAdminMembersList(prev => prev.map(m => m.id === userId ? { ...m, status } : m));
    } catch (e) {
      console.error('Failed to change member privilege', e);
    } finally {
      setActionLoading(null);
    }
  };

  // Member requests kit pricing upgrade
  const handleRequestKitUpgrade = async () => {
    if (!currentUser) return;
    triggerHaptic('medium');
    setActionLoading('kit_upgrade_request');
    try {
      await updateDoc(doc(db, 'members', currentUser.uid), {
        kitUpgradeRequested: true,
        kitUpgradeRequestedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setMemberProfile(prev => prev ? { ...prev, kitUpgradeRequested: true } : prev);
    } catch (e) {
      console.error('Failed to submit kit upgrade request', e);
    } finally {
      setActionLoading(null);
    }
  };

  // Admin deletion mechanics: removes the user's shop member profile/application.
  // This does not delete their Firebase Authentication account, which requires server-side admin privileges.
  const handleDeleteMemberProfile = async (userId: string) => {
    triggerHaptic('medium');
    setActionLoading(`member_${userId}_delete`);
    try {
      await deleteDoc(doc(db, 'members', userId));
      setAdminMembersList(prev => prev.filter(m => m.id !== userId));
      setConfirmDeleteMemberId(current => current === userId ? null : current);
    } catch (e) {
      console.error('Failed to delete member profile', e);
    } finally {
      setActionLoading(null);
    }
  };

  // Order status transitions (Admin Only)
  const handleUpdateOrderStatus = async (orderId: string, status: OrderDetail['status']) => {
    triggerHaptic('light');
    setActionLoading(`order_${orderId}_${status}`);
    try {
      const ref = doc(db, 'orders', orderId);
      await updateDoc(ref, { status });
      setAdminOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      setAllOrdersGlobal(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      // Notify customer of status change (fire-and-forget)
      const order = allOrdersGlobal.find(o => o.id === orderId);
      if (order?.userId) {
        auth.currentUser?.getIdToken()
          .then(token => fetch('/api/notify-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ type: 'status_change', orderId, customerUserId: order.userId, status }),
          }))
          .catch(e => console.error('[notify-order] status_change push failed', e));
      }
    } catch (e) {
      console.error('Failed changing order status flag', e);
    } finally {
      setActionLoading(null);
    }
  };

  // Delete order (Admin Only)
  const handleDeleteOrder = async (orderId: string) => {
    triggerHaptic('medium');
    setActionLoading(`delete_order_${orderId}`);
    try {
      const ref = doc(db, 'orders', orderId);
      await deleteDoc(ref);
      setAdminOrdersList(prev => prev.filter(o => o.id !== orderId));
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setAllOrdersGlobal(prev => prev.filter(o => o.id !== orderId));
    } catch (e) {
      console.error('Failed deleting order', e);
    } finally {
      setActionLoading(null);
    }
  };

  // Seeding sample order for KyleHeiser@gmail.com
  const handleSeedDemoOrder = async () => {
    triggerHaptic('success');
    setActionLoading('seed_order');
    try {
      const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      const emailToUse = 'KyleHeiser@gmail.com';
      const orderPayload: any = {
        userId: currentUser?.uid || 'demo_kyle_user_id',
        email: emailToUse,
        displayName: currentUser?.displayName || 'Kyle Heiser',
        items: [
          {
            id: 'sample_bpc_157',
            name: 'BPC-157 / TB-500 Blend (10mg)',
            price: 110,
            quantity: 2
          },
          {
            id: 'sample_tirzepatide',
            name: 'Tirzepatide (30mg)',
            price: 380,
            quantity: 1
          }
        ],
        total: 600,
        shippingInfo: {
          fullName: 'Kyle Heiser',
          addressLine1: '456 Biotech Research Plaza, Suite C',
          city: 'Boston',
          state: 'MA',
          zipCode: '02111',
          phone: '(555) 789-1234',
          notes: 'Deliver to secure secondary research refrigerator. Standard cold-chain shipping.'
        },
        status: 'placed',
        paymentStatus: 'unpaid',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'orders', orderId), orderPayload);
      
      const newOrderWithId = { id: orderId, ...orderPayload } as OrderDetail;
      setAdminOrdersList(prev => [newOrderWithId, ...prev]);
      setOrders(prev => [newOrderWithId, ...prev]);
    } catch (e) {
      console.error('Failed to seed demo order', e);
    } finally {
      setActionLoading(null);
    }
  };

  // Mark order as paid
  const handleMarkAsPaid = async (orderId: string) => {
    triggerHaptic('success');
    setActionLoading(`pay_${orderId}`);
    try {
      const ref = doc(db, 'orders', orderId);
      await updateDoc(ref, {
        paymentStatus: 'paid',
        status: 'processing'
      });
      setAdminOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: 'paid', status: 'processing' } : o));
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: 'paid', status: 'processing' } : o));
      setAllOrdersGlobal(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: 'paid', status: 'processing' } : o));
    } catch (e) {
      console.error('Failed updating payment status', e);
    } finally {
      setActionLoading(null);
    }
  };

  // Submit tracking details and transition to 'shipped'
  const handleShipOrder = async (orderId: string, trackingNumber: string) => {
    triggerHaptic('success');
    setActionLoading(`ship_${orderId}`);
    try {
      const ref = doc(db, 'orders', orderId);
      await updateDoc(ref, {
        status: 'shipped',
        trackingNumber,
        trackingStatus: 'shipped'
      });
      setAdminOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, status: 'shipped', trackingNumber, trackingStatus: 'shipped' } : o));
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'shipped', trackingNumber, trackingStatus: 'shipped' } : o));
    } catch (e) {
      console.error('Failed updating tracking details', e);
    } finally {
      setActionLoading(null);
    }
  };

  // Simulated Carrier Delivery check
  const handleSimulateDeliveryCheck = async (orderId: string) => {
    triggerHaptic('success');
    setActionLoading(`check_${orderId}`);
    try {
      // Short delay to simulate API verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const ref = doc(db, 'orders', orderId);
      await updateDoc(ref, {
        status: 'completed',
        trackingStatus: 'delivered'
      });
      setAdminOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed', trackingStatus: 'delivered' } : o));
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed', trackingStatus: 'delivered' } : o));
    } catch (e) {
      console.error('Failed simulating carrier delivery update', e);
    } finally {
      setActionLoading(null);
    }
  };

  // Add Item to Shopping Cart
  const handleAddToCart = (product: ShopProduct) => {
    triggerHaptic('light');
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  // Adjust cart quantity
  const handleAdjustQuantity = (productId: string, delta: number) => {
    triggerHaptic('light');
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  // Remove item completely
  const handleRemoveFromCart = (productId: string) => {
    triggerHaptic('medium');
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Get total items and checkout price
  const getCartTotals = () => {
    const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cart.reduce((acc, item) => {
      const price = isKitPricing
        ? (getKitSellPrice(item.product.name, pricingConfig) || item.product.price)
        : isChinaKitPricing
        ? (getChinaKitSellPrice(item.product.name, pricingConfig) || item.product.price)
        : (getChinaVialSellPrice(item.product.name, pricingConfig) || getSalePrice(item.product.price, item.product.name, pricingConfig));
      return acc + price * item.quantity;
    }, 0);
    return { totalQty, subtotal };
  };

  // Checkout order placement — prices, shipping, tax, and total are computed
  // server-side (/api/create-order) so a tampered client can't alter them.
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    // Browsing is open to everyone; completing an order needs a free account.
    if (!currentUser) { triggerHaptic('medium'); onRequestAuth?.('signup'); return; }
    if (cart.length === 0) return;

    triggerHaptic('heavy');
    setActionLoading('checkout');

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Please sign in again to place your order.');
      const tier = isKitPricing ? 'kit' : isChinaKitPricing ? 'chinakit' : isChinaVialPricing ? 'chinavial' : 'retail';
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          items: cart.map(item => ({ id: item.product.id, quantity: item.quantity })),
          bacWaterQty,
          shippingForm,
          selectedShippingOptionId,
          tier, // honored only for the admin; members are priced by their Firestore status
          displayName: currentUser.displayName || 'Anonymous LabRat',
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Order failed (server error ${res.status})`);
      }
      const orderPayload: OrderDetail = (await res.json()).order;

      // Capture registration from the checkout details — a buyer's first order
      // auto-registers them (China-vial tier) so there's no separate signup.
      if (!memberProfile && currentUser) {
        try {
          const sf = shippingForm;
          const addr = [sf.addressLine1, sf.city, `${sf.state} ${sf.zipCode}`.trim()].filter(Boolean).join(', ');
          const prof: MemberProfile = {
            id: currentUser.uid,
            email: currentUser.email || '',
            displayName: sf.fullName || currentUser.displayName || 'labrat Member',
            status: 'chinavial',
            shippingAddress: addr,
            phone: sf.phone || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'members', currentUser.uid), prof, { merge: true });
          setMemberProfile(prof);
        } catch (err) {
          console.error('[shop] auto-register from checkout failed', err);
        }
      }

      // Update global orders state to recalculate inventory instantly
      setAllOrdersGlobal(prev => [orderPayload, ...prev]);

      // Complete! Reset parameters
      setLastPlacedOrder(orderPayload);
      setCart([]);
      setBacWaterQty(0);
      setShowOrderSuccessModal(true);
      setView('catalog');
      // Notify admin of new order (fire-and-forget)
      auth.currentUser?.getIdToken()
        .then(t => fetch('/api/notify-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t}` },
          body: JSON.stringify({ type: 'order_placed', orderId: orderPayload.id, customerEmail: currentUser.email }),
        }))
        .catch(err => console.error('[notify-order] order_placed push failed', err));
    } catch (e: any) {
      console.error('Error recording retail order', e);
      showErrorToast(e?.message || 'Order failed — please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Admin Catalog CRUD - Add/Edit Products
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');
    setProductValidationError(null);
    setActionLoading('save_product');
    
    // 10mg / 20mg Gap Validation
    const info = getProductBaseAndSize(productForm.name);
    const formPrice = Number(productForm.price);
    const sizeLower = info.size.toLowerCase();
    
    if (sizeLower === '10mg' || sizeLower === '20mg') {
      const otherSize = sizeLower === '10mg' ? '20mg' : '10mg';
      const existingOther = products.find(p => {
        const pInfo = getProductBaseAndSize(p.name);
        return pInfo.baseName === info.baseName && pInfo.size.toLowerCase() === otherSize && p.id !== (editingProduct?.id || '');
      });
      
      if (existingOther) {
        if (sizeLower === '10mg') {
          // This is 10mg, existingOther is 20mg
          const gap = existingOther.price - formPrice;
          if (gap <= 2) {
            setProductValidationError(`Pricing Gap Rule: The 10mg option cannot be within $2 of the 20mg option. Currently, 20mg is $${existingOther.price}, so 10mg must be less than $${existingOther.price - 2}. (Current gap: $${gap.toFixed(2)})`);
            setActionLoading(null);
            return;
          }
        } else {
          // This is 20mg, existingOther is 10mg
          const gap = formPrice - existingOther.price;
          if (gap <= 2) {
            setProductValidationError(`Pricing Gap Rule: The 20mg option must be at least $2.01 more expensive than the 10mg option. Currently, 10mg is $${existingOther.price}, so 20mg must be at least $${existingOther.price + 3}. (Current gap: $${gap.toFixed(2)})`);
            setActionLoading(null);
            return;
          }
        }
      }
    }
    
    const productId = editingProduct ? editingProduct.id : `prod_${Date.now()}`;
    const targetProduct: ShopProduct = {
      id: productId,
      name: productForm.name,
      description: productForm.description,
      category: productForm.category,
      price: formPrice,
      inventory: Number(productForm.inventory),
      ...(productForm.sourceRestriction ? { sourceRestriction: productForm.sourceRestriction } : {})
    };

    try {
      await setDoc(doc(db, 'shopItems', productId), targetProduct);
      await fetchProducts();
      setShowProductModal(false);
      setEditingProduct(null);
      setProductValidationError(null);
      setProductForm({ name: '', description: '', category: '', price: 0, inventory: 50, sourceRestriction: '' });
    } catch (e) {
      console.error('Failed logging product catalog', e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    triggerHaptic('medium');
    try {
      await deleteDoc(doc(db, 'shopItems', id));
      await fetchProducts();
    } catch (e) {
      console.error('Failed removing product catalog', e);
    }
  };

  // Get unique category list
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Determine whether current viewer is a China customer (real or admin preview)
  const isAnyChinaPricing = isChinaKitPricing || isChinaVialPricing;
  const isAnyNorwayPricing = isKitPricing || (
    memberProfile?.status === 'approved' ||
    (isAdminPreviewCustomer && !isAdminPreviewKit && !isAdminPreviewChinaKit && !isAdminPreviewChinaVial)
  );

  // Filter products by category, query, and source restriction
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    // Source restriction: China customers should not see Norway-only products
    // Norway customers should not see China-only products
    // Admins see everything (unless in a preview mode)
    let matchesSource = true;
    if (!isViewingAsAdmin) {
      if (isAnyChinaPricing && p.sourceRestriction === 'norway') matchesSource = false;
      if (!isAnyChinaPricing && p.sourceRestriction === 'china') matchesSource = false;
      // Hide products from China customers that have no China price defined
      // (not in resolveChineseKitCost / resolveChineseVialCost) and aren't solvents
      // Hide BAC water from all customers — available as a $7/vial checkout add-on
      const isBacWater = p.id.startsWith('prod_bac_water');
      if (isBacWater) matchesSource = false;
      // Hide products from China customers that have no China price defined
      if (isAnyChinaPricing && !isBacWater && !getChinaKitSellPrice(p.name, pricingConfig) && !getChinaVialSellPrice(p.name, pricingConfig)) matchesSource = false;
    }
    return matchesCategory && matchesSearch && matchesSource;
  });

  const { totalQty, subtotal } = getCartTotals();

  return (
    <div className="flex flex-col gap-4" id="members-shop-page" style={{ animation: 'none' }}>

      {/* Scrolling credential pill ticker — auto-scrolls, swipeable */}
      {(() => {
        const darkPill = labratTheme === 'clinical-light'
          ? 'bg-slate-200 text-slate-600 border-slate-400/60'
          : 'bg-slate-700/60 text-slate-200 border-slate-500/50';
        const pills = [
          { label: '🚚 Free Shipping', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', certKey: undefined as string | undefined },
          { label: 'Authorized Lab Supply', cls: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/25', certKey: 'authorized_supply' },
          { label: '🔬 Research Use Only',  cls: 'bg-amber-500/20 text-amber-300 border-amber-500/25', certKey: 'research_only' },
          { label: '✓ 99% Purity',          cls: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20', certKey: '99_purity' },
          { label: '✓ Certified Source',    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', certKey: 'certified_source' },
          { label: 'COAs Available',         cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20', certKey: 'coas_available' },
          { label: 'SOP Verified',           cls: 'bg-purple-500/10 text-purple-300 border-purple-500/20', certKey: 'sop_verified' },
          { label: 'ISO 17025',              cls: darkPill, certKey: 'iso_17025' },
          { label: 'ISO 9001',               cls: darkPill, certKey: 'iso_9001' },
          { label: 'EU GMP Annex 1',         cls: darkPill, certKey: 'eu_gmp' },
          { label: 'GDP Standard',           cls: darkPill, certKey: 'gdp' },
        ];
        const onGrab = () => {
          tickerPausedRef.current = true;
          if (tickerResumeTimer.current) clearTimeout(tickerResumeTimer.current);
        };
        const onRelease = () => {
          tickerResumeTimer.current = setTimeout(() => { tickerPausedRef.current = false; }, 2000);
        };
        return (
          <div
            ref={tickerRef}
            className={`overflow-x-auto scrollbar-hide flex items-center gap-2 rounded-xl border py-2 px-3 cursor-grab active:cursor-grabbing select-none ${labratTheme === 'clinical-light' ? 'border-slate-300/70 bg-slate-100/90' : 'border-cyan-500/20 bg-[#060d1a]'}`}
            onPointerDown={onGrab}
            onPointerUp={onRelease}
            onPointerLeave={onRelease}
          >
            {[0, 1].map(copy => (
              <React.Fragment key={copy}>
                {pills.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={p.certKey ? () => { triggerHaptic('light'); setSelectedCertKey(p.certKey!); } : undefined}
                    className={`inline-flex items-center shrink-0 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase border ${p.cls} ${p.certKey ? 'cursor-pointer hover:brightness-125 active:scale-95 transition-all' : 'cursor-default'}`}
                  >
                    {p.label}
                  </button>
                ))}
                <span className="inline-block w-6 shrink-0" aria-hidden="true" />
              </React.Fragment>
            ))}
          </div>
        );
      })()}

      {/* Upper Status Cards / Welcome banners */}
      <div className="bg-[#0b1329] border border-[#1e293b] rounded-xl p-3 sm:p-4 relative" id="shop-welcome-hero">
        <div className="absolute top-0 right-0 p-6 opacity-5 text-slate-100 pointer-events-none overflow-hidden rounded-xl">
          <ShoppingBag className="w-48 h-48" />
        </div>
        <div className="relative z-10 flex flex-col gap-3">
          <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-x-2">
            <span className="text-base font-black tracking-tighter font-sans uppercase">LABRAT</span>
            <span className="text-slate-300 font-semibold">Bioresearch Peptide &amp; Compound Shop</span>
          </h1>

          {/* Customer nav — same for everyone including admin-in-preview */}
          {(memberProfile?.status === 'approved' || memberProfile?.status === 'kit' || memberProfile?.status === 'chinakit' || memberProfile?.status === 'chinavial' || isAdminUser) && (
            <div className="flex items-center gap-1 w-full bg-slate-950 p-1 rounded-xl border border-slate-800 mt-2">
              <button
                onClick={() => { triggerHaptic('light'); navigateView('catalog'); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${view === 'catalog' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Catalog
              </button>
              <button
                onClick={() => { triggerHaptic('light'); navigateView('cart'); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 relative cursor-pointer ${view === 'cart' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <ShoppingCart className="w-3.5 h-3.5" /> Cart
                {totalQty > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                    {totalQty}
                  </span>
                )}
              </button>
              <button
                onClick={() => { triggerHaptic('light'); navigateView('orders'); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${view === 'orders' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <ClipboardList className="w-3.5 h-3.5" /> Orders
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Admin control bar — only visible to admins */}
      {isAdminUser && (
        <div className="bg-red-950/20 border border-red-500/20 rounded-xl px-3 py-2 flex flex-col gap-2" id="admin-control-bar">
          {/* Row 1: nav tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-[9px] font-black uppercase tracking-widest text-red-400 shrink-0">Admin</span>
            <div className="w-px h-4 bg-red-500/20 shrink-0" />
            <button
              onClick={() => { triggerHaptic('light'); setIsAdminPreviewCustomer(false); navigateView('admin_members'); }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 relative shrink-0 ${view === 'admin_members' && !isAdminPreviewCustomer ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-red-400/70 hover:text-red-300 hover:bg-red-500/10'}`}
            >
              <Users className="w-3 h-3" /> Members
              {pendingApprovalCount > 0 && (
                <span className="min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-red-500 text-white text-[9px] font-black leading-none flex items-center justify-center animate-pulse">
                  {pendingApprovalCount > 99 ? '99+' : pendingApprovalCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { triggerHaptic('light'); setIsAdminPreviewCustomer(false); navigateView('admin_orders'); }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 relative shrink-0 ${view === 'admin_orders' && !isAdminPreviewCustomer ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-red-400/70 hover:text-red-300 hover:bg-red-500/10'}`}
            >
              <ClipboardList className="w-3 h-3" /> Orders
              {newOrderCount > 0 && (
                <span className="min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black leading-none flex items-center justify-center animate-pulse">
                  {newOrderCount > 99 ? '99+' : newOrderCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { triggerHaptic('light'); setIsAdminPreviewCustomer(false); navigateView('catalog'); }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer shrink-0 ${['catalog', 'admin_products'].includes(view) && !isAdminPreviewCustomer ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-red-400/70 hover:text-red-300 hover:bg-red-500/10'}`}
            >
              Products
            </button>
            <button
              onClick={() => { triggerHaptic('light'); setIsAdminPreviewCustomer(false); navigateView('admin_pricing'); }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer shrink-0 ${view === 'admin_pricing' && !isAdminPreviewCustomer ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-red-400/70 hover:text-red-300 hover:bg-red-500/10'}`}
            >
              💰 Pricing
            </button>
          </div>
          {/* Row 2: view toggle — Admin management vs the single customer view */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-900/60 border border-slate-800 rounded-xl p-0.5 self-start">
            <button
              onClick={() => { triggerHaptic('light'); setIsAdminPreviewCustomer(false); setIsAdminPreviewKit(false); setIsAdminPreviewChinaKit(false); setIsAdminPreviewChinaVial(false); navigateView('admin_members'); }}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                !isAdminPreviewCustomer ? 'bg-red-500/20 text-red-300' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => { triggerHaptic('light'); setIsAdminPreviewCustomer(true); setIsAdminPreviewKit(false); setIsAdminPreviewChinaKit(false); setIsAdminPreviewChinaVial(true); navigateView('catalog'); }}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                isAdminPreviewCustomer ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Customer view
            </button>
          </div>
        </div>
      )}

      {/* Anchor point for high-fidelity scrolling directly to the forms/lists */}
      <div id="shop-viewport-anchor" className="scroll-mt-10 h-0 w-full" />

      {/* RENDER LOGIC BY STATES */}

      {profileLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#0b1329] border border-[#1e293b]/70 rounded-2xl min-h-[60vh]" id="loading-spinner-wrapper">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-3" />
          <p className="text-slate-400 text-sm">Synchronizing membership credentials...</p>
        </div>
      ) : !isAdminUser && memberProfile && memberProfile.status === 'blocked' ? (
        /* ACCESS BLOCKED SCREEN */
        <div className="bg-[#0b1329] border border-red-500/20 rounded-2xl p-8 text-center flex flex-col items-center py-16" id="blocked-waitlist-lobby">
          <div className="p-4 bg-red-500/10 text-red-400 rounded-full mb-4">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Access Restricted</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-md leading-relaxed">
            We regret to inform you that your retail partner access has been restricted by the administrator. Contact administrators for compliance or account resolution.
          </p>
        </div>
      ) : (
        /* FULL SHOPPING MODULE - VISIBLE TO APPROVED MEMBERS OR ADMINS */
        <div className="flex flex-col gap-6" id="active-shop-interface">
          
          {/* SHIPPING INFO BANNER */}
          {(isChinaKitPricing || isChinaVialPricing) && view === 'catalog' && (
            <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
              <Truck className="w-5 h-5 text-cyan-300 shrink-0" />
              <div>
                <p className="text-xs font-bold text-cyan-300">
                  {isChinaKitPricing ? 'Kit Pricing — 10-Vial Kits' : 'Per-Vial Pricing'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isChinaKitPricing
                    ? 'Products priced per 10-vial kit. Flat rate $25 international shipping. Quick Ship items ship free.'
                    : 'Flat rate $25 international shipping. Quick Ship items ship free.'}
                </p>
              </div>
            </div>
          )}

          {/* KIT PRICING INTEREST BANNER — approved (per-vial) members only */}
          {((memberProfile?.status === 'approved' && !isAdminPreviewCustomer) || (isAdminPreviewCustomer && !isAdminPreviewKit && !isAdminPreviewChinaKit && !isAdminPreviewChinaVial)) && view === 'catalog' && (
            <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-cyan-300">Interested in Kit Pricing?</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Order 10 vials at a time at a reduced rate, shipped directly from our warehouse.</p>
              </div>
              {!isAdminPreviewCustomer && memberProfile?.kitUpgradeRequested ? (
                <span className="shrink-0 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold rounded-lg">
                  ✓ Request Sent
                </span>
              ) : (
                <button
                  onClick={isAdminPreviewCustomer ? undefined : handleRequestKitUpgrade}
                  disabled={!isAdminPreviewCustomer && actionLoading === 'kit_upgrade_request'}
                  className="shrink-0 px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold rounded-lg cursor-pointer transition-all disabled:opacity-50"
                >
                  {!isAdminPreviewCustomer && actionLoading === 'kit_upgrade_request' ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" /> : 'Request Kit Pricing →'}
                </button>
              )}
            </div>
          )}

          {/* USER CATALOG VIEW */}
          {['catalog', 'admin_products'].includes(view) && (
            <ShopCatalogView
              products={products}
              catalogLoading={catalogLoading}
              searchQuery={searchQuery}
              onSetSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              onSetSelectedCategory={setSelectedCategory}
              showShopSuggestions={showShopSuggestions}
              onSetShowShopSuggestions={setShowShopSuggestions}
              selectedProductIds={selectedProductIds}
              onSetSelectedProductIds={setSelectedProductIds}
              cart={cart}
              labratTheme={labratTheme}
              isViewingAsAdmin={isViewingAsAdmin}
              isAdminUser={isAdminUser}
              actionLoading={actionLoading}
              onAddToCart={handleAddToCart}
              onSetSelectedParentProductGroup={setSelectedParentProductGroup}
              onSetSelectedOptionIdInDrawer={setSelectedOptionIdInDrawer}
              onSetDrawerQuantity={setDrawerQuantity}
              onSeedDatabase={handleSeedDatabase}
              onSetView={setView}
              onSetShowProductModal={setShowProductModal}
              onSetEditingProduct={setEditingProduct}
              onSetProductForm={setProductForm}
              onSetProductValidationError={setProductValidationError}
              onSetShowNorwayModal={setShowNorwayModal}
              onSetSelectedCertKey={setSelectedCertKey}
              allOrdersGlobal={allOrdersGlobal}
              isKitPricing={isKitPricing}
              isChinaKitPricing={isChinaKitPricing}
              isChinaVialPricing={isChinaVialPricing}
              isApprovedVialPricing={isApprovedVialPricing}
            />
          )}
          {/* USER SHOPPING CART VIEW */}
          {view === 'cart' && (
            <ShopCartView
              cart={cart}
              subtotal={subtotal}
              totalQty={totalQty}
              shippingForm={shippingForm}
              isKitPricing={isKitPricing}
              isChinaKitPricing={isChinaKitPricing}
              isChinaVialPricing={isChinaVialPricing}
              bacWaterQty={bacWaterQty}
              onSetBacWaterQty={setBacWaterQty}
              onAdjustQuantity={handleAdjustQuantity}
              onRemoveFromCart={handleRemoveFromCart}
              onSetView={setView}
            />
          )}

          {/* USER CHECKOUT SUBMISSION VIEW */}
          {view === 'checkout' && (
            <ShopCheckoutView
              cart={cart}
              subtotal={subtotal}
              shippingForm={shippingForm}
              selectedShippingOptionId={selectedShippingOptionId}
              shippingCarrierFilter={shippingCarrierFilter}
              actionLoading={actionLoading}
              isKitPricing={isKitPricing}
              isChinaKitPricing={isChinaKitPricing}
              isChinaVialPricing={isChinaVialPricing}
              bacWaterQty={bacWaterQty}
              onSetBacWaterQty={setBacWaterQty}
              onSetShippingForm={setShippingForm}
              onSetShippingCarrierFilter={setShippingCarrierFilter}
              onSetSelectedShippingOptionId={setSelectedShippingOptionId}
              onSetView={setView}
              onPlaceOrder={handlePlaceOrder}
            />
          )}

          {/* USER ORDERS HISTORY LIST VIEW */}
          {view === 'orders' && (
            <ShopOrdersView
              orders={orders}
              ordersLoading={ordersLoading}
              actionLoading={actionLoading}
              currentUserEmail={currentUser?.email}
              onSimulateDeliveryCheck={handleSimulateDeliveryCheck}
              onReorder={(items) => {
                items.forEach(item => {
                  const product = products.find(p => p.id === item.id);
                  if (product) {
                    setCart(prev => {
                      const existing = prev.find(c => c.product.id === product.id);
                      return existing
                        ? prev.map(c => c.product.id === product.id ? { ...c, quantity: c.quantity + item.quantity } : c)
                        : [...prev, { product, quantity: item.quantity }];
                    });
                  }
                });
                setView('cart');
                triggerHaptic('success');
              }}
            />
          )}


          {/* ================================ */}
          {/* ADMINISTRATOR CONSOLE VIEWS (STRICT ACCESS) */}
          {/* ================================ */}

          {isAdminUser && view === 'admin_members' && (
            <AdminMembersPanel
              adminMembersList={adminMembersList}
              membersLoading={membersLoading}
              actionLoading={actionLoading}
              pendingApprovalCount={pendingApprovalCount}
              confirmDeleteMemberId={confirmDeleteMemberId}
              onSetMemberStatus={handleSetMemberStatus}
              onDeleteMemberProfile={handleDeleteMemberProfile}
              onSetConfirmDeleteMemberId={setConfirmDeleteMemberId}
            />
          )}

          {isAdminUser && view === 'admin_orders' && (
            <AdminOrdersPanel
              adminOrdersList={adminOrdersList}
              ordersLoading={ordersLoading}
              actionLoading={actionLoading}
              newOrderCount={newOrderCount}
              confirmDeleteOrderId={confirmDeleteOrderId}
              onMarkAsPaid={handleMarkAsPaid}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onShipOrder={handleShipOrder}
              onSimulateDeliveryCheck={handleSimulateDeliveryCheck}
              onDeleteOrder={handleDeleteOrder}
              onSetConfirmDeleteOrderId={setConfirmDeleteOrderId}
            />
          )}

          {isAdminUser && view === 'admin_pricing' && (
            <AdminPricingPanel />
          )}

        </div>
      )}

      {/* SUCCESS ORDER CHECKOUT OVERLAY MODAL */}
      {showOrderSuccessModal && lastPlacedOrder && (
        <OrderSuccessModal
          lastPlacedOrder={lastPlacedOrder}
          onClose={() => { setShowOrderSuccessModal(false); setView('orders'); }}
          onDismiss={() => setShowOrderSuccessModal(false)}
        />
      )}


      {/* IMMERSIVE DOSAGE SELECTOR MODAL */}
      {selectedParentProductGroup && (
        <ProductDrawerModal
          group={selectedParentProductGroup}
          selectedOptionId={selectedOptionIdInDrawer}
          onSetSelectedOptionId={setSelectedOptionIdInDrawer}
          drawerQuantity={drawerQuantity}
          onSetDrawerQuantity={setDrawerQuantity}
          labratTheme={labratTheme}
          cart={cart}
          allOrdersGlobal={allOrdersGlobal}
          actionLoading={actionLoading}
          onAddToCartFromDrawer={(product, qty) => {
            for (let i = 0; i < qty; i++) handleAddToCart(product);
            setSelectedParentProductGroup(null);
          }}
          onClose={() => setSelectedParentProductGroup(null)}
          isViewingAsAdmin={isViewingAsAdmin}
          isKitPricing={isKitPricing}
          isChinaKitPricing={isChinaKitPricing}
          isChinaVialPricing={isChinaVialPricing}
          onSetEditingProduct={setEditingProduct}
          onSetProductValidationError={setProductValidationError}
          onSetProductForm={setProductForm}
          onSetShowProductModal={setShowProductModal}
          confirmDeleteProductId={confirmDeleteProductId}
          onSetConfirmDeleteProductId={setConfirmDeleteProductId}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {/* PRODUCT CREATION/EDITION MODAL (ADMIN ONLY) */}
      <AdminProductFormModal
        open={showProductModal && isAdminUser}
        editingProduct={editingProduct}
        productForm={productForm}
        onSetProductForm={setProductForm}
        validationError={productValidationError}
        actionLoading={actionLoading}
        wholesaleBook={wholesaleBook}
        onSubmit={handleSaveProduct}
        onClose={() => setShowProductModal(false)}
      />

      {/* NORWAY & SWITZERLAND PEPTIDE HERITAGE MODAL */}
      <NorwayHeritageModal
        open={showNorwayModal}
        onClose={() => setShowNorwayModal(false)}
        brandLabel={renderWithLabRatBranding("LabRat")}
      />



      {/* CERTIFICATION DETAIL MODAL */}
      <CertificationModal
        selectedCertKey={selectedCertKey}
        onClose={() => setSelectedCertKey(null)}
      />

      {/* ERROR TOAST — slides up from the bottom, auto-dismisses */}
      <AnimatePresence>
        {errorToast && (
          <motion.div
            key="error-toast"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[10000] w-[calc(100%-2rem)] max-w-md"
          >
            <div className="bg-[#1c1017] border border-red-500/40 rounded-2xl px-4 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.5)] flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs text-red-200 leading-relaxed flex-1 text-left">{errorToast}</div>
              <button
                onClick={() => setErrorToast('')}
                className="text-red-400/60 hover:text-red-300 text-sm font-bold px-1 cursor-pointer"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING CART BUTTON — appears when cart has items and user isn't already on cart/checkout */}
      <AnimatePresence>
        {totalQty > 0 && !['cart', 'checkout'].includes(view) && !selectedParentProductGroup && (
          <motion.button
            id="floating-view-cart-btn"
            key="floating-cart"
            ref={(el: HTMLButtonElement | null) => {
              if (el && labratTheme !== 'neon') {
                el.style.setProperty('background-color', '#1e293b', 'important');
                el.style.setProperty('color', '#ffffff', 'important');
              }
            }}
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => { triggerHaptic('light'); navigateView('cart'); }}
            className="fixed bottom-6 left-4 z-[999] flex items-center gap-2.5 px-4 py-3 active:scale-95 font-black text-sm rounded-2xl shadow-xl cursor-pointer"
            style={{
              backgroundColor: labratTheme === 'neon' ? '#06b6d4' : '#1e293b',
              color: '#ffffff',
              boxShadow: labratTheme === 'neon'
                ? '0 10px 25px -5px rgba(6,182,212,0.4)'
                : '0 8px 20px -4px rgba(0,0,0,0.30)',
            }}
          >
            <ShoppingCart className="w-4 h-4" style={{ color: '#ffffff' }} />
            <span style={{ color: '#ffffff' }}>View Cart</span>
            <span
              className="text-[11px] font-black px-2 py-0.5 rounded-full min-w-[1.4rem] text-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: '#ffffff' }}
            >
              {totalQty}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

