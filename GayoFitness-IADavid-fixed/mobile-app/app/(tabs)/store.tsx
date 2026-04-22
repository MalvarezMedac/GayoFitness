import {
  View, Text, Image, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, Modal,
} from 'react-native';
import { useState, useEffect } from 'react';
import { API_BASE } from '@/config/api.config';

const API = `${API_BASE}/products`;

type Product = {
  id:          string;
  name:        string;
  price:       number;
  puntuacion:  number;
  category:    string;
  image:       string;
  descripcion: string;
};

type CartItem = {
  product:  Product;
  cantidad: number;
};

const CATEGORIES = ['Todos', 'Suplementos', 'Equipamiento', 'Ropa'];

function formatPrice(n: number) {
  return '€' + n.toFixed(2).replace('.', ',');
}

function PuntuacionBar({ value }: { value: number }) {
  const clamped = Math.min(10, Math.max(1, value));
  const color = clamped >= 8 ? '#22c55e' : clamped >= 5 ? '#f59e0b' : '#ef4444';
  return (
    <View style={styles.puntuacionRow}>
      <View style={styles.puntuacionBarBg}>
        <View style={[styles.puntuacionBarFill, { width: `${clamped * 10}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[styles.puntuacionNum, { color }]}>{clamped}/10</Text>
    </View>
  );
}

function ProductCard({ item, onToggleCart, inCart, cantidad, onToggleFav, isFav }: any) {
  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.heartBtn} onPress={() => onToggleFav(item.id)}>
        <Text style={[styles.heartIcon, isFav && styles.heartIconActive]}>{isFav ? '♥' : '♡'}</Text>
      </TouchableOpacity>
      <View style={styles.cardRow}>
        <Image source={item.image ? { uri: item.image } : undefined} style={styles.productImage} resizeMode="contain" />
        <View style={styles.cardInfo}>
          <View style={styles.categoryChipSmall}>
            <Text style={styles.categoryChipSmallText}>{item.category}</Text>
          </View>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productDesc} numberOfLines={3}>{item.descripcion}</Text>
          <PuntuacionBar value={item.puntuacion} />
          <View style={styles.cardFooter}>
            <Text style={styles.price}>{formatPrice(item.price)}</Text>
            {inCart ? (
              <View style={styles.qtyRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => onToggleCart(item.id, -1)}>
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyNum}>{cantidad}</Text>
                <TouchableOpacity style={[styles.qtyBtn, styles.qtyBtnAdd]} onPress={() => onToggleCart(item.id, 1)}>
                  <Text style={[styles.qtyBtnText, { color: '#fff' }]}>+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addBtn} onPress={() => onToggleCart(item.id, 1)}>
                <Text style={styles.addBtnText}>+ Carrito</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

// ── MODAL CARRITO ──────────────────────────────────────────────────
function CartModal({ visible, items, onClose, onCambiarCantidad, onVaciar }: {
  visible: boolean;
  items: CartItem[];
  onClose: () => void;
  onCambiarCantidad: (id: string, delta: number) => void;
  onVaciar: () => void;
}) {
  const [vista, setVista] = useState<'carrito' | 'confirmarVaciar' | 'pedidoOk'>('carrito');
  const [totalPedido, setTotalPedido] = useState(0);
  const total = items.reduce((sum, i) => sum + i.product.price * i.cantidad, 0);

  const handleConfirmarPedido = () => {
    setTotalPedido(total);
    onVaciar();
    setVista('pedidoOk');
  };

  const handleVaciarConfirmado = () => {
    onVaciar();
    setVista('carrito');
  };

  const handleCerrar = () => {
    setVista('carrito');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleCerrar}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🛒 Mi carrito</Text>
            <TouchableOpacity onPress={handleCerrar} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          {vista === 'pedidoOk' && (
            <View style={styles.cartEmpty}>
              <Text style={styles.cartEmptyIcon}>✅</Text>
              <Text style={[styles.cartEmptyText, { color: '#111827', fontWeight: '700', fontSize: 17 }]}>¡Pedido confirmado!</Text>
              <Text style={[styles.cartEmptyText, { marginTop: 4, textAlign: 'center', paddingHorizontal: 20 }]}>
                Tu pedido por {formatPrice(totalPedido)} ha sido registrado. ¡Gracias!
              </Text>
              <TouchableOpacity
                style={[styles.checkoutBtn, { marginTop: 24, marginHorizontal: 0, paddingHorizontal: 40 }]}
                onPress={handleCerrar}
              >
                <Text style={styles.checkoutBtnText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          )}

          {vista === 'confirmarVaciar' && (
            <View style={styles.cartEmpty}>
              <Text style={styles.cartEmptyIcon}>🗑️</Text>
              <Text style={[styles.cartEmptyText, { color: '#111827', fontWeight: '700', fontSize: 16 }]}>¿Vaciar el carrito?</Text>
              <Text style={[styles.cartEmptyText, { marginTop: 4 }]}>Se eliminarán todos los productos.</Text>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                <TouchableOpacity style={styles.addBtn} onPress={() => setVista('carrito')}>
                  <Text style={[styles.addBtnText, { fontSize: 14, paddingHorizontal: 8, paddingVertical: 4 }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.checkoutBtn, { marginTop: 0, marginHorizontal: 0, paddingHorizontal: 24, paddingVertical: 10 }]}
                  onPress={handleVaciarConfirmado}
                >
                  <Text style={[styles.checkoutBtnText, { fontSize: 14 }]}>Vaciar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {vista === 'carrito' && (
            <>
              {items.length === 0 ? (
                <View style={styles.cartEmpty}>
                  <Text style={styles.cartEmptyIcon}>🛒</Text>
                  <Text style={styles.cartEmptyText}>Tu carrito está vacío</Text>
                </View>
              ) : (
                <>
                  <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
                    {items.map(({ product, cantidad }) => (
                      <View key={product.id} style={styles.cartItem}>
                        {product.image ? (
                          <Image source={{ uri: product.image }} style={styles.cartItemImage} resizeMode="contain" />
                        ) : (
                          <View style={[styles.cartItemImage, styles.cartItemImagePlaceholder]}>
                            <Text style={{ fontSize: 20 }}>📦</Text>
                          </View>
                        )}
                        <View style={styles.cartItemInfo}>
                          <Text style={styles.cartItemName} numberOfLines={2}>{product.name}</Text>
                          <Text style={styles.cartItemPrice}>{formatPrice(product.price)} / ud</Text>
                        </View>
                        <View style={styles.cartQtyRow}>
                          <TouchableOpacity style={styles.cartQtyBtn} onPress={() => onCambiarCantidad(product.id, -1)}>
                            <Text style={styles.cartQtyBtnText}>−</Text>
                          </TouchableOpacity>
                          <Text style={styles.cartQtyNum}>{cantidad}</Text>
                          <TouchableOpacity style={[styles.cartQtyBtn, styles.cartQtyBtnAdd]} onPress={() => onCambiarCantidad(product.id, 1)}>
                            <Text style={[styles.cartQtyBtnText, { color: '#fff' }]}>+</Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.cartItemSubtotal}>{formatPrice(product.price * cantidad)}</Text>
                      </View>
                    ))}
                  </ScrollView>

                  <View style={styles.cartDivider} />

                  <View style={styles.cartSummary}>
                    <View style={styles.cartSummaryRow}>
                      <Text style={styles.cartSummaryLabel}>Productos ({items.reduce((s, i) => s + i.cantidad, 0)})</Text>
                      <Text style={styles.cartSummaryValue}>{formatPrice(total)}</Text>
                    </View>
                    <View style={styles.cartSummaryRow}>
                      <Text style={styles.cartSummaryLabel}>Envío</Text>
                      <Text style={styles.cartFreeShipping}>GRATIS</Text>
                    </View>
                    <View style={[styles.cartSummaryRow, styles.cartTotalRow]}>
                      <Text style={styles.cartTotalLabel}>TOTAL</Text>
                      <Text style={styles.cartTotalValue}>{formatPrice(total)}</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.checkoutBtn} onPress={handleConfirmarPedido}>
                    <Text style={styles.checkoutBtnText}>✅ Confirmar pedido — {formatPrice(total)}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.vaciarBtn} onPress={() => setVista('confirmarVaciar')}>
                    <Text style={styles.vaciarBtnText}>🗑️ Vaciar carrito</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}

        </View>
      </View>
    </Modal>
  );
}

// ── TIENDA PRINCIPAL ───────────────────────────────────────────────
export default function Store() {
  const [products, setProducts]             = useState<Product[]>([]);
  const [search, setSearch]                 = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [cartItems, setCartItems]           = useState<CartItem[]>([]);
  const [favs, setFavs]                     = useState<string[]>([]);
  const [loading, setLoading]               = useState(true);
  const [showCart, setShowCart]             = useState(false);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const res  = await fetch(API);
      const data = await res.json();
      setProducts(data.map((p: any) => ({
        id:          p._id,
        name:        p.nombre,
        price:       p.precio,
        puntuacion:  p.puntuacion ?? 5,
        category:    p.categoria,
        image:       p.imagen,
        descripcion: p.descripcion ?? '',
      })));
    } catch (err) {
      console.log('ERROR PRODUCTS:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalUnidades = cartItems.reduce((s, i) => s + i.cantidad, 0);

  const handleToggleCart = (id: string, delta: number) => {
    setCartItems(prev => {
      const existe = prev.find(i => i.product.id === id);
      if (!existe) {
        const product = products.find(p => p.id === id)!;
        return [...prev, { product, cantidad: 1 }];
      }
      const nuevaCantidad = existe.cantidad + delta;
      if (nuevaCantidad <= 0) return prev.filter(i => i.product.id !== id);
      return prev.map(i => i.product.id === id ? { ...i, cantidad: nuevaCantidad } : i);
    });
  };

  const handleVaciarCarrito = () => setCartItems([]);

  const toggleFav = (id: string) =>
    setFavs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const filtered = products.filter(p => {
    const matchCat    = activeCategory === 'Todos' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Tienda</Text>
          <TouchableOpacity style={styles.cartBtn} onPress={() => setShowCart(true)}>
            <Text style={styles.cartIcon}>🛒</Text>
            {totalUnidades > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalUnidades}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.searchBar}>
          <Text style={styles.searchEmoji}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar producto..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, activeCategory === cat && styles.categoryChipActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⏳</Text>
          <Text style={styles.emptyText}>Cargando productos...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>No hay productos</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const cartItem = cartItems.find(i => i.product.id === item.id);
            return (
              <ProductCard
                item={item}
                onToggleCart={handleToggleCart}
                inCart={!!cartItem}
                cantidad={cartItem?.cantidad ?? 0}
                onToggleFav={toggleFav}
                isFav={favs.includes(item.id)}
              />
            );
          }}
        />
      )}

      <CartModal
        visible={showCart}
        items={cartItems}
        onClose={() => setShowCart(false)}
        onCambiarCantidad={handleToggleCart}
        onVaciar={handleVaciarCarrito}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f2f4f7' },
  header: { backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 3 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
  cartBtn: { position: 'relative', padding: 6 },
  cartIcon: { fontSize: 26 },
  cartBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#ef4444', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  cartBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f4f7', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, marginBottom: 12, gap: 8 },
  searchEmoji: { fontSize: 15 },
  searchInput: { flex: 1, fontSize: 14, color: '#111827', padding: 0 },
  clearBtn: { fontSize: 13, color: '#9ca3af', paddingHorizontal: 4 },
  categoriesRow: { gap: 8, paddingRight: 4 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f2f4f7', borderWidth: 1, borderColor: '#e5e7eb' },
  categoryChipActive: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
  categoryText: { fontSize: 13, fontWeight: '500', color: '#6b7280' },
  categoryTextActive: { color: '#fff', fontWeight: '600' },
  list: { padding: 12, paddingBottom: 32, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, position: 'relative' },
  heartBtn: { position: 'absolute', top: 12, right: 12, zIndex: 1, padding: 4 },
  heartIcon: { fontSize: 20, color: '#d1d5db' },
  heartIconActive: { color: '#ef4444' },
  cardRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  productImage: { width: 90, height: 110, borderRadius: 12, backgroundColor: '#f8fafc' },
  cardInfo: { flex: 1, gap: 5 },
  categoryChipSmall: { alignSelf: 'flex-start', backgroundColor: '#fef2f2', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  categoryChipSmallText: { color: '#ef4444', fontSize: 10, fontWeight: '600' },
  productName: { fontSize: 15, fontWeight: '700', color: '#111827', lineHeight: 20 },
  productDesc: { fontSize: 12, color: '#6b7280', lineHeight: 18 },
  puntuacionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  puntuacionBarBg: { flex: 1, height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden' },
  puntuacionBarFill: { height: '100%', borderRadius: 3 },
  puntuacionNum: { fontSize: 11, fontWeight: '700', minWidth: 28 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  price: { fontSize: 16, fontWeight: '700', color: '#ef4444' },
  addBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f2f4f7', borderWidth: 1, borderColor: '#e5e7eb' },
  addBtnText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#f2f4f7', borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  qtyBtnAdd: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
  qtyBtnText: { fontSize: 16, fontWeight: '700', color: '#374151', lineHeight: 20 },
  qtyNum: { fontSize: 14, fontWeight: '700', color: '#111827', minWidth: 20, textAlign: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 15, color: '#9ca3af' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 36, maxHeight: '88%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  modalCloseBtn: { padding: 6 },
  modalCloseText: { fontSize: 18, color: '#6b7280' },
  cartEmpty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  cartEmptyIcon: { fontSize: 48 },
  cartEmptyText: { fontSize: 15, color: '#9ca3af' },
  cartList: { paddingHorizontal: 16, paddingTop: 8, maxHeight: 340 },
  cartItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  cartItemImage: { width: 52, height: 52, borderRadius: 10, backgroundColor: '#f8fafc' },
  cartItemImagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 13, fontWeight: '600', color: '#111827', lineHeight: 18 },
  cartItemPrice: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  cartItemSubtotal: { fontSize: 14, fontWeight: '700', color: '#ef4444', minWidth: 52, textAlign: 'right' },
  cartQtyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cartQtyBtn: { width: 26, height: 26, borderRadius: 7, backgroundColor: '#f2f4f7', borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  cartQtyBtnAdd: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
  cartQtyBtnText: { fontSize: 15, fontWeight: '700', color: '#374151', lineHeight: 18 },
  cartQtyNum: { fontSize: 13, fontWeight: '700', color: '#111827', minWidth: 18, textAlign: 'center' },
  cartDivider: { height: 1, backgroundColor: '#e5e7eb', marginHorizontal: 16, marginTop: 8 },
  cartSummary: { paddingHorizontal: 20, paddingTop: 14, gap: 8 },
  cartSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartSummaryLabel: { fontSize: 14, color: '#6b7280' },
  cartSummaryValue: { fontSize: 14, color: '#374151', fontWeight: '600' },
  cartFreeShipping: { fontSize: 13, color: '#22c55e', fontWeight: '700' },
  cartTotalRow: { paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e5e7eb', marginTop: 4 },
  cartTotalLabel: { fontSize: 16, fontWeight: '800', color: '#111827' },
  cartTotalValue: { fontSize: 20, fontWeight: '800', color: '#ef4444' },
  checkoutBtn: { backgroundColor: '#ef4444', borderRadius: 14, marginHorizontal: 16, marginTop: 16, padding: 16, alignItems: 'center' },
  checkoutBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  vaciarBtn: { alignItems: 'center', paddingTop: 12 },
  vaciarBtnText: { color: '#9ca3af', fontSize: 13 },
});
