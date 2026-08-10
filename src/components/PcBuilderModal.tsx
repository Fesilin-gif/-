import React, { useState } from 'react';
import { PcBuildState, Product } from '../types';
import { PRODUCTS } from '../data/catalogData';
import { 
  Wrench, 
  X, 
  Cpu, 
  Zap, 
  Server, 
  Layers, 
  Disc, 
  Shield, 
  CheckCircle2, 
  AlertTriangle,
  ShoppingBag,
  Plus,
  Trash2,
  Sparkles
} from 'lucide-react';

interface PcBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildState: PcBuildState;
  setBuildState: React.Dispatch<React.SetStateAction<PcBuildState>>;
  onAddAllToCart: (items: Product[]) => void;
}

export const PcBuilderModal: React.FC<PcBuilderModalProps> = ({
  isOpen,
  onClose,
  buildState,
  setBuildState,
  onAddAllToCart
}) => {
  const [activeSlot, setActiveSlot] = useState<keyof PcBuildState | null>(null);

  if (!isOpen) return null;

  const slotLabels: { key: keyof PcBuildState; title: string; category: string; icon: any }[] = [
    { key: 'cpu', title: 'Процессор', category: 'cpu', icon: Cpu },
    { key: 'gpu', title: 'Видеокарта', category: 'gpu', icon: Zap },
    { key: 'motherboard', title: 'Материнская плата', category: 'motherboard', icon: Server },
    { key: 'ram', title: 'Оперативная память', category: 'ram', icon: Layers },
    { key: 'storage', title: 'Накопитель (SSD)', category: 'storage', icon: Disc },
    { key: 'psu', title: 'Блок питания', category: 'psu', icon: Shield },
  ];

  // Calculate total price
  const selectedProducts = Object.values(buildState).filter((p): p is Product => p !== null);
  const totalPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0);

  // Check Compatibility
  const compatibilityIssues: string[] = [];

  if (buildState.cpu && buildState.motherboard) {
    if (buildState.cpu.socket && buildState.motherboard.socket && buildState.cpu.socket !== buildState.motherboard.socket) {
      compatibilityIssues.push(`Несовместимый сокет! Процессор (${buildState.cpu.socket}) не подходит к материнской плате (${buildState.motherboard.socket}).`);
    }
  }

  // Wattage check
  const totalPowerConsumption = (buildState.cpu?.wattage || 0) + (buildState.gpu?.wattage || 0) + 100; // 100W buffer
  if (buildState.psu && buildState.psu.wattage) {
    if (buildState.psu.wattage < totalPowerConsumption) {
      compatibilityIssues.push(`Недостаточная мощность БП! Рекомендуется от ${totalPowerConsumption} Вт (выбран БП на ${buildState.psu.wattage} Вт).`);
    }
  }

  const handleSelectProductForSlot = (slotKey: keyof PcBuildState, product: Product) => {
    setBuildState(prev => ({ ...prev, [slotKey]: product }));
    setActiveSlot(null);
  };

  const handleRemoveSlot = (slotKey: keyof PcBuildState) => {
    setBuildState(prev => ({ ...prev, [slotKey]: null }));
  };

  const handleFinishBuild = () => {
    if (selectedProducts.length > 0) {
      onAddAllToCart(selectedProducts);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white border-2 border-slate-300 w-full max-w-5xl clip-dialog-tech shadow-2xl overflow-hidden relative my-8">
        
        {/* Header Bar */}
        <div className="bg-[#0F1115] text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#FF5500] text-white clip-button-tech">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-[#FF5500] uppercase">
                  [PCMARKET // BUILDER_v2.0]
                </span>
              </div>
              <h2 className="text-xl font-black uppercase text-white tracking-wide">
                Конфигуратор сборки ПК
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 clip-button-tech transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Builder Content Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 max-h-[80vh] overflow-y-auto">
          
          {/* Left Column: Component Slots */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-mono text-xs font-bold text-slate-500 uppercase">
                Выбор деталей ({selectedProducts.length} из {slotLabels.length})
              </span>
              {selectedProducts.length > 0 && (
                <button
                  onClick={() => setBuildState({
                    cpu: null, gpu: null, motherboard: null, ram: null, storage: null, psu: null, cooler: null, case: null
                  })}
                  className="text-xs font-mono text-[#FF5500] hover:underline"
                >
                  Очистить всё
                </button>
              )}
            </div>

            {slotLabels.map(slot => {
              const selectedItem = buildState[slot.key];
              const IconComponent = slot.icon;

              return (
                <div
                  key={slot.key}
                  className={`border p-4 clip-button-tech transition-all ${
                    selectedItem
                      ? 'bg-slate-50 border-slate-300'
                      : 'bg-white border-dashed border-slate-300 hover:border-[#FF5500]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 clip-button-tech ${selectedItem ? 'bg-[#0F1115] text-[#FF5500]' : 'bg-slate-100 text-slate-400'}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>

                      <div>
                        <span className="block font-mono text-[10px] text-slate-400 uppercase">
                          {slot.title}
                        </span>

                        {selectedItem ? (
                          <div className="font-extrabold text-sm text-[#0F1115]">
                            {selectedItem.name}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-mono italic">
                            Не выбрано
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {selectedItem ? (
                        <>
                          <span className="font-mono font-bold text-sm text-[#0F1115]">
                            {selectedItem.price.toLocaleString()} ₽
                          </span>
                          <button
                            onClick={() => handleRemoveSlot(slot.key)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-200 rounded-sm"
                            title="Удалить из сборки"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setActiveSlot(slot.key)}
                          className="px-3 py-1.5 bg-[#FF5500] hover:bg-[#E04B00] text-white font-mono text-xs font-bold uppercase clip-button-tech flex items-center shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          Выбрать
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Slot Selector Drawer Modal inline */}
                  {activeSlot === slot.key && (
                    <div className="mt-4 pt-4 border-t border-slate-200 bg-white p-4 clip-button-tech border border-[#FF5500]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-xs font-bold uppercase text-[#FF5500]">
                          Выбор из каталога: {slot.title}
                        </span>
                        <button
                          onClick={() => setActiveSlot(null)}
                          className="text-xs text-slate-400 hover:text-slate-600 font-mono"
                        >
                          Закрыть [X]
                        </button>
                      </div>

                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {PRODUCTS.filter(p => p.category === slot.category).map(item => (
                          <div
                            key={item.id}
                            onClick={() => handleSelectProductForSlot(slot.key, item)}
                            className="p-2.5 bg-slate-50 hover:bg-[#FF5500]/10 border border-slate-200 hover:border-[#FF5500] cursor-pointer flex items-center justify-between clip-button-tech transition-colors"
                          >
                            <div>
                              <div className="font-bold text-xs text-[#0F1115]">{item.name}</div>
                              <div className="font-mono text-[10px] text-slate-500">
                                {Object.entries(item.specs).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                              </div>
                            </div>

                            <span className="font-mono font-bold text-xs text-[#FF5500]">
                              {item.price.toLocaleString()} ₽
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Right Column: Build Summary & Compatibility status */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0F1115] text-white p-6 clip-button-tech border border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-mono text-xs font-bold text-[#FF5500] uppercase">
                  Итоговая сборка
                </span>
                <Sparkles className="w-4 h-4 text-[#FF5500]" />
              </div>

              {/* Power calculation */}
              <div className="space-y-1 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Расчетное энергопотребление:</span>
                  <span className="text-white font-bold">{totalPowerConsumption} Вт</span>
                </div>
                {buildState.psu && (
                  <div className="flex justify-between text-slate-400">
                    <span>Выбранный блок питания:</span>
                    <span className="text-[#FF5500] font-bold">{buildState.psu.wattage} Вт</span>
                  </div>
                )}
              </div>

              {/* Compatibility Check Result */}
              <div className="pt-2 border-t border-slate-800">
                {compatibilityIssues.length > 0 ? (
                  <div className="bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-xs font-mono space-y-1">
                    <div className="flex items-center font-bold text-red-500">
                      <AlertTriangle className="w-4 h-4 mr-1.5" />
                      Обнаружены конфликты:
                    </div>
                    {compatibilityIssues.map((issue, idx) => (
                      <p key={idx} className="text-[11px] leading-snug">{issue}</p>
                    ))}
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 text-emerald-400 text-xs font-mono flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
                    <span>Все детали на 100% совместимы!</span>
                  </div>
                )}
              </div>

              {/* Total Price */}
              <div className="pt-4 border-t border-slate-800">
                <span className="block font-mono text-xs text-slate-400 uppercase">
                  Общая стоимость
                </span>
                <span className="text-3xl font-black font-mono text-[#FF5500]">
                  {totalPrice.toLocaleString()} ₽
                </span>
              </div>

              {/* Action Button */}
              <button
                onClick={handleFinishBuild}
                disabled={selectedProducts.length === 0}
                className="w-full py-4 bg-[#FF5500] hover:bg-[#E04B00] disabled:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider clip-button-tech shadow-lg hover:shadow-xl glow-orange-md transition-all flex items-center justify-center"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                <span>Добавить сборку в корзину</span>
              </button>

              <p className="text-[10px] font-mono text-slate-500 text-center">
                * Бесплатная профессиональная сборка и кабель-менеджмент входят в стоимость
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
