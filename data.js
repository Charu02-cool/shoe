const PRODUCTS = [
  {
    id: 1, name: "Nike Air Max 270", brand: "Nike", category: "running",
    price: 8999, oldPrice: 14999,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    rating: 4.5, reviews: 2341, featured: true,
    description: "Maximum cushioning with the largest Air unit yet. Designed for all-day comfort with a dramatic heel for a bold look.",
    sizes: ["UK 6","UK 7","UK 8","UK 9","UK 10","UK 11"]
  },
  {
    id: 2, name: "Adidas Ultraboost 22", brand: "Adidas", category: "running",
    price: 12499, oldPrice: 18999,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80",
    rating: 4.7, reviews: 3102, featured: true,
    description: "Incredible energy return in every stride. The Boost midsole adapts to your foot for a personalized fit.",
    sizes: ["UK 6","UK 7","UK 8","UK 9","UK 10","UK 11"]
  },
  {
    id: 3, name: "Puma RS-X³", brand: "Puma", category: "casual",
    price: 6799, oldPrice: 10999,
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80",
    rating: 4.3, reviews: 891, featured: false,
    description: "Retro-inspired chunky sole with bold colorways. A statement piece for everyday streetwear.",
    sizes: ["UK 6","UK 7","UK 8","UK 9","UK 10"]
  },
  {
    id: 4, name: "New Balance 990v5", brand: "New Balance", category: "running",
    price: 15999, oldPrice: 21999,
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&q=80",
    rating: 4.8, reviews: 1567, featured: true,
    description: "Made in USA with premium materials. The benchmark of performance and comfort for serious runners.",
    sizes: ["UK 7","UK 8","UK 9","UK 10","UK 11"]
  },
  {
    id: 5, name: "Reebok Classic Leather", brand: "Reebok", category: "casual",
    price: 4499, oldPrice: 6999,
    image: "https://images.unsplash.com/photo-1562183241-b937e95585b6?w=400&q=80",
    rating: 4.2, reviews: 2789, featured: false,
    description: "Timeless leather upper with iconic silhouette. The shoe that never goes out of style.",
    sizes: ["UK 6","UK 7","UK 8","UK 9","UK 10","UK 11"]
  },
  {
    id: 6, name: "Converse Chuck Taylor All Star", brand: "Converse", category: "casual",
    price: 3799, oldPrice: 5499,
    image: "https://images.unsplash.com/photo-1494496195158-c3becb4f2475?w=400&q=80",
    rating: 4.4, reviews: 5632, featured: false,
    description: "The original canvas sneaker. Over 100 years of iconic style that pairs with everything.",
    sizes: ["UK 5","UK 6","UK 7","UK 8","UK 9","UK 10","UK 11"]
  },
  {
    id: 7, name: "Nike Air Force 1", brand: "Nike", category: "casual",
    price: 7999, oldPrice: 11999,
    image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&q=80",
    rating: 4.6, reviews: 8921, featured: true,
    description: "The basketball icon turned street staple. Clean, classic, and endlessly versatile.",
    sizes: ["UK 6","UK 7","UK 8","UK 9","UK 10","UK 11"]
  },
  {
    id: 8, name: "Adidas Stan Smith", brand: "Adidas", category: "formal",
    price: 5499, oldPrice: 8499,
    image: "https://images.unsplash.com/photo-1465453869711-7e174808ace9?w=400&q=80",
    rating: 4.3, reviews: 4120, featured: false,
    description: "Clean minimalist design in premium leather. The perfect smart-casual shoe for every occasion.",
    sizes: ["UK 6","UK 7","UK 8","UK 9","UK 10"]
  },
  {
    id: 9, name: "Skechers D'Lites", brand: "Skechers", category: "casual",
    price: 3299, oldPrice: 4999,
    image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400&q=80",
    rating: 4.1, reviews: 3456, featured: false,
    description: "Chunky retro platform with Air-Cooled Memory Foam. Comfort you can see and feel.",
    sizes: ["UK 5","UK 6","UK 7","UK 8","UK 9","UK 10","UK 11"]
  },
  {
    id: 10, name: "Vans Old Skool", brand: "Vans", category: "sports",
    price: 4199, oldPrice: 6299,
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80",
    rating: 4.5, reviews: 6780, featured: true,
    description: "The original skate shoe with the iconic side stripe. Built tough for the skatepark and streets.",
    sizes: ["UK 5","UK 6","UK 7","UK 8","UK 9","UK 10","UK 11"]
  },
  {
    id: 11, name: "Nike React Infinity Run", brand: "Nike", category: "running",
    price: 11999, oldPrice: 15999,
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80",
    rating: 4.6, reviews: 1892, featured: false,
    description: "Designed to reduce injury. React foam with a wider base and more cushioning for long-distance runs.",
    sizes: ["UK 7","UK 8","UK 9","UK 10","UK 11"]
  },
  {
    id: 12, name: "Bata Comfit Oxford", brand: "Bata", category: "formal",
    price: 2499, oldPrice: 3999,
    image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400&q=80",
    rating: 4.0, reviews: 2134, featured: false,
    description: "Premium leather oxford for the modern professional. Comfortable enough for all-day office wear.",
    sizes: ["UK 6","UK 7","UK 8","UK 9","UK 10","UK 11"]
  }
];

// Cart stored in memory
let cart = JSON.parse(localStorage.getItem('flipkartCart') || '[]');

function saveCart() {
  localStorage.setItem('flipkartCart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const badges = document.querySelectorAll('#cartCount');
  badges.forEach(b => b.textContent = cart.reduce((s,i) => s + i.qty, 0));
}

function addToCart(productId, size, qty = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(i => i.id === productId && i.size === size);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ ...product, size, qty });
  }
  saveCart();
  showToast(`✅ ${product.name} (${size}) added to cart!`);
}

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function renderStars(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) stars += '<i class="fa fa-star"></i>';
    else if (i - rating < 1) stars += '<i class="fa fa-star-half-alt"></i>';
    else stars += '<i class="far fa-star"></i>';
  }
  return stars;
}

function formatPrice(p) {
  return '₹' + p.toLocaleString('en-IN');
}

document.addEventListener('DOMContentLoaded', () => updateCartBadge());
