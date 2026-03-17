"use client";

import Header from "@/components/Header";
import ProtectedRoute from "@/components/Protectedroute";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import { ProductStore } from '@/Store/ProductStore';
import { FaTruck, FaUndo, FaLock, FaHeadset } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

export default function Home() {
  const { getallproducts, products } = ProductStore();
  const [saleProducts, setSaleProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await getallproducts();

      } catch {
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [getallproducts]);

  useEffect(() => {
    if (Array.isArray(products)) {
      setSaleProducts(products.filter(p => p.discount > 0).slice(0, 10));
      setFeaturedProducts(products.filter(p => p.isFeatured).slice(0, 8));
      const unique = [...new Set(products.map(p => p.category).filter(Boolean))];
      const mapped = unique.map(cat => ({
        name: cat,
        image: products.find(p => p.category === cat && (p.images?.[0]?.url || p.image))?.images?.[0]?.url
          || products.find(p => p.category === cat)?.image
          || "/placeholder.png",
        count: products.filter(p => p.category === cat).length
      }));
      setCategories(mapped);
      if (!activeCategory && mapped.length) setActiveCategory(mapped[0].name);
    } else {
      setSaleProducts([]);
      setFeaturedProducts([]);
      setCategories([]);
    }
  }, [products]);

  const activeCategoryProducts = useMemo(
    () => (activeCategory ? products.filter(p => p.category === activeCategory).slice(0, 12) : []),
    [products, activeCategory]
  );

  if (loading) {
    return (
      <ProtectedRoute>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-gray-600 mx-auto" />
            <p className="mt-4 text-gray-500 text-sm">Loading...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Choose a featured product as fallback hero if no banners
  const fallbackHero = !banners.length && featuredProducts.length ? featuredProducts[0] : null;

  return (
    <ProtectedRoute>
      <Header />

      {/* Hero / Banners */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-6">
        {banners.length > 0 ? (
          <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
            {banners.map((banner, index) => (
              <div
                key={banner._id || index}
                className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between overflow-hidden"
              >
                <div className="max-w-md">
                  {banner.tagline && <p className="text-xs font-semibold tracking-wide text-sky-600">{banner.tagline}</p>}
                  <h2 className="text-2xl md:text-3xl font-bold mt-2">{banner.title}</h2>
                  {banner.description && <p className="text-gray-600 mt-3 text-sm">{banner.description}</p>}
                  {banner.buttonText && (
                    <button className="mt-5 bg-orange-500 hover:bg-orange-600 text-white text-sm px-5 py-2.5 rounded-md font-medium">
                      {banner.buttonText}
                    </button>
                  )}
                </div>
                {banner.image && (
                  <div className="relative mt-6 md:mt-0">
                    <Image
                      src={banner.image}
                      alt={banner.title || "Banner"}
                      width={380}
                      height={260}
                      className="object-contain w-[260px] md:w-[320px] lg:w-[380px] h-auto"
                      priority
                    />
                    {banner.price && (
                      <div className="absolute top-2 right-2 bg-sky-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                        ${banner.price}
                      </div>
                    )}
                    {banner.discount && (
                      <div className="absolute bottom-2 right-2 bg-yellow-400 text-gray-900 text-[10px] font-bold px-2 py-1 rounded">
                        {banner.discount}% OFF
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : fallbackHero && (
          <div className="relative rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 md:p-10 flex flex-col md:flex-row items-center text-white overflow-hidden">
            <div className="max-w-lg">
              <p className="uppercase tracking-widest text-xs opacity-80">Featured</p>
              <h2 className="text-3xl font-bold mt-2">{fallbackHero.name}</h2>
              {fallbackHero.shortDescription && (
                <p className="mt-3 text-sm text-indigo-100">{fallbackHero.shortDescription}</p>
              )}
              <div className="mt-5 flex items-center space-x-4">
                <span className="text-2xl font-bold">${fallbackHero.price}</span>
                {fallbackHero.discount > 0 && (
                  <span className="bg-white/15 backdrop-blur px-2 py-1 rounded text-xs">
                    {fallbackHero.discount}% OFF
                  </span>
                )}
              </div>
              <Link
                href={`/customers/products/details/${fallbackHero._id || fallbackHero.id}`}
                className={`mt-6 bg-white text-indigo-700 hover:bg-indigo-50 px-6 py-2.5 rounded-md text-sm font-semibold inline-block ${!(fallbackHero._id || fallbackHero.id) ? "pointer-events-none opacity-60" : ""}`}
              >
                Shop Now
              </Link>
            </div>
            <div className="mt-8 md:mt-0 md:ml-auto">
              <Image
                src={fallbackHero.images?.[0]?.url || fallbackHero.image || "/placeholder.png"}
                alt={fallbackHero.name}
                width={420}
                height={320}
                className="object-contain w-[260px] md:w-[340px] lg:w-[420px] h-auto drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        )}

        {/* Service Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8">
          {[
            { icon: <FaTruck />, t: "FAST DELIVERY", s: "Delivery in 24H" },
            { icon: <FaUndo />, t: "24H RETURN", s: "Money-back guarantee" },
            { icon: <FaLock />, t: "SECURE PAYMENT", s: "Protected checkout" },
            { icon: <FaHeadset />, t: "SUPPORT 24/7", s: "We are here" },
          ].map((f, i) => (
            <div key={i} className="flex items-center space-x-3 bg-white shadow-sm rounded-lg px-4 py-3">
              <div className="text-indigo-600 text-xl">{f.icon}</div>
              <div>
                <p className="text-[11px] font-bold tracking-wide">{f.t}</p>
                <p className="text-[11px] text-gray-500">{f.s}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sale (Discounted) Section */}
      {saleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 lg:px-8 mt-14">
          <div className="flex items-center justify-around mb-4">
            <h3 className="text-lg md:text-xl font-semibold">Best Deals</h3>

          </div>
          <div
            //  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            className="grid xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {saleProducts.map(p => (
              <ProductCard key={p._id || p.id} {...p} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 lg:px-8 mt-16">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-semibold">Featured Products</h3>

          </div>
          <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {featuredProducts.map(p => (
              <ProductCard key={p._id || p.id} {...p} />
            ))}
          </div>
        </section>

      )}

      {/* Categories Swiper */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 lg:px-8 mt-16">
          <h3 className="text-lg md:text-xl font-semibold mb-5 text-center md:text-left">
            Shop by Categories
          </h3>
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={16}
            slidesPerView={2}
            navigation
            autoplay={{ delay: 3500 }}
            breakpoints={{
              480: { slidesPerView: 2 },
              640: { slidesPerView: 3 },
              900: { slidesPerView: 4 },
              1200: { slidesPerView: 6 }
            }}
            className="pb-6"
          >
            {categories.map((item, index) => (
              <SwiperSlide key={index}>
                <button
                  onClick={() => setActiveCategory(item.name)}
                  className={`w-full h-full border rounded-lg p-4 flex flex-col items-center justify-center hover:shadow-md transition
                   ${activeCategory === item.name ? "border-indigo-500 shadow" : "border-gray-200"}`}
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="h-20 w-20 object-contain"
                  />
                  <p className="mt-2 font-medium text-xs md:text-sm text-center line-clamp-1">{item.name}</p>
                  <p className="text-[10px] text-gray-500">({item.count})</p>
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

      {/* Active Category Products */}
      {activeCategory && (
        <section className="max-w-7xl mx-auto px-4 lg:px-8 mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-semibold">
              {activeCategory} ({activeCategoryProducts.length} items)
            </h3>

          </div>
          {activeCategoryProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-5">
              {activeCategoryProducts.map(p => (
                <ProductCard key={p._id || p.id} {...p} />
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 py-10 text-center">
              No products in this category yet.
            </div>
          )}
        </section>
      )}

      {/* Browse All Link */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-16 mb-20 text-center">
        <Link
          href="/customers/products"
          className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-md text-sm font-semibold shadow"
        >
          Browse All Products
        </Link>
      </div>

      {/* Empty State */}
      {products.length === 0 && !loading && (
        <div className="py-24 text-center">
          <div className="text-5xl mb-4">🛒</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Available</h3>
          <p className="text-gray-500 text-sm">Check back later for new arrivals.</p>
        </div>
      )}
    </ProtectedRoute>
  );
}
