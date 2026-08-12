import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  ShieldCheck,
  Tag,
  CheckCircle2,
  DollarSign,
  Plus,
  Clock,
  ExternalLink,
  X,
  FileText,
  User,
  Sparkles,
  MapPin,
  Filter,
  Search,
  Phone,
  MessageSquare,
  ArrowUpDown,
  Home,
  Check,
} from 'lucide-react';
import { Appliance, MarketplaceListing, HomeProperty } from '../types';

interface MarketplaceViewProps {
  listings: MarketplaceListing[];
  appliances: Appliance[];
  homes?: HomeProperty[];
  currentHome?: HomeProperty;
  onAddListing: (listing: MarketplaceListing) => void;
  onTransferOwnership?: (appliance: Appliance) => void;
  onImportAppliance?: (appliance: Appliance, targetHomeId: string) => void;
  isPublicMode?: boolean;
  onRequireAuth?: () => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  listings,
  appliances,
  homes = [],
  currentHome,
  onAddListing,
  onImportAppliance,
  isPublicMode = false,
  onRequireAuth,
}) => {
  const [showListModal, setShowListModal] = useState(false);
  const [selectedListingForCertificate, setSelectedListingForCertificate] =
    useState<MarketplaceListing | null>(null);
  const [buyModalListing, setBuyModalListing] = useState<MarketplaceListing | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(0); // 0 = All distances
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'distance' | 'priceAsc' | 'priceDesc' | 'newest' | 'health'>('distance');
  const [filterKeyToAdd, setFilterKeyToAdd] = useState<string>('');

  const activeFilterCount = (maxDistanceKm > 0 ? 1 : 0) + (selectedCity !== 'All' ? 1 : 0) + (selectedCategory !== 'All' ? 1 : 0);

  const clearAllFilters = () => {
    setMaxDistanceKm(0);
    setSelectedCity('All');
    setSelectedCategory('All');
    setSearchQuery('');
    setFilterKeyToAdd('');
  };

  // Form state for Listing
  const [selectedApplianceId, setSelectedApplianceId] = useState<string>('');
  const [askingPriceInput, setAskingPriceInput] = useState<number>(0);
  const [conditionInput, setConditionInput] = useState<any>('');
  const [locationInput, setLocationInput] = useState<string>('');
  const [cityInput, setCityInput] = useState<string>('');
  const [distanceInput, setDistanceInput] = useState<number>(0);
  const [contactInput, setContactInput] = useState<string>('');
  const [sellerName, setSellerName] = useState<string>('');

  // Buy / Offer modal state
  const [targetHomeIdForImport, setTargetHomeIdForImport] = useState<string>(
    currentHome?.id || ''
  );
  const [offerPrice, setOfferPrice] = useState<number>(0);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Extract unique cities
  const citiesList = useMemo(() => {
    const set = new Set<string>();
    listings.forEach((l) => {
      if (l.city) set.add(l.city);
    });
    return Array.from(set);
  }, [listings]);

  // Extract unique categories
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    listings.forEach((l) => {
      if (l.appliance.category) set.add(l.appliance.category);
    });
    return Array.from(set);
  }, [listings]);

  // Filtered & Sorted Listings
  const filteredListings = useMemo(() => {
    return listings
      .filter((item) => {
        // Search Filter
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          !q ||
          item.appliance.name.toLowerCase().includes(q) ||
          item.appliance.brand.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          (item.city && item.city.toLowerCase().includes(q));

        // Distance Filter
        const dist = item.distanceKm || 2.0;
        const matchesDistance = maxDistanceKm === 0 || dist <= maxDistanceKm;

        // City Filter
        const matchesCity = selectedCity === 'All' || item.city === selectedCity;

        // Category Filter
        const matchesCategory =
          selectedCategory === 'All' || item.appliance.category === selectedCategory;

        return matchesSearch && matchesDistance && matchesCity && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'distance') {
          return (a.distanceKm || 0) - (b.distanceKm || 0);
        } else if (sortBy === 'priceAsc') {
          return a.askingPrice - b.askingPrice;
        } else if (sortBy === 'priceDesc') {
          return b.askingPrice - a.askingPrice;
        } else if (sortBy === 'health') {
          return (b.appliance.healthScore || 0) - (a.appliance.healthScore || 0);
        } else {
          return (
            new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime()
          );
        }
      });
  }, [listings, searchQuery, maxDistanceKm, selectedCity, selectedCategory, sortBy]);

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    const appToSell = appliances.find((a) => a.id === selectedApplianceId);
    if (!appToSell) return;

    const newListing: MarketplaceListing = {
      id: `mkt-${Date.now()}`,
      appliance: appToSell,
      askingPrice: Number(askingPriceInput),
      originalPrice: appToSell.purchasePrice,
      sellerName,
      sellerContact: contactInput,
      location: locationInput,
      city: cityInput,
      distanceKm: Number(distanceInput),
      condition: conditionInput,
      verifiedBadge: true,
      listingDate: new Date().toISOString().split('T')[0],
      status: 'Available',
    };

    onAddListing(newListing);
    setShowListModal(false);
  };

  const handleExecutePurchaseOrClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyModalListing) return;

    if (onImportAppliance) {
      // Import this verified appliance directly into buyer's digital home locker
      const boughtAppliance: Appliance = {
        ...buyModalListing.appliance,
        id: `app-bought-${Date.now()}`,
        homeId: targetHomeIdForImport,
        status: 'Healthy',
        notes: `Purchased from ${buyModalListing.sellerName} on Aftermarket portal for $${offerPrice || buyModalListing.askingPrice}.`,
      };
      onImportAppliance(boughtAppliance, targetHomeIdForImport);
    }

    setPurchaseSuccess(true);
    setTimeout(() => {
      setPurchaseSuccess(false);
      setBuyModalListing(null);
    }, 2000);
  };

  return (
    <div className="space-y-5 pb-24 text-slate-900 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-purple-700 mb-1">
            <ShoppingBag className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Shared Aftermarket Portal • Universal Pre-Owned Directory</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight brand-font">
            Verified Pre-Owned Appliance Marketplace
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse verified pre-owned appliances with complete service records, digital RC books, and nearby location filters.
          </p>
        </div>

        <button
          onClick={() => {
            if (isPublicMode && onRequireAuth) {
              onRequireAuth();
            } else {
              setShowListModal(true);
            }
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <Tag className="w-4 h-4" />
          <span>List Appliance for Resale</span>
        </button>
      </div>

      {/* Nearby Location & Search Bar Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by appliance name, brand, model, or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-purple-500 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <ArrowUpDown className="w-4 h-4 text-purple-600 shrink-0" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="distance">Distance: Nearest First</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="health">Health Score: High to Low</option>
              <option value="newest">Newest Listed</option>
            </select>
          </div>
        </div>

        {/* Single-Line AWS Style Key-Value Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-purple-600" />
            Filters:
          </span>

          {/* Active Filter Chips */}
          {maxDistanceKm > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 text-xs font-bold shrink-0">
              <span className="text-purple-600 font-semibold">Radius:</span> Within {maxDistanceKm} km
              <button
                onClick={() => setMaxDistanceKm(0)}
                className="hover:text-rose-600 text-purple-400 p-0.5 transition-colors cursor-pointer"
                title="Remove Radius filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedCity !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold shrink-0">
              <span className="text-slate-500 font-semibold">City:</span> {selectedCity}
              <button
                onClick={() => setSelectedCity('All')}
                className="hover:text-rose-600 text-slate-400 p-0.5 transition-colors cursor-pointer"
                title="Remove City filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedCategory !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold shrink-0">
              <span className="text-slate-500 font-semibold">Category:</span> {selectedCategory}
              <button
                onClick={() => setSelectedCategory('All')}
                className="hover:text-rose-600 text-slate-400 p-0.5 transition-colors cursor-pointer"
                title="Remove Category filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Add Filter Selector - AWS Key:Value Style */}
          <div className="relative inline-flex items-center gap-1">
            <div className="flex items-center border border-slate-200 bg-slate-50 hover:bg-slate-100/80 rounded-lg text-xs font-semibold overflow-hidden transition-all shadow-2xs">
              <span className="px-2.5 py-1 text-slate-500 text-[11px] font-extrabold bg-slate-100 border-r border-slate-200 shrink-0">
                + Add Filter
              </span>
              <select
                value={filterKeyToAdd}
                onChange={(e) => setFilterKeyToAdd(e.target.value)}
                className="bg-transparent px-2.5 py-1 text-slate-800 font-bold outline-none cursor-pointer text-xs"
              >
                <option value="">Select Property...</option>
                <option value="radius">Radius</option>
                <option value="city">City</option>
                <option value="category">Category</option>
              </select>
            </div>

            {/* Value Selectors inline when key is picked */}
            {filterKeyToAdd === 'radius' && (
              <select
                autoFocus
                onChange={(e) => {
                  if (e.target.value) {
                    setMaxDistanceKm(Number(e.target.value));
                    setFilterKeyToAdd('');
                  }
                }}
                className="bg-purple-600 text-white font-bold text-xs rounded-lg px-2.5 py-1 outline-none cursor-pointer animate-fadeIn shadow-2xs"
              >
                <option value="">Select Distance...</option>
                <option value="2">Within 2 km</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="25">Within 25 km</option>
              </select>
            )}

            {filterKeyToAdd === 'city' && (
              <select
                autoFocus
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedCity(e.target.value);
                    setFilterKeyToAdd('');
                  }
                }}
                className="bg-purple-600 text-white font-bold text-xs rounded-lg px-2.5 py-1 outline-none cursor-pointer animate-fadeIn shadow-2xs"
              >
                <option value="">Select City...</option>
                {citiesList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            {filterKeyToAdd === 'category' && (
              <select
                autoFocus
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedCategory(e.target.value);
                    setFilterKeyToAdd('');
                  }
                }}
                className="bg-purple-600 text-white font-bold text-xs rounded-lg px-2.5 py-1 outline-none cursor-pointer animate-fadeIn shadow-2xs"
              >
                <option value="">Select Category...</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Clear All action button */}
          {(activeFilterCount > 0 || searchQuery) && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-extrabold ml-auto transition-colors cursor-pointer hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 brand-font">
            No Products Match Your Nearby Filter
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search query, increasing the distance radius filter, or choosing "All Distances".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setMaxDistanceKm(0);
              setSelectedCity('All');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-xs hover:bg-purple-700 transition-colors mx-auto"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-purple-400 transition-all shadow-xs flex flex-col justify-between group"
            >
              <div>
                {/* Photo & Verified Badges */}
                <div className="relative h-44 rounded-xl overflow-hidden mb-3 bg-slate-100 border border-slate-200">
                  <img
                    src={item.appliance.photoUrl}
                    alt={item.appliance.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Verified Badge */}
                  <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-extrabold text-purple-800 border border-purple-200 flex items-center gap-1 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Verified RC History</span>
                  </div>

                  {/* Condition Badge */}
                  <div className="absolute top-2.5 right-2.5 bg-emerald-500 text-white font-extrabold px-2.5 py-0.5 rounded-lg text-[10px] shadow-xs">
                    {item.condition}
                  </div>

                  {/* Distance Ribbon */}
                  <div className="absolute bottom-2.5 left-2.5 bg-slate-900/90 text-white backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-white/20">
                    <MapPin className="w-3 h-3 text-purple-400" />
                    <span>{item.distanceKm ? `${item.distanceKm} km away` : 'Nearby'}</span>
                    <span className="opacity-60">• {item.location}</span>
                  </div>
                </div>

                {/* Brand & Date */}
                <div className="flex items-center justify-between text-xs font-bold text-purple-700">
                  <span>{item.appliance.brand}</span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    Purchased {item.appliance.purchaseDate}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-extrabold text-slate-900 my-1 line-clamp-1 group-hover:text-purple-700 transition-colors">
                  {item.appliance.name}
                </h3>

                {/* Price & Savings */}
                <div className="flex items-baseline gap-2.5 my-2">
                  <span className="text-xl font-extrabold text-purple-700 brand-font">
                    ${item.askingPrice}
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    ${item.originalPrice} original
                  </span>
                  {item.originalPrice > item.askingPrice && (
                    <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                      Save {Math.round((1 - item.askingPrice / item.originalPrice) * 100)}%
                    </span>
                  )}
                </div>

                {item.appliance.notes && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.appliance.notes}
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 space-y-2 mt-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedListingForCertificate(item)}
                    className="py-2 px-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-extrabold border border-purple-200 flex items-center justify-center gap-1 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-purple-600" />
                    <span>Inspect RC</span>
                  </button>

                  <button
                    onClick={() => {
                      if (isPublicMode && onRequireAuth) {
                        onRequireAuth();
                      } else {
                        setBuyModalListing(item);
                        setOfferPrice(item.askingPrice);
                      }
                    }}
                    className="py-2 px-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-extrabold shadow-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Buy / Offer</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="font-medium">Seller: {item.sellerName}</span>
                  <a
                    href={`tel:${item.sellerContact}`}
                    className="text-purple-700 font-extrabold hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{item.sellerContact}</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BUY / MAKE OFFER / TRANSFER MODAL */}
      {buyModalListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden my-auto p-5 space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900 brand-font">
                  Buy Appliance & Import Digital RC
                </h3>
              </div>
              <button onClick={() => setBuyModalListing(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            {purchaseSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Appliance Purchased & Registered!
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  The verified digital RC book and maintenance logs for <strong>{buyModalListing.appliance.name}</strong> have been imported directly into your home profile!
                </p>
              </div>
            ) : (
              <form onSubmit={handleExecutePurchaseOrClaim} className="space-y-3.5 text-xs">
                {/* Product Summary Box */}
                <div className="bg-purple-50/80 border border-purple-200/80 rounded-xl p-3.5 flex items-center gap-3">
                  <img
                    src={buyModalListing.appliance.photoUrl}
                    alt={buyModalListing.appliance.name}
                    className="w-16 h-16 rounded-lg object-cover border border-purple-200 shrink-0"
                  />
                  <div>
                    <div className="text-[10px] font-bold text-purple-700 uppercase">
                      {buyModalListing.appliance.brand} • {buyModalListing.condition}
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      {buyModalListing.appliance.name}
                    </h4>
                    <div className="text-xs font-extrabold text-purple-800 mt-1">
                      Asking Price: ${buyModalListing.askingPrice}
                    </div>
                  </div>
                </div>

                {/* Offer Amount Input */}
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                    Your Offer / Purchase Price ($)
                  </label>
                  <input
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:border-purple-500 outline-none"
                  />
                </div>

                {/* Destination Home Selection */}
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                    Select Your Home Profile for Ownership Import
                  </label>
                  <select
                    value={targetHomeIdForImport}
                    onChange={(e) => setTargetHomeIdForImport(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-purple-500"
                  >
                    {homes.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.address})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seller Info Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Seller Contact Details</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{buyModalListing.sellerName}</span>
                    <a
                      href={`tel:${buyModalListing.sellerContact}`}
                      className="text-purple-700 font-extrabold underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{buyModalListing.sellerContact}</span>
                    </a>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    📍 Located at {buyModalListing.location} ({buyModalListing.distanceKm} km away)
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBuyModalListing(null)}
                    className="w-1/3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-xs transition-colors"
                  >
                    Confirm Purchase & Import RC Book
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* LIST APPLIANCE MODAL */}
      {showListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden my-auto p-5 space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900 brand-font">
                  Post Verified Resale Listing
                </h3>
              </div>
              <button onClick={() => setShowListModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                  Select Appliance from Digital Locker
                </label>
                <select
                  value={selectedApplianceId}
                  onChange={(e) => setSelectedApplianceId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium outline-none focus:border-purple-500"
                >
                  {appliances.length === 0 ? (
                    <option value="">No appliances in your locker</option>
                  ) : (
                    appliances.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.brand} {a.name} (${a.purchasePrice} original)
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                    Asking Resale Price ($)
                  </label>
                  <input
                    type="number"
                    value={askingPriceInput}
                    onChange={(e) => setAskingPriceInput(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-purple-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                    Condition
                  </label>
                  <select
                    value={conditionInput}
                    onChange={(e) => setConditionInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium outline-none focus:border-purple-500"
                  >
                    <option value="Like New">Like New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                  Seller Name
                </label>
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                    Address / Neighborhood
                  </label>
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                    City Name
                  </label>
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-purple-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                    Approx Distance (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={distanceInput}
                    onChange={(e) => setDistanceInput(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                    Seller Contact Phone
                  </label>
                  <input
                    type="text"
                    value={contactInput}
                    onChange={(e) => setContactInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-purple-500 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={appliances.length === 0}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-xs transition-colors disabled:opacity-50"
                >
                  Publish Listing with Verified RC Badge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VERIFIED TRUST CERTIFICATE MODAL */}
      {selectedListingForCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden my-auto p-5 space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 brand-font">
                    Applora Verified Asset History Certificate
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Transparent digital RC book verification
                  </p>
                </div>
              </div>

              <button onClick={() => setSelectedListingForCertificate(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-sm">
                  {selectedListingForCertificate.appliance.name}
                </span>
                <span className="text-purple-700 font-extrabold text-base brand-font">
                  ${selectedListingForCertificate.askingPrice}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-700 font-medium">
                <div>Original Price: ${selectedListingForCertificate.originalPrice}</div>
                <div>Serial #: {selectedListingForCertificate.appliance.serialNumber}</div>
                <div>Purchase Date: {selectedListingForCertificate.appliance.purchaseDate}</div>
                <div>Health Score: {selectedListingForCertificate.appliance.healthScore}%</div>
                <div>Location: {selectedListingForCertificate.location}</div>
                <div>Distance: {selectedListingForCertificate.distanceKm || 1.2} km away</div>
              </div>

              <div className="pt-2 border-t border-purple-200">
                <span className="font-bold text-purple-800 block mb-1">
                  Verified Maintenance & Service Log:
                </span>
                <ul className="space-y-1.5 text-slate-700 text-[11px]">
                  {selectedListingForCertificate.appliance.serviceHistory.map((s) => (
                    <li key={s.id} className="flex items-center justify-between bg-white p-2 rounded-lg border border-purple-100">
                      <span>• {s.date}: <strong>{s.type}</strong> ({s.notes})</span>
                      <span className="text-emerald-700 font-extrabold">{s.cost === 0 ? 'Free' : `$${s.cost}`}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedListingForCertificate(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition-colors"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
