import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Users, 
  CheckCircle, 
  X,
  XCircle, 
  Clock, 
  Plus, 
  Minus,
  Trash2, 
  Edit, 
  ClipboardList, 
  Mail, 
  UserCheck, 
  MapPin, 
  Phone, 
  User, 
  DollarSign, 
  AlertTriangle, 
  Loader2, 
  PlusCircle, 
  Package, 
  ShieldAlert, 
  BadgeCheck,
  Send,
  ArrowLeft,
  Search,
  Truck,
  Sparkles,
  Flame,
  Brain,
  Shield,
  Heart,
  Activity,
  Droplet,
  Moon,
  Dna,
  TrendingUp
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
  writeBatch
} from 'firebase/firestore';
import { triggerHaptic } from '../lib/haptics';
import { safeLocalStorage } from '../lib/storage';
import { handleFirestoreError, OperationType } from '../lib/db';
import { ShopProduct, MemberProfile, CartItem, OrderDetail, ShippingOption } from '../lib/shopTypes';
import { SAMPLE_INVENTORY } from '../data/shopInventory';
export type { ShopProduct, MemberProfile, CartItem, OrderDetail, ShippingOption };
export { findShopProductMatch, getProductCostPerVial, getCleanDescription, getEstimatedDeliveryDate, getShippingOptions, getSalePrice } from '../lib/shopHelpers';
import { getProductBaseAndSize, getProductCostPerVial, getCleanDescription, getEstimatedDeliveryDate, getShippingOptions, getSalePrice, findShopProductMatch, getSecondaryBenefit, getSecondaryBenefitStyle, parseShippingAddress } from '../lib/shopHelpers';
import ShopCartView from './shop/ShopCartView';
import ShopCheckoutView from './shop/ShopCheckoutView';
import ShopOrdersView from './shop/ShopOrdersView';
import AdminMembersPanel from './shop/AdminMembersPanel';
import AdminOrdersPanel from './shop/AdminOrdersPanel';
import ShopCatalogView from './shop/ShopCatalogView';
import ProductDrawerModal from './shop/ProductDrawerModal';
import OrderSuccessModal from './shop/OrderSuccessModal';
import CertificationModal from './shop/CertificationModal';
import ProductVialVisual from './shop/ProductVialVisual';

type LabratThemeMode = 'neon' | 'clinical';

function resolveLabratTheme(): LabratThemeMode {
  if (typeof document === 'undefined') return 'neon';
  return document.documentElement.getAttribute('data-labrat-theme') === 'clinical' ? 'clinical' : 'neon';
}


export default function MembersShop() {
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

  const isAdminUser = currentUser?.email?.toLowerCase() === 'kyleheiser@gmail.com';
  const isViewingAsAdmin = isAdminUser && !isAdminPreviewCustomer;

  // Application Layout Views
  // Users view: 'catalog' | 'cart' | 'checkout' | 'orders' | 'status_check'
  // Admin view: 'admin_members' | 'admin_orders' | 'admin_products'
  const [view, setView] = useState<string>('catalog');

  // Push a history entry so the back gesture navigates within the shop before closing the app
  const navigateView = useCallback((newView: string) => {
    window.history.pushState({ tab: 'shop', shopView: newView }, '');
    setView(newView);
  }, []);

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
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
      setView(v => ['admin_members', 'admin_orders', 'catalog'].includes(v) ? v : 'admin_members');
    } else {
      setView(v => ['catalog', 'cart', 'orders'].includes(v) ? v : 'catalog');
    }
  }, [isAdminUser, isAdminPreviewCustomer]);
  
  // Database States
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [allOrdersGlobal, setAllOrdersGlobal] = useState<OrderDetail[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<Record<string, string>>({});

  // Immersive Compound Dosages selector modal state
  const [selectedParentProductGroup, setSelectedParentProductGroup] = useState<{
    baseName: string;
    category: string;
    description: string;
    options: (ShopProduct & { size: string })[];
  } | null>(null);
  const [selectedOptionIdInDrawer, setSelectedOptionIdInDrawer] = useState<string>('');
  const [drawerQuantity, setDrawerQuantity] = useState<number>(1);

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showShopSuggestions, setShowShopSuggestions] = useState(false);

  // Registration / Join Waitlist inputs
  const [joinForm, setJoinForm] = useState({
    shippingAddress: '',
    phone: ''
  });

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

  // Active Order Success Feedback Modals
  const [lastPlacedOrder, setLastPlacedOrder] = useState<OrderDetail | null>(null);
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);

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
    inventory: 50
  });

  // Fetch Member Profile Approval status from firestore
  useEffect(() => {
    if (!currentUser) {
      setProfileLoading(false);
      return;
    }

    const fetchProfileAndInit = async () => {
      setProfileLoading(true);
      try {
        const profilRef = doc(db, 'members', currentUser.uid);
        const profilSnap = await getDoc(profilRef);
        
        if (profilSnap.exists()) {
          const profileData = profilSnap.data() as MemberProfile;
          setMemberProfile(profileData);
          setJoinForm({
            shippingAddress: profileData.shippingAddress || '',
            phone: profileData.phone || ''
          });
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
        } else {
          setMemberProfile(null);
        }
      } catch (e) {
        console.error('Error fetching member verification status', e);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfileAndInit();
  }, [currentUser]);

  // Sync Cart to LocalStorage
  useEffect(() => {
    safeLocalStorage.setItem('labrat_member_cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch all orders globally to calculate dynamic inventory
  const fetchGlobalOrders = async () => {
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

  // Load Inventory Catalog
  const fetchProducts = async () => {
    setCatalogLoading(true);
    try {
      await fetchGlobalOrders();
      
      const colRef = collection(db, 'shopItems');
      const snap = await getDocs(colRef);
      const list: ShopProduct[] = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as ShopProduct);
      });

      const syncPromises: Promise<void>[] = [];

      // Self-healing synchronization upgrade: insert or UPDATE items to match updated clean certified titles & sizes, prices, and stock
      for (const sample of SAMPLE_INVENTORY) {
        const existingIndex = list.findIndex(p => p.id === sample.id);
        if (existingIndex === -1) {
          syncPromises.push(
            setDoc(doc(db, 'shopItems', sample.id), sample)
              .then(() => {
                list.push(sample);
              })
              .catch(err => {
                console.error(`Failed to auto-provision item: ${sample.id}`, err);
              })
          );
        } else {
          const existing = list[existingIndex];
          if (
            existing.name !== sample.name || 
            existing.description !== sample.description || 
            existing.category !== sample.category ||
            existing.price !== sample.price ||
            existing.inventory !== sample.inventory
          ) {
            syncPromises.push(
              setDoc(doc(db, 'shopItems', sample.id), {
                ...existing,
                name: sample.name,
                description: sample.description,
                category: sample.category,
                price: sample.price,
                inventory: sample.inventory
              })
                .then(() => {
                  list[existingIndex] = {
                    ...existing,
                    name: sample.name,
                    description: sample.description,
                    category: sample.category,
                    price: sample.price,
                    inventory: sample.inventory
                  };
                })
                .catch(err => {
                  console.error(`Failed to auto-update item: ${sample.id}`, err);
                })
            );
          }
        }
      }

      // Proactively prune outdated/removed inventory sizes/products from Firestore

      const activeSampleIdsSet = new Set(SAMPLE_INVENTORY.map(s => s.id));
      const obsoleteItems = list.filter(item => !activeSampleIdsSet.has(item.id));
      await Promise.all([
        ...syncPromises,
        ...obsoleteItems.map(item =>
          deleteDoc(doc(db, 'shopItems', item.id)).catch(err =>
            console.error(`Failed to auto-delete obsolete database item: ${item.id}`, err)
          )
        )
      ]);

      const activeSampleIds = Array.from(activeSampleIdsSet);

      // Set state to strictly only contain active shop products
      const filteredList = list.filter(p => activeSampleIds.includes(p.id));
      setProducts(filteredList);
    } catch (e) {
      console.error('Failed fetching shop inventory', e);
      handleFirestoreError(e, OperationType.LIST, 'shopItems');
    } finally {
      setCatalogLoading(false);
    }
  };

  useEffect(() => {
    // Only load catalog if the user is verified/approved or an Admin
    if (isAdminUser || (memberProfile && memberProfile.status === 'approved')) {
      fetchProducts();
    }
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
        const rank: Record<MemberProfile['status'], number> = { pending: 0, approved: 1, blocked: 2 };
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
        shippingAddress: joinForm.shippingAddress,
        phone: joinForm.phone,
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
  const handleSetMemberStatus = async (userId: string, status: 'pending' | 'approved' | 'blocked') => {
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
    const subtotal = cart.reduce((acc, item) => acc + (getSalePrice(item.product.price) * item.quantity), 0);
    return { totalQty, subtotal };
  };

  // Checkout order placement!
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (cart.length === 0) return;

    triggerHaptic('heavy');
    setActionLoading('checkout');
    
    // Generate order ID
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,'');
    const randomHex = Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0');
    const orderId = `LR-${dateStr}-${randomHex}`;

    const { subtotal } = getCartTotals();
    const totalVials = cart.reduce((sum, item) => sum + item.quantity, 0);
    const shippingDetails = getShippingOptions(shippingForm.zipCode, totalVials, cart);
    const selectedOption = shippingDetails.options.find(o => o.id === selectedShippingOptionId) || shippingDetails.options[0];
    const shippingCost = selectedOption ? selectedOption.cost : 0;

    // Florida sales tax check (6.0%)
    const isFlorida = shippingForm.state.trim().toLowerCase() === 'fl' || shippingForm.state.trim().toLowerCase() === 'florida';
    const salesTaxRate = 0.06;
    const salesTax = isFlorida ? Math.round(subtotal * salesTaxRate * 100) / 100 : 0;

    const orderPayload: OrderDetail = {
      id: orderId,
      userId: currentUser.uid,
      email: currentUser.email || '',
      displayName: currentUser.displayName || 'Anonymous LabRat',
      items: cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: getSalePrice(item.product.price),
        quantity: item.quantity
      })),
      total: subtotal + shippingCost + salesTax,
      tax: salesTax,
      shippingInfo: { 
        ...shippingForm,
        carrier: selectedOption?.carrier,
        method: selectedOption?.name,
        cost: selectedOption?.cost,
        deliveryEstimate: selectedOption?.estimatedDeliveryDate,
        weightLbs: shippingDetails.weightLbs
      },
      status: 'placed',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'orders', orderId), orderPayload);
      
      // Update global orders state to recalculate inventory instantly
      setAllOrdersGlobal(prev => [orderPayload, ...prev]);
      
      // Complete! Reset parameters
      setLastPlacedOrder(orderPayload);
      setCart([]);
      setShowOrderSuccessModal(true);
      setView('catalog');
    } catch (e) {
      console.error('Error recording retail order', e);
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
      inventory: Number(productForm.inventory)
    };

    try {
      await setDoc(doc(db, 'shopItems', productId), targetProduct);
      await fetchProducts();
      setShowProductModal(false);
      setEditingProduct(null);
      setProductValidationError(null);
      setProductForm({ name: '', description: '', category: '', price: 0, inventory: 50 });
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

  // Filter products by category and query
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const { totalQty, subtotal } = getCartTotals();

  return (
    <div className="flex flex-col gap-4" id="members-shop-page" style={{ animation: 'none' }}>

      {/* Scrolling certification ticker */}
      <div className="overflow-hidden rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-purple-500/8 py-1.5">
        <div className="shop-ticker-inner flex whitespace-nowrap">
          {[0, 1].map(i => (
            <span key={i} className="inline-block px-10 text-cyan-400 font-mono font-black text-[.68rem] tracking-widest uppercase shrink-0">
              Norway Peptides &nbsp;•&nbsp; COA Ready &nbsp;•&nbsp; ISO 17025 &nbsp;•&nbsp; ISO 9001 &nbsp;•&nbsp; EU GMP Annex 1 &nbsp;•&nbsp; GDP Standard &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Upper Status Cards / Welcome banners */}
      <div className="bg-[#0b1329] border border-[#1e293b] rounded-xl p-3 sm:p-4 relative overflow-hidden" id="shop-welcome-hero">
        <div className="absolute top-0 right-0 p-6 opacity-5 text-slate-100 pointer-events-none">
          <ShoppingBag className="w-48 h-48" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5 overflow-x-auto scrollbar-hide pb-0.5">
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setSelectedCertKey('authorized_supply'); }}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/10 transition hover:scale-105 active:scale-95 cursor-pointer shrink-0 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              >
                Authorized Lab Supply
              </button>
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setSelectedCertKey('research_only'); }}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/10 transition hover:scale-105 active:scale-95 cursor-pointer shrink-0 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
              >
                🔬 Research Use Only
              </button>
              {isAdminUser && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-red-500/20 text-red-300 border border-red-500/10 shrink-0">
                  Site Administrator
                </span>
              )}
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setSelectedCertKey('99_purity'); }}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1 transition hover:scale-105 active:scale-95 cursor-pointer shrink-0 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              >
                <BadgeCheck className="w-2.5 h-2.5 shrink-0" /> 99% Purity
              </button>
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setSelectedCertKey('certified_source'); }}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 transition hover:scale-105 active:scale-95 cursor-pointer shrink-0 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
              >
                <CheckCircle className="w-2.5 h-2.5 shrink-0" /> Certified Source
              </button>
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setSelectedCertKey('coas_available'); }}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1 transition hover:scale-105 active:scale-95 cursor-pointer shrink-0 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              >
                <ClipboardList className="w-2.5 h-2.5 shrink-0" /> COAs Available
              </button>
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setSelectedCertKey('sop_verified'); }}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20 transition hover:scale-105 active:scale-95 cursor-pointer shrink-0 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
              >
                SOP Verified
              </button>
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setSelectedCertKey('iso_17025'); }}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-slate-800/60 text-slate-300 border border-slate-700/60 transition hover:scale-105 active:scale-95 cursor-pointer shrink-0 focus:outline-none focus:ring-1 focus:ring-slate-500/30"
                title="ISO/IEC 17025 Lab Competence (Click for details)"
              >
                ISO 17025
              </button>
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setSelectedCertKey('iso_9001'); }}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-slate-800/60 text-slate-300 border border-slate-700/60 transition hover:scale-105 active:scale-95 cursor-pointer shrink-0 focus:outline-none focus:ring-1 focus:ring-slate-500/30"
                title="ISO 9001:2015 Quality Management (Click for details)"
              >
                ISO 9001
              </button>
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setSelectedCertKey('eu_gmp'); }}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-slate-800/60 text-slate-300 border border-slate-700/60 transition hover:scale-105 active:scale-95 cursor-pointer shrink-0 focus:outline-none focus:ring-1 focus:ring-slate-500/30"
                title="EU GMP Annex 1 Sterile formulation protocols (Click for details)"
              >
                EU GMP Annex 1
              </button>
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setSelectedCertKey('annex_11'); }}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-slate-800/60 text-slate-300 border border-slate-700/60 transition hover:scale-105 active:scale-95 cursor-pointer shrink-0 focus:outline-none focus:ring-1 focus:ring-slate-500/30"
                title="Annex 11 Systems electronic security & audit loops (Click for details)"
              >
                Annex 11
              </button>
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setSelectedCertKey('gdp'); }}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-slate-800/60 text-slate-300 border border-slate-700/60 transition hover:scale-105 active:scale-95 cursor-pointer shrink-0 focus:outline-none focus:ring-1 focus:ring-slate-500/30"
                title="Good Distribution Practice sterile shipping standard (Click for details)"
              >
                GDP Standard
              </button>
            </div>
            <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-x-2 mt-0.5">
              <span className="text-base font-black tracking-tighter text-white font-sans uppercase">LABRAT</span>
              <span className="text-slate-300 font-semibold">Bioresearch Peptide &amp; Compound Shop</span>
            </h1>
          </div>

          {/* Customer nav — same for everyone including admin-in-preview */}
          {(memberProfile?.status === 'approved' || isAdminUser) && (
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
        <div className="bg-red-950/20 border border-red-500/20 rounded-xl px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide" id="admin-control-bar">
          <span className="text-[9px] font-black uppercase tracking-widest text-red-400 shrink-0">Admin</span>
          <div className="w-px h-4 bg-red-500/20 shrink-0" />
          <button
            onClick={() => { triggerHaptic('light'); setIsAdminPreviewCustomer(false); navigateView('admin_members'); }}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 relative ${view === 'admin_members' && !isAdminPreviewCustomer ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-red-400/70 hover:text-red-300 hover:bg-red-500/10'}`}
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
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 relative ${view === 'admin_orders' && !isAdminPreviewCustomer ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-red-400/70 hover:text-red-300 hover:bg-red-500/10'}`}
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
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${['catalog', 'admin_products'].includes(view) && !isAdminPreviewCustomer ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-red-400/70 hover:text-red-300 hover:bg-red-500/10'}`}
          >
            Products
          </button>
          <button
            onClick={() => { triggerHaptic('light'); setIsAdminPreviewCustomer(!isAdminPreviewCustomer); navigateView('catalog'); }}
            className={`ml-auto shrink-0 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 border ${
              isAdminPreviewCustomer
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'text-slate-400 border-transparent hover:text-cyan-300 hover:bg-cyan-500/10'
            }`}
          >
            <ShoppingBag className="w-3 h-3" />
            {isAdminPreviewCustomer ? 'Customer View: ON' : 'Preview as Customer'}
          </button>
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
      ) : !currentUser ? (
        /* Display auth prompt if user not logged in */
        <div className="bg-[#0a0f1d] border border-red-500/20 rounded-2xl p-8 text-center flex flex-col items-center py-16" id="unauthenticated-shop-state">
          <div className="p-4 bg-red-500/10 text-red-400 rounded-full mb-4">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Login Credentials Required</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
            Viewing and placing chemical requests on the LabRat network requires authenticating with your account in the checklist tab.
          </p>
        </div>
      ) : !isAdminUser && !memberProfile ? (
        /* PROFILE NOT REQUESTED YET: SHOW REGISTER SHEET */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="shop-registration-lobby">
          <div className="bg-[#0f172a]/50 border border-[#1e293b]/80 p-6 sm:p-8 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl self-start mb-4 w-fit">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">Request Member Shopping Access</h2>
              <p className="text-slate-400 text-sm mt-3 leading-linear">
                Our materials are formulated and reserved for registered biochemical researchers. 
                Applying is free. The administrator will review your contact credentials and approve your account, granting access to premium items.
              </p>
              
              <ul className="mt-5 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  No direct credit card upfront. Payments handled afterwards via verified email invoices.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  Premium logistics tracking directly on your dashboard.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  Priority stock reservation matching active planned compounds.
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-[#0b1329]/70 border border-[#1e293b] p-6 sm:p-8 rounded-2xl">
            <h3 className="text-base font-bold text-white mb-4">Researcher Address Registry</h3>
            <form onSubmit={handleJoinWaitlist} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="reg-email">Verified Email</label>
                <input 
                  type="email" 
                  disabled 
                  value={currentUser.email || ''} 
                  id="reg-email"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-500 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="reg-address">Full Shipping Address</label>
                <textarea 
                  required
                  rows={2}
                  id="reg-address"
                  placeholder="Street Address, City, State, ZIP"
                  value={joinForm.shippingAddress}
                  onChange={(e) => setJoinForm(prev => ({ ...prev, shippingAddress: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder:text-slate-600 rounded-xl text-sm focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="reg-phone">Contact Phone Number</label>
                <input 
                  type="tel" 
                  required
                  id="reg-phone"
                  placeholder="(+1) 555-0199"
                  value={joinForm.phone}
                  onChange={(e) => setJoinForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder:text-slate-600 rounded-xl text-sm focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading === 'join'}
                className="w-full py-3 bg-cyan-500 disabled:bg-cyan-500/40 text-slate-950 font-bold text-sm rounded-xl cursor-pointer hover:bg-cyan-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {actionLoading === 'join' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Retail Access Application
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : !isAdminUser && memberProfile && memberProfile.status === 'pending' ? (
        /* PENDING APPROVAL SCREEN */
        <div className="bg-[#0b1329] border border-cyan-500/25 rounded-2xl p-8 text-center flex flex-col items-center py-16" id="pending-waitlist-lobby">
          <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-full mb-4 animate-pulse">
            <Clock className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Account Application Pending</h2>
          <p className="text-slate-400 text-sm mt-3 max-w-sm leading-relaxed">
            Your laboratory access request under <span className="text-slate-200 font-semibold">{currentUser.email}</span> is currently queued in the pending registry.
          </p>
          <p className="text-xs text-slate-500 mt-4 leading-normal max-w-xs">
            Review cycles occur daily. The administrator will contact you at your registered email address or authorize your account directly on the dashboard shortly.
          </p>
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
            />
          )}
          {/* USER SHOPPING CART VIEW */}
          {view === 'cart' && (
            <ShopCartView
              cart={cart}
              subtotal={subtotal}
              totalQty={totalQty}
              shippingForm={shippingForm}
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
              onSeedDemoOrder={handleSeedDemoOrder}
            />
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
          onSetEditingProduct={setEditingProduct}
          onSetProductValidationError={setProductValidationError}
          onSetProductForm={setProductForm}
          onSetShowProductModal={setShowProductModal}
          confirmDeleteProductId={confirmDeleteProductId}
          onSetConfirmDeleteProductId={setConfirmDeleteProductId}
          onDeleteProduct={handleDeleteProduct}
        />
      )}


      {/* ================================== */}
      {/* PRODUCT CREATION/EDITION MODAL (ADMIN ONLY) */}
      {/* ================================== */}
      <AnimatePresence>
        {showProductModal && isAdminUser && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0b1329] border border-slate-800 max-w-md w-full p-6 rounded-2xl text-left"
            >
              <h3 className="text-base font-bold text-white mb-4">
                {editingProduct ? 'Modify Product Parameters' : 'Register New Compound / Supply'}
              </h3>
              
              <form onSubmit={handleSaveProduct} className="space-y-4">
                {productValidationError && (
                  <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl p-3 text-[11px] font-medium leading-relaxed">
                    ⚠️ {productValidationError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1" htmlFor="prod-name">Product Name</label>
                  <input 
                    type="text" 
                    required
                    id="prod-name"
                    placeholder="E.g. TB-500 Pure Powder"
                    value={productForm.name}
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder:text-slate-600 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1" htmlFor="prod-desc">Description</label>
                  <textarea 
                    required
                    rows={2}
                    id="prod-desc"
                    placeholder="Biochemical mechanisms, dosage volumes..."
                    value={productForm.description}
                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder:text-slate-600 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1" htmlFor="prod-cat">Category</label>
                    <input 
                      type="text" 
                      required
                      id="prod-cat"
                      placeholder="E.g. Healing"
                      value={productForm.category}
                      onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder:text-slate-600 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1" htmlFor="prod-price">Research Price ($)</label>
                    <input 
                      type="number" 
                      required
                      id="prod-price"
                      min={0}
                      placeholder="125"
                      value={productForm.price || ''}
                      onChange={(e) => setProductForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder:text-slate-600 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1" htmlFor="prod-inventory">Stock Inventory (Vials/Sets)</label>
                  <input 
                    type="number" 
                    required
                    id="prod-inventory"
                    placeholder="30"
                    min={0}
                    value={productForm.inventory}
                    onChange={(e) => setProductForm(prev => ({ ...prev, inventory: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder:text-slate-600 rounded-lg text-xs"
                  />
                </div>

                {productForm.name && productForm.price > 0 && (
                  <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl space-y-1 text-[11px] font-mono text-slate-300">
                    <div className="text-cyan-400 font-bold uppercase tracking-wider text-[9px] mb-1">Financial Estimates (KaosLabs.eu)</div>
                    <div className="flex justify-between">
                      <span>Estimated Cost/Vial (incl. avg shipping):</span>
                      <span className="text-white font-semibold">${getProductCostPerVial(productForm.name, productForm.price || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Grand Opening Sale Price (-15%):</span>
                      <span className="text-emerald-400 font-semibold">${getSalePrice(productForm.price || 0)}.00</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800/50 pt-1.5 mt-1 font-bold">
                      <span>Estimated Profit per Vial:</span>
                      {(() => {
                        const cost = getProductCostPerVial(productForm.name, productForm.price || 0);
                        const sale = getSalePrice(productForm.price || 0);
                        const profit = sale - cost;
                        return <span className={profit >= 0 ? "text-amber-300" : "text-rose-400"}>${profit.toFixed(2)}</span>;
                      })()}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-3 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs rounded-lg cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading !== null}
                    className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    {actionLoading === 'save_product' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BadgeCheck className="w-3.5 h-3.5" />} {editingProduct ? 'Apply Edit' : 'Add to Catalog'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ================================== */}
      {/* NORWAY & SWITZERLAND PEPTIDE HERITAGE MODAL */}
      {/* ================================== */}
      <AnimatePresence>
        {showNorwayModal && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            {/* Background click to close */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => { triggerHaptic('light'); setShowNorwayModal(false); }} />

            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 20 }}
              className="bg-[#0b1329] border border-cyan-500/20 max-w-2xl w-full p-5 sm:p-8 rounded-2xl text-left shadow-2xl relative overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
            >
              {/* Decorative premium header gradient lines */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-[#2176ff] to-[#a05eff]" />
              <div className="absolute top-1.5 inset-x-0 h-px bg-white/10" />

              {/* Header section with branding & Norway flag */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-400/30 flex items-center justify-center text-3xl shadow-inner select-none animate-pulse">
                    🇳🇴
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-wider bg-cyan-950/80 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded">Specialty Report</span>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-950/80 text-indigo-300 border border-indigo-500/10 px-2 py-0.5 rounded">Biotech History</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1">
                      The European Peptide Heritage
                    </h3>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => { triggerHaptic('light'); setShowNorwayModal(false); }}
                  className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-slate-100 transition cursor-pointer"
                  aria-label="Close heritage details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable factual body */}
              <div className="flex-1 overflow-y-auto pr-1 py-5 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
                <p className="text-xs text-slate-400 border-l-2 border-cyan-500 pl-3 italic">
                  "By prioritizing micro-batch crystalline purity over industrial scale bulk crystallization, Switzerland and Scandinavia's molecular baseline outperforms mass-market chemical manufacturers consistently." 
                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">— European Biological Synthesis Review (EBSR)</span>
                </p>

                {/* Section 1: History timeline */}
                <div>
                  <h4 className="text-xs font-black tracking-wider text-cyan-400 uppercase flex items-center gap-1.5 mb-2.5">
                    <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    1. A Century of Peptide Chemistry (Longer than USA &amp; China)
                  </h4>
                  <p className="text-slate-300 mb-3 block">
                    Many researchers mistakenly assume modern peptide synthesis is a recent byproduct of large-scale Chinese factories. In fact, Europe is the undisputed birthplace of peptide chemistry, holding an operational pedigree decades older than industrial export zones:
                  </p>
                  
                  {/* Timeline cards */}
                  <div className="space-y-3 pl-2 border-l border-slate-800">
                    <div className="relative pl-4">
                      <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 bg-cyan-400 rounded-full border border-slate-950" />
                      <div className="text-white font-bold text-xs">1902 — Emil Fischer Swiss-German Genesis</div>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Nobel Laureate Emil Fischer synthesized the first true peptide chain (glycylglycine) in Switzerland / Germany, coining the scientific term "peptide" and defining the covalent amide bonds that bind amino acids.
                      </p>
                    </div>
                    <div className="relative pl-4">
                      <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 bg-purple-400 rounded-full border border-slate-950" />
                      <div className="text-white font-bold text-xs">Mid-1950s — Norwegian High-Latitude Bio-Extraction</div>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Norwegian biochemistry initiatives in Oslo and Bergen pioneered the isolation of cold-active enzymes, bio-active micro-molecules, and metabolic defense peptide chains in arctic marine organisms. This established early European techniques for purifying crystalline organic compounds.
                      </p>
                    </div>
                    <div className="relative pl-4">
                      <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-950" />
                      <div className="text-white font-bold text-xs">1971 — The Swiss Gold-Standard (Bachem)</div>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Bachem AG was founded in Bubendorf, Switzerland, initiating the world's first dedicated industrial line of synthetic peptides. This established Swiss-standard Solid-Phase Peptide Synthesis (SPPS) decades before mass commercial synthesis appeared in China or North America.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Glacial Water */}
                <div>
                  <h4 className="text-xs font-black tracking-wider text-cyan-400 uppercase flex items-center gap-1.5 mb-2.5">
                    <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    2. Glacier-Pure Aqueous Baselines
                  </h4>
                  <p className="text-slate-300">
                    In high-fidelity synthesis, <strong>water is the universal solvent</strong>. During the acid cleavage stage of peptide synthesis, even sub-parts-per-million micro-contaminants can warp molecular strands or trigger cross-chain peptide bonding.
                  </p>
                  <p className="text-slate-300 mt-2">
                    Norway's isolated sub-alpine geographic locations tap into highly pristine deep aquifers and mountain glacier waters. This provides a clean native solvent baseline that features zero industrial runoffs or heavy metals. As a result, the active substance undergoes synthesis without baseline contamination.
                  </p>
                </div>

                {/* Section 3: Micro-Batch vs Bulk */}
                <div>
                  <h4 className="text-xs font-black tracking-wider text-cyan-400 uppercase flex items-center gap-1.5 mb-2.5">
                    <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    3. Swiss-Scandinavian Micro-Batching vs. Mass Sourcing
                  </h4>
                  
                  {/* Factual comparison box */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-3">
                    <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl text-left">
                      <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs mb-2 uppercase">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full" /> Modern Bulk Factories (China/Bulk)
                      </div>
                      <ul className="space-y-2 text-xs text-slate-400">
                        <li>• Focused on multi-ton industrial chemical synthesis volumes</li>
                        <li>• Rapid high-temperature cleavage processes that compromise amino-acid integrity</li>
                        <li>• Higher incidence of truncated chains (missing essential terminal groups)</li>
                        <li>• Residual salts (TFA leftover content often exceeds standard thresholds)</li>
                      </ul>
                    </div>

                    <div className="bg-cyan-950/20 border border-cyan-500/20 p-4 rounded-xl text-left">
                      <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs mb-2 uppercase">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" /> LabRat Sourcing (Norway &amp; Switzerland)
                      </div>
                      <ul className="space-y-2 text-xs text-slate-300">
                        <li>• Exclusive low-temperature micro-batching</li>
                        <li>• Sterile vacuum cryogenic freeze-drying (lyophilization) preserves shape</li>
                        <li>• Guaranteed 99.2%+ purity levels under strict ISO 17025 audits</li>
                        <li>• Certified zero heavy-metal profiling and flawless sequence length</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Section 4: GMP Sterile Protocols */}
                <div>
                  <h4 className="text-xs font-black tracking-wider text-cyan-400 uppercase flex items-center gap-1.5 mb-2">
                    <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    4. Rigid EU GMP Annex 1 Compliance
                  </h4>
                  <p className="text-slate-300">
                    Norway and Switzerland hold the highest biological manufacturing criteria. Sourcing labs comply strictly with <strong>EU GMP Annex 1 guidelines for sterile compounds</strong> (ISO Class 5 environment, laminar horizontal airflow, and continuous automated optical sensors). Every step is recorded in unalterable digital audit systems, satisfying absolute research standards.
                  </p>
                </div>
              </div>

              {/* Action Close Footer */}
              <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase flex items-center gap-1.5">
                  {renderWithLabRatBranding("LabRat")} <span className="text-slate-400 font-medium">Certified Bioresearch Sourcing</span>
                </span>
                <button
                  type="button"
                  onClick={() => { triggerHaptic('light'); setShowNorwayModal(false); }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition active:scale-98"
                >
                  Return to Compound Shop
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* CERTIFICATION DETAIL MODAL */}
      <CertificationModal
        selectedCertKey={selectedCertKey}
        onClose={() => setSelectedCertKey(null)}
      />
    </div>
  );
}

