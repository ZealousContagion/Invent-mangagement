import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export interface InvoiceData {
    orderNumber: string;
    date: string;
    customer: {
        name: string;
        email?: string;
        phone?: string;
        address?: string;
    };
    items: {
        name: string;
        sku: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }[];
    totalAmount: number;
    companyName?: string;
}

export const generateInvoicePDF = (data: InvoiceData) => {
    const doc = new jsPDF();
    const companyName = data.companyName || "Inventory Pro";

    // Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(companyName, 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("COMMERCIAL INVOICE", 140, 22);

    // Divider
    doc.setDrawColor(241, 245, 249); // slate-100
    doc.line(14, 28, 196, 28);

    // Bill To
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("BILL TO:", 14, 40);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(data.customer.name, 14, 46);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    if (data.customer.address) doc.text(data.customer.address as string, 14, 52);
    if (data.customer.email) doc.text(data.customer.email as string, 14, 58);
    if (data.customer.phone) doc.text(data.customer.phone as string, 14, 64);

    // Order Details
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("INVOICE #:", 140, 40);
    doc.setTextColor(15, 23, 42);
    doc.text(data.orderNumber, 165, 40);

    doc.setTextColor(100);
    doc.text("DATE:", 140, 46);
    doc.setTextColor(15, 23, 42);
    doc.text(format(new Date(data.date), 'MMM dd, yyyy'), 165, 46);

    // Table
    const tableRows = data.items.map(item => [
        item.name,
        item.sku,
        item.quantity.toString(),
        `$${item.unitPrice.toFixed(2)}`,
        `$${item.total.toFixed(2)}`
    ]);

    (doc as any).autoTable({
        startY: 80,
        head: [['Product', 'SKU', 'Qty', 'Unit Price', 'Total']],
        body: tableRows,
        theme: 'striped',
        headStyles: {
            fillColor: [15, 23, 42],
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold'
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [51, 65, 85] // slate-600
        },
        columnStyles: {
            2: { halign: 'center' },
            3: { halign: 'right' },
            4: { halign: 'right' }
        }
    });

    // Total
    const finalY = ((doc as any).lastAutoTable?.finalY || 150) + 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold') as any;
    doc.text("TOTAL AMOUNT:", 140, finalY);
    doc.text(`$${data.totalAmount.toFixed(2)}`, 196, finalY, { align: 'right' });

    // Footer
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic') as any;
    doc.setTextColor(150);
    doc.text("Thank you for your business!", 105, 280, { align: 'center' });

    doc.save(`${data.orderNumber}_Invoice.pdf`);
};

export interface POData {
    orderNumber: string;
    date: string;
    expectedDate?: string;
    supplier: {
        name: string;
        email?: string;
        phone?: string;
        address?: string;
    };
    items: {
        name: string;
        sku: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }[];
    totalAmount: number;
    companyName?: string;
}

export const generatePurchaseOrderPDF = (data: POData) => {
    const doc = new jsPDF();
    const companyName = data.companyName || "Inventory Pro";

    // Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text(companyName, 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("PURCHASE ORDER", 140, 22);

    // Divider
    doc.setDrawColor(241, 245, 249);
    doc.line(14, 28, 196, 28);

    // Vendor
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("VENDOR:", 14, 40);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(data.supplier.name, 14, 46);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    if (data.supplier.address) doc.text(data.supplier.address as string, 14, 52);
    if (data.supplier.email) doc.text(data.supplier.email as string, 14, 58);
    if (data.supplier.phone) doc.text(data.supplier.phone as string, 14, 64);

    // Order Details
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("P.O. #:", 140, 40);
    doc.setTextColor(15, 23, 42);
    doc.text(data.orderNumber, 165, 40);

    doc.setTextColor(100);
    doc.text("DATE:", 140, 46);
    doc.setTextColor(15, 23, 42);
    doc.text(format(new Date(data.date), 'MMM dd, yyyy'), 165, 46);

    if (data.expectedDate) {
        doc.setTextColor(100);
        doc.text("EXPECTED:", 140, 52);
        doc.setTextColor(15, 23, 42);
        doc.text(format(new Date(data.expectedDate), 'MMM dd, yyyy'), 165, 52);
    }

    // Table
    const tableRows = data.items.map(item => [
        item.name,
        item.sku,
        item.quantity.toString(),
        `$${item.unitPrice.toFixed(2)}`,
        `$${item.total.toFixed(2)}`
    ]);

    (doc as any).autoTable({
        startY: 80,
        head: [['Product', 'SKU', 'Qty', 'Unit Price', 'Total']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [51, 65, 85] },
        columnStyles: {
            2: { halign: 'center' },
            3: { halign: 'right' },
            4: { halign: 'right' }
        }
    });

    const finalY = ((doc as any).lastAutoTable?.finalY || 150) + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("TOTAL ORDER VALUE:", 140, finalY);
    doc.text(`$${data.totalAmount.toFixed(2)}`, 196, finalY, { align: 'right' });

    doc.save(`${data.orderNumber}_PO.pdf`);
};
