import React, { useState } from 'react';
import { X, MapPin, Check, Search } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const LocationModal: React.FC = () => {
  const { 
    isLocationModalOpen, 
    setIsLocationModalOpen, 
    selectedLocation, 
    setSelectedLocation, 
    locationsList 
  } = useStore();

  const [customLoc, setCustomLoc] = useState('');
  const [filter, setFilter] = useState('');

  if (!isLocationModalOpen) return null;

  const filteredLocations = locationsList.filter(l => 
    l.toLowerCase().includes(filter.toLowerCase())
  );

  const handleSelect = (loc: string) => {
    setSelectedLocation(loc);
    setIsLocationModalOpen(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customLoc.trim()) {
      setSelectedLocation(`${customLoc.trim()}, Madhubani (847211)`);
      setIsLocationModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-hover max-w-md w-full overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="p-4 bg-forest text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-warmYellow" />
            <h3 className="font-heading font-bold text-sm tracking-wide">
              Select Your Delivery Locality
            </h3>
          </div>
          <button
            onClick={() => setIsLocationModalOpen(false)}
            className="text-white/80 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <p className="text-xs text-charcoal-muted leading-relaxed">
            KD SUPERMARKET delivers across all neighbourhoods in <strong>Madhubani, Bihar (PIN 847211)</strong> from our store at State Bank More.
          </p>

          {/* Search localities */}
          <div className="relative">
            <input
              type="text"
              placeholder="Filter Madhubani localities..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-ivory-50 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
            />
            <Search className="w-4 h-4 text-charcoal-light absolute left-3 top-2.5" />
          </div>

          {/* List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-xl">
            {filteredLocations.map((loc) => {
              const isSelected = selectedLocation.includes(loc.replace(', Madhubani', ''));
              return (
                <button
                  key={loc}
                  onClick={() => handleSelect(loc)}
                  className={`w-full p-2.5 text-left text-xs flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-forest/5 text-forest font-bold' : 'hover:bg-ivory text-charcoal'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-forest' : 'text-charcoal-light'}`} />
                    <span>{loc}</span>
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-forest" />}
                </button>
              );
            })}
          </div>

          {/* Custom landmark input */}
          <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-gray-100 space-y-2">
            <label className="text-[11px] font-bold text-charcoal-muted uppercase tracking-wider block">
              Or enter custom colony / landmark:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Near Durga Mandir, Station Road"
                value={customLoc}
                onChange={(e) => setCustomLoc(e.target.value)}
                className="flex-1 px-3 py-2 bg-ivory-50 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-forest hover:bg-forest-dark text-white rounded-xl text-xs font-bold transition-colors"
              >
                Set
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
