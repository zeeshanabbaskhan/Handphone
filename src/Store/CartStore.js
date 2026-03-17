// stores/CartStore.js
import { create } from 'zustand';
import axiosInstance from './AxiosInstance';

const useCartStore = create((set, get) => ({
    // State
    cartItems: [],
    loading: false,
    updatingItem: null,
    couponCode: '',
    appliedCoupon: null,

    // Getters
    getSubtotal: () => {
        const { cartItems } = get();
        return cartItems.reduce((sum, item) => {
            const price = item.product?.price || item.price || 0;
            return sum + (price * item.quantity);
        }, 0);
    },

    getTotal: () => {
        const { getSubtotal, appliedCoupon } = get();
        const subtotal = getSubtotal();
        const shipping = subtotal > 100 ? 0 : 10;
        const discount = appliedCoupon ? appliedCoupon.discount : 0;
        const tax = subtotal * 0.08;
        return subtotal - discount + tax + shipping;
    },

    getTax: () => {
        const { getSubtotal } = get();
        return getSubtotal() * 0.08;
    },

    getShipping: () => {
        const { getSubtotal } = get();
        return getSubtotal() > 100 ? 0 : 10;
    },

    getDiscount: () => {
        const { appliedCoupon } = get();
        return appliedCoupon ? appliedCoupon.discount : 0;
    },

    getCheckoutItems: () => {
        const { cartItems } = get();
        return cartItems.map(item => ({
            _id: item.product?._id || item._id,
            name: item.product?.name || item.name,
            price: item.product?.price || item.price,
            quantity: item.quantity,
            image: item.product?.images?.[0]?.url || item.product?.image || '/placeholder-image.jpg',
            selectedOptions: item.selectedOptions || {}
        }));
    },

    // Actions
    fetchCart: async () => {
        try {
            set({ loading: true });
            const response = await axiosInstance.get('/api/cart/get-cart');

            if (response.data.success) {
                set({ cartItems: response.data.cart?.items || [] });
            } else {
                console.error('Failed to fetch cart:', response.data.message);
                set({ cartItems: [] });
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            set({ cartItems: [] });
        } finally {
            set({ loading: false });
        }
    },

    updateQuantity: async (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            set({ updatingItem: itemId });
            const response = await axiosInstance.put(`/api/cart/update/${itemId}`, {
                quantity: newQuantity
            });

            if (response.data.success) {
                set({ cartItems: response.data.cart?.items || [] });
            } else {
                alert(response.data.message || 'Failed to update cart');
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            alert(error.response?.data?.message || 'Failed to update cart');
        } finally {
            set({ updatingItem: null });
        }
    },

    removeItem: async (itemId) => {
        if (!confirm('Are you sure you want to remove this item?')) return;

        try {
            const response = await axiosInstance.delete(`/api/cart/remove/${itemId}`);

            if (response.data.success) {
                set({ cartItems: response.data.cart?.items || [] });
            } else {
                alert(response.data.message || 'Failed to remove item');
            }
        } catch (error) {
            console.error('Error removing item:', error);
            alert(error.response?.data?.message || 'Failed to remove item');
        }
    },

    clearCart: async () => {
        if (!confirm('Are you sure you want to clear your cart?')) return;

        try {
            const response = await axiosInstance.delete('/api/cart/clear');

            if (response.data.success) {
                set({ cartItems: [] });
            } else {
                alert(response.data.message || 'Failed to clear cart');
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
            alert(error.response?.data?.message || 'Failed to clear cart');
        }
    },

    setCouponCode: (code) => set({ couponCode: code }),

    applyCoupon: () => {
        const { couponCode } = get();
        if (couponCode.trim()) {
            set({
                appliedCoupon: { code: couponCode, discount: 24 },
                couponCode: ''
            });
        }
    },

    removeCoupon: () => set({ appliedCoupon: null }),

    resetCart: () => set({ cartItems: [] }),
}));

export default useCartStore;
