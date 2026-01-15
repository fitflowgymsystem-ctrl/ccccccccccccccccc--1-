import { useState, useEffect, useMemo } from 'react';
import { Product } from '../types';
import { getProducts, addProduct, updateProduct, deleteProduct, processSale } from '../services/gymService';
import { useToast } from './useToast';

export const usePOS = (onUpdate?: () => void) => {
    const { showToast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<{ product: Product, qty: number }[]>([]);
    const [search, setSearch] = useState('');
    const [activeModal, setActiveModal] = useState<'NONE' | 'FORM' | 'CHECKOUT' | 'DELETE'>('NONE');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);
    const [newProduct, setNewProduct] = useState<Partial<Product>>({
        name: '', buyPrice: 0, sellPrice: 0, stock: 0, minStockAlert: 5, barcode: ''
    });

    useEffect(() => { refreshProducts(); }, []);

    const refreshProducts = () => getProducts().then(setProducts);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(i => i.product.id === product.id);
            if (existing) {
                if (existing.qty >= product.stock) return prev;
                return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { product, qty: 1 }];
        });
    };

    const updateQty = (id: number, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.product.id === id) {
                if (delta > 0 && i.qty >= i.product.stock) return i;
                const newQty = Math.max(0, i.qty + delta);
                return { ...i, qty: newQty };
            }
            return i;
        }).filter(i => i.qty > 0));
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.barcode.includes(search)
        );
    }, [products, search]);

    const total = useMemo(() => cart.reduce((acc, item) => acc + (item.product.sellPrice * item.qty), 0), [cart]);

    const handleSaveProduct = async (formData: Partial<Product>) => {
        if (editingId) {
            await updateProduct({ ...formData, id: editingId, gymId: '' } as Product);
            showToast('تم تحديث المنتج بنجاح', 'success');
        } else {
            await addProduct({ ...formData, id: Date.now(), gymId: '' } as Product);
            showToast('تمت إضافة المنتج بنجاح', 'success');
        }
        refreshProducts();
        setActiveModal('NONE');
        if (onUpdate) onUpdate();
    };

    const handleCheckout = async (method: 'CASH' | 'CARD') => {
        await processSale(cart, method);

        // Calculate remaining if possible? 
        // For simplicity, just show success message as requested generally.
        // User asked: "تمت عملية البيع بنجاح. المتبقي في المخزن: 5 قطع."
        // With multiple items, we'll just show "Sale successful".

        const itemCount = cart.reduce((acc, item) => acc + item.qty, 0);
        showToast(`تمت عملية البيع بنجاح. تم بيع ${itemCount} قطع.`, 'success');

        setCart([]);
        setActiveModal('NONE');
        refreshProducts();
        if (onUpdate) onUpdate();
    };

    const handleDeleteProduct = async (id: number) => {
        await deleteProduct(id);
        showToast('تم حذف المنتج بنجاح', 'info');
        refreshProducts();
        setActiveModal('NONE');
        if (onUpdate) onUpdate();
    };

    return {
        state: { products: filteredProducts, cart, search, activeModal, editingId, productToDelete, newProduct, total },
        actions: {
            setSearch, setActiveModal, setEditingId, setProductToDelete, setNewProduct,
            addToCart, updateQty, handleSaveProduct, handleCheckout, handleDeleteProduct, refreshProducts,
            // Added clearCart action
            clearCart: () => setCart([])
        }
    };
};
