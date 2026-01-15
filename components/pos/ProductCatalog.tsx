import React from 'react';
import { Package, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Product } from '../../types';
import { Language, translations } from '../../utils/translations';

interface ProductCatalogProps {
  products: Product[];
  onAddToCart: (p: Product) => void;
  onEdit: (e: React.MouseEvent, p: Product) => void;
  onDelete: (id: number) => void;
  lang: Language;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ products, onAddToCart, onEdit, onDelete, lang }) => {
  const t = translations[lang];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 pb-24 sm:pb-10">
      {products.map(product => {
        // تحديد إذا كان المخزون منخفضاً (5 قطع أو أقل ولكن ليس صفراً)
        const isLowStock = product.stock > 0 && product.stock <= 5;
        const isOutOfStock = product.stock === 0;

        return (
          <div 
            key={product.id} 
            className={`flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 overflow-hidden transition-all ${
              isOutOfStock ? 'opacity-60 grayscale' : 'hover:shadow-md hover:border-blue-400/50'
            }`}
          >
            {/* القسم العلوي: منطقة النقر للإضافة للسلة */}
            <button 
              onClick={() => !isOutOfStock && onAddToCart(product)}
              disabled={isOutOfStock}
              className="flex-1 p-3 sm:p-4 text-start flex flex-col gap-2 w-full active:bg-gray-50 dark:active:bg-slate-700/50 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isLowStock ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-blue-50 dark:bg-blue-900/20'
              }`}>
                <Package size={20} className={isLowStock ? 'text-orange-500' : 'text-blue-500'} />
              </div>
              
              <div className="space-y-1">
                <h3 className="font-black text-sm sm:text-base dark:text-white line-clamp-2 leading-tight h-10">
                  {product.name}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-lg sm:text-xl font-black text-blue-600">
                    ${product.sellPrice}
                  </span>
                  {!isOutOfStock && (
                    <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm">
                      <Plus size={16} />
                    </div>
                  )}
                </div>
              </div>
            </button>

            {/* القسم السفلي: شريط الأدوات مع تنبيه المخزون */}
            <div className={`px-3 py-2 border-t flex items-center justify-between transition-colors ${
              isLowStock 
                ? 'bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-800' 
                : 'bg-gray-50 dark:bg-slate-900/50 dark:border-slate-700'
            }`}>
              {/* مؤشر المخزون */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className={`text-[8px] font-black uppercase tracking-tighter ${
                    isLowStock ? 'text-red-600 dark:text-red-400' : 'text-gray-400'
                  }`}>
                    {t.stock}
                  </span>
                  {isLowStock && <AlertTriangle size={8} className="text-red-500 animate-pulse" />}
                </div>
                <span className={`text-[10px] font-black ${
                  isLowStock ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'
                }`}>
                  {product.stock} {lang === 'ar' ? 'قطعة' : 'Units'}
                </span>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex gap-1">
                <button 
                  onClick={(e) => onEdit(e, product)} 
                  className="p-2 bg-white dark:bg-slate-800 text-blue-500 rounded-lg border dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors shadow-sm"
                >
                  <Edit size={12} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(product.id); }} 
                  className="p-2 bg-white dark:bg-slate-800 text-red-500 rounded-lg border dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shadow-sm"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};