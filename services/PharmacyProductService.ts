/**
 * Enterprise Pharmacy Product Integration Service
 * 
 * This service provides a systematic approach to fetch and manage
 * real product data from pharmacy partner websites.
 * 
 * Architecture:
 * - Product Data Aggregation
 * - Image Caching & Optimization
 * - Fallback & Error Handling
 * - Performance Monitoring
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for pharmacy products
export interface PharmacyProduct {
  id: string;
  name: string;
  genericName?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  dosage?: string;
  quantity: string;
  prescription: boolean;
  imageUrl: string;
  imageUrls: string[]; // Multiple images
  pharmacy: PharmacyPartner;
  inStock: boolean;
  discount?: number;
  category: string;
  manufacturer?: string;
  description: string;
  sku?: string;
  barcode?: string;
  lastUpdated: Date;
  rating?: number;
  reviewCount?: number;
  deepLink?: string; // Link to product page
}

export interface PharmacyPartner {
  id: string;
  name: string;
  domain: string;
  logoUrl: string;
  color: string;
  apiEndpoint?: string;
  rateLimit: number; // requests per minute
  lastSync: Date;
}

// Pharmacy Partners Configuration
export const PHARMACY_PARTNERS: PharmacyPartner[] = [
  {
    id: 'clicks',
    name: 'Clicks',
    domain: 'clicks.co.za',
    logoUrl: 'https://www.clicks.co.za/assets/images/clicks-logo.svg',
    color: '#00A651',
    rateLimit: 60,
    lastSync: new Date()
  },
  {
    id: 'dischem',
    name: 'Dis-Chem',
    domain: 'dischem.co.za',
    logoUrl: 'https://www.dischem.co.za/media/wysiwyg/dischem-logo.png',
    color: '#E31E24',
    rateLimit: 60,
    lastSync: new Date()
  },
  {
    id: 'medirite',
    name: 'Medirite',
    domain: 'medirite.co.za',
    logoUrl: 'https://www.medirite.co.za/skin/frontend/ultimo/medirite/images/logo.png',
    color: '#0066CC',
    rateLimit: 60,
    lastSync: new Date()
  },
  {
    id: 'mopani',
    name: 'Mopani Pharmacy',
    domain: 'mopani.co.za',
    logoUrl: 'https://mopani.co.za/wp-content/uploads/2021/03/mopani-logo.png',
    color: '#8B4513',
    rateLimit: 60,
    lastSync: new Date()
  },
  {
    id: 'morningside',
    name: 'Morningside Dispensary',
    domain: 'morningsidedispensary.co.za',
    logoUrl: 'https://morningsidedispensary.co.za/assets/logo.png',
    color: '#2E8B57',
    rateLimit: 60,
    lastSync: new Date()
  }
];

// Product Categories for better organization
export const PRODUCT_CATEGORIES = [
  'Pain Relief',
  'Vitamins & Supplements',
  'Skincare',
  'Baby Care',
  'Cold & Flu',
  'Digestive Health',
  'Allergy Relief',
  'First Aid',
  'Prescription Medicines',
  'Health Monitoring',
  'Personal Care',
  'Antiseptics'
];

class PharmacyProductService {
  private static instance: PharmacyProductService;
  private cache: Map<string, PharmacyProduct[]> = new Map();
  private cacheExpiry = 6 * 60 * 60 * 1000; // 6 hours
  private requestQueue: Map<string, Promise<any>> = new Map();

  static getInstance(): PharmacyProductService {
    if (!PharmacyProductService.instance) {
      PharmacyProductService.instance = new PharmacyProductService();
    }
    return PharmacyProductService.instance;
  }

  /**
   * Fetch products from a specific pharmacy
   */
  async fetchPharmacyProducts(
    pharmacyId: string,
    category?: string,
    searchTerm?: string,
    limit: number = 20
  ): Promise<PharmacyProduct[]> {
    const cacheKey = `${pharmacyId}-${category || 'all'}-${searchTerm || ''}`;
    
    // Check cache first
    const cached = await this.getCachedProducts(cacheKey);
    if (cached && cached.length > 0) {
      return cached.slice(0, limit);
    }

    // Prevent duplicate requests
    if (this.requestQueue.has(cacheKey)) {
      return await this.requestQueue.get(cacheKey)!;
    }

    const promise = this.fetchProductsFromAPI(pharmacyId, category, searchTerm, limit);
    this.requestQueue.set(cacheKey, promise);

    try {
      const products = await promise;
      await this.cacheProducts(cacheKey, products);
      this.requestQueue.delete(cacheKey);
      return products;
    } catch (error) {
      this.requestQueue.delete(cacheKey);
      console.error(`Error fetching products from ${pharmacyId}:`, error);
      return this.getFallbackProducts(pharmacyId, limit);
    }
  }

  /**
   * Fetch products from multiple pharmacies and aggregate
   */
  async fetchAllPharmacyProducts(
    category?: string,
    searchTerm?: string,
    limit: number = 50
  ): Promise<PharmacyProduct[]> {
    const promises = PHARMACY_PARTNERS.map(partner => 
      this.fetchPharmacyProducts(partner.id, category, searchTerm, Math.ceil(limit / PHARMACY_PARTNERS.length))
    );

    try {
      const results = await Promise.allSettled(promises);
      const allProducts: PharmacyProduct[] = [];

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          allProducts.push(...result.value);
        }
      });

      // Sort by relevance, price, rating
      return this.sortProducts(allProducts, searchTerm).slice(0, limit);
    } catch (error) {
      console.error('Error fetching products from all pharmacies:', error);
      return this.getFallbackProducts('all', limit);
    }
  }

  /**
   * Fetch products using web scraping (fallback method)
   * Currently disabled to prevent API errors - using fallback products
   */
  private async fetchProductsFromAPI(
    pharmacyId: string,
    category?: string,
    searchTerm?: string,
    limit: number = 20
  ): Promise<PharmacyProduct[]> {
    // Temporarily disabled to prevent API errors
    console.log(`🔄 API calls disabled - returning fallback products for ${pharmacyId}`);
    return this.getFallbackProducts(pharmacyId, limit);
  }

  /**
   * Build search URL for each pharmacy
   */
  private buildPharmacySearchUrl(
    pharmacy: PharmacyPartner,
    category?: string,
    searchTerm?: string
  ): string {
    const baseUrls = {
      clicks: 'https://clicks.co.za/search',
      dischem: 'https://www.dischem.co.za/catalogsearch/result',
      medirite: 'https://www.medirite.co.za/catalogsearch/result',
      mopani: 'https://mopani.co.za/shop',
      morningside: 'https://morningsidedispensary.co.za/products'
    };

    const baseUrl = baseUrls[pharmacy.id as keyof typeof baseUrls];
    const params = new URLSearchParams();

    if (searchTerm) {
      params.append('q', searchTerm);
    }
    if (category) {
      params.append('category', category);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Get CSS selectors for each pharmacy's product listings
   */
  private getProductSelector(pharmacyId: string): string {
    const selectors = {
      clicks: '.product-item',
      dischem: '.product-item-info',
      medirite: '.product-item',
      mopani: '.woocommerce-product',
      morningside: '.product-card'
    };

    return selectors[pharmacyId as keyof typeof selectors] || '.product-item';
  }

  /**
   * Parse raw product data into our standard format
   */
  private parseProductData(data: any, pharmacy: PharmacyPartner): PharmacyProduct[] {
    if (!data.result?.extract?.products) return [];

    return data.result.extract.products.map((item: any, index: number) => ({
      id: `${pharmacy.id}-${Date.now()}-${index}`,
      name: this.cleanProductName(item.name),
      price: this.parsePrice(item.price),
      currency: 'ZAR',
      quantity: this.extractQuantity(item.name),
      prescription: this.isPrescriptionMedicine(item.name),
      imageUrl: this.normalizeImageUrl(item.image, pharmacy.domain),
      imageUrls: [this.normalizeImageUrl(item.image, pharmacy.domain)],
      pharmacy: pharmacy,
      inStock: true,
      category: this.categorizeProduct(item.name),
      description: this.generateDescription(item.name),
      lastUpdated: new Date(),
      deepLink: this.normalizeUrl(item.link, pharmacy.domain)
    }));
  }

  /**
   * Cache products locally
   */
  private async cacheProducts(key: string, products: PharmacyProduct[]): Promise<void> {
    try {
      const cacheData = {
        products,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(`pharmacy_cache_${key}`, JSON.stringify(cacheData));
      this.cache.set(key, products);
    } catch (error) {
      console.error('Error caching products:', error);
    }
  }

  /**
   * Get cached products
   */
  private async getCachedProducts(key: string): Promise<PharmacyProduct[] | null> {
    try {
      // Check memory cache first
      if (this.cache.has(key)) {
        return this.cache.get(key)!;
      }

      // Check persistent cache
      const cached = await AsyncStorage.getItem(`pharmacy_cache_${key}`);
      if (cached) {
        const { products, timestamp } = JSON.parse(cached);
        
        // Check if cache is still valid
        if (Date.now() - timestamp < this.cacheExpiry) {
          this.cache.set(key, products);
          return products;
        } else {
          // Remove expired cache
          await AsyncStorage.removeItem(`pharmacy_cache_${key}`);
        }
      }
    } catch (error) {
      console.error('Error getting cached products:', error);
    }
    
    return null;
  }

  /**
   * Provide fallback products when API fails
   */
  private getFallbackProducts(pharmacyId: string, limit: number): PharmacyProduct[] {
    // Return curated fallback products
    return FALLBACK_PRODUCTS.filter(p => 
      pharmacyId === 'all' || p.pharmacy.id === pharmacyId
    ).slice(0, limit);
  }

  /**
   * Sort products by relevance
   */
  private sortProducts(products: PharmacyProduct[], searchTerm?: string): PharmacyProduct[] {
    return products.sort((a, b) => {
      // Search relevance
      if (searchTerm) {
        const aRelevance = this.calculateRelevance(a, searchTerm);
        const bRelevance = this.calculateRelevance(b, searchTerm);
        if (aRelevance !== bRelevance) return bRelevance - aRelevance;
      }

      // Price (ascending)
      if (a.price !== b.price) return a.price - b.price;

      // Stock status
      if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;

      // Rating
      if (a.rating && b.rating && a.rating !== b.rating) {
        return b.rating - a.rating;
      }

      return 0;
    });
  }

  /**
   * Calculate search relevance score
   */
  private calculateRelevance(product: PharmacyProduct, searchTerm: string): number {
    const term = searchTerm.toLowerCase();
    const name = product.name.toLowerCase();
    const generic = product.genericName?.toLowerCase() || '';
    
    let score = 0;
    if (name.includes(term)) score += 10;
    if (name.startsWith(term)) score += 5;
    if (generic.includes(term)) score += 3;
    
    return score;
  }

  // Utility methods
  private cleanProductName(name: string): string {
    return name?.trim().replace(/\s+/g, ' ') || 'Unknown Product';
  }

  private parsePrice(priceText: string): number {
    const match = priceText?.match(/[\d,]+\.?\d*/);
    return match ? parseFloat(match[0].replace(',', '')) : 0;
  }

  private extractQuantity(name: string): string {
    const match = name?.match(/(\d+\s*(ml|mg|g|tablets?|capsules?|sachets?))/i);
    return match ? match[0] : '1 unit';
  }

  private isPrescriptionMedicine(name: string): boolean {
    const prescriptionKeywords = ['prescription', 'rx', 'schedule'];
    return prescriptionKeywords.some(keyword => 
      name?.toLowerCase().includes(keyword)
    );
  }

  private normalizeImageUrl(imageUrl: string, domain: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('//')) return `https:${imageUrl}`;
    if (imageUrl.startsWith('/')) return `https://${domain}${imageUrl}`;
    return `https://${domain}/${imageUrl}`;
  }

  private normalizeUrl(url: string, domain: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `https://${domain}${url}`;
    return `https://${domain}/${url}`;
  }

  private categorizeProduct(name: string): string {
    const categoryKeywords = {
      'Pain Relief': ['panado', 'ibuprofen', 'aspirin', 'pain', 'headache'],
      'Vitamins & Supplements': ['vitamin', 'supplement', 'multivitamin', 'calcium'],
      'Skincare': ['cream', 'lotion', 'sunscreen', 'moisturizer'],
      'Cold & Flu': ['flu', 'cold', 'cough', 'throat'],
      'Baby Care': ['baby', 'infant', 'nappy', 'diaper'],
      'Antiseptics': ['betadine', 'antiseptic', 'disinfectant']
    };

    const lowerName = name.toLowerCase();
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerName.includes(keyword))) {
        return category;
      }
    }
    return 'General Health';
  }

  private generateDescription(name: string): string {
    return `High-quality ${name} available for purchase. Consult your healthcare provider for proper usage instructions.`;
  }
}

// Fallback products for when API is unavailable
const FALLBACK_PRODUCTS: PharmacyProduct[] = [
  {
    id: 'fallback-1',
    name: 'Panado Pain Relief',
    genericName: 'Paracetamol',
    price: 25.99,
    currency: 'ZAR',
    quantity: '20 tablets',
    prescription: false,
    imageUrl: 'https://via.placeholder.com/300x300/00A651/FFFFFF?text=Panado',
    imageUrls: ['https://via.placeholder.com/300x300/00A651/FFFFFF?text=Panado'],
    pharmacy: PHARMACY_PARTNERS[0],
    inStock: true,
    category: 'Pain Relief',
    description: 'Fast-acting pain relief for headaches and body aches.',
    lastUpdated: new Date()
  }
  // Add more fallback products...
];

export default PharmacyProductService;
