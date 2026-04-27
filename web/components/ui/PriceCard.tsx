import React from 'react';

interface PriceCardProps {
  baseFee: number;
  distanceKm: number;
  pricePerKm: number;
  weightKg: number;
  pricePerKg: number;
  tax: number;
  total: number;
}

export const PriceCard: React.FC<PriceCardProps> = ({
  baseFee,
  distanceKm,
  pricePerKm,
  weightKg,
  pricePerKg,
  tax,
  total
}) => {
  return (
    <div className="glass-card rounded-2xl p-6 border-primary/20 bg-accent/30 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <svg className="w-24 h-24 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 15h2c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1zm0 4h2c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1zm0-8h2c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1zm4 8h6c.55 0 1-.45 1-1s-.45-1-1-1h-6c-.55 0-1 .45-1 1s.45 1 1 1zm0-4h6c.55 0 1-.45 1-1s-.45-1-1-1h-6c-.55 0-1 .45-1 1s.45 1 1 1zm0-8h6c.55 0 1-.45 1-1s-.45-1-1-1h-6c-.55 0-1 .45-1 1s.45 1 1 1zM5 3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5zm14 16H5V5h14v14z"/>
        </svg>
      </div>
      
      <h3 className="text-lg font-bold text-secondary mb-4 uppercase tracking-tighter">Estimated Quote</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-secondary/60">Base Service Fee</span>
          <span className="font-medium text-secondary">GHS {baseFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-secondary/60">Distance ({distanceKm.toFixed(1)} km)</span>
          <span className="font-medium text-secondary">GHS {(distanceKm * pricePerKm).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-secondary/60">Weight ({weightKg.toFixed(1)} kg)</span>
          <span className="font-medium text-secondary">GHS {(weightKg * pricePerKg).toFixed(2)}</span>
        </div>
        <div className="h-[1px] bg-border my-2" />
        <div className="flex justify-between text-sm">
          <span className="text-secondary/60">VAT (15%)</span>
          <span className="font-medium text-secondary">GHS {tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-end mt-4">
          <span className="text-lg font-bold text-secondary">Total Amount</span>
          <span className="text-3xl font-black text-primary">GHS {total.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="mt-6 flex items-center gap-2 text-[10px] text-secondary/40 font-medium italic">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Final price may vary based on actual weight and driver availability.
      </div>
    </div>
  );
};
