"use client";

import { X, Printer } from "lucide-react";
import QRCode from "react-qr-code";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
}

interface QRCodeModalProps {
  product: Product;
  onClose: () => void;
}

export default function QRCodeModal({ product, onClose }: QRCodeModalProps) {
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=600,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code - ${product.sku}</title>
            <style>
              body { 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: center; 
                height: 100vh; 
                font-family: sans-serif; 
              }
              .label { margin-top: 20px; text-align: center; }
              h1 { font-size: 24px; margin: 0; }
              p { font-size: 16px; color: #666; margin: 5px 0 0 0; }
            </style>
          </head>
          <body>
            <div id="qr-target"></div>
            <div class="label">
              <h1>${product.name}</h1>
              <p>SKU: ${product.sku}</p>
              <p>Price: $${product.price.toFixed(2)}</p>
            </div>
            <script>
               // Copy the SVG content from the parent window
               const svg = window.opener.document.getElementById('qr-code-svg').outerHTML;
               document.getElementById('qr-target').innerHTML = svg;
               window.print();
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-900">Asset Tag</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center space-y-6">
          <div className="p-4 bg-white border-2 border-slate-100 rounded-xl shadow-sm">
            <QRCode 
              id="qr-code-svg"
              value={JSON.stringify({ id: product.id, sku: product.sku })} 
              size={200} 
              level="H" 
            />
          </div>
          
          <div className="text-center space-y-1">
            <h4 className="text-lg font-bold text-slate-900">{product.name}</h4>
            <p className="text-sm font-mono text-slate-500">{product.sku}</p>
          </div>

          <button 
            onClick={handlePrint}
            className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all w-full justify-center"
          >
            <Printer className="w-5 h-5" />
            <span>Print Label</span>
          </button>
        </div>
      </div>
    </div>
  );
}
