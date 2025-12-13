import React, { useMemo, useState } from 'react';
import { db } from '../services/db';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Download, FileText, Eye, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports: React.FC = () => {
  const contributions = db.getAllContributions();
  const [showPreview, setShowPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const monthlyData = useMemo(() => {
    const data: Record<string, { name: string, amount: number, count: number }> = {};

    contributions.forEach(c => {
      const date = new Date(c.date);
      // Key format: YYYY-MM
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const name = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

      if (!data[key]) {
        data[key] = { name: name.charAt(0).toUpperCase() + name.slice(1), amount: 0, count: 0 };
      }
      data[key].amount += c.amount;
      data[key].count += 1;
    });

    // Sort by key (date) and return array
    return Object.keys(data).sort().map(key => data[key]);
  }, [contributions]);

  const totalCollected = contributions.reduce((acc, c) => acc + c.amount, 0);

  const generatePDFDocument = () => {
    const doc = new jsPDF();
    const primaryColor = [19, 57, 95]; // #13395F
    const pageWidth = doc.internal.pageSize.width; // 210mm for A4

    // --- Header ---
    // Background Band
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    // Title
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('Cahier Hainou Nahim', 14, 18);
    
    // Subtitle
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text('Rapport Financier Mensuel', 14, 25);

    // Generation Date (Top Right)
    const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.setFontSize(10);
    doc.text(`Généré le : ${dateStr}`, pageWidth - 14, 18, { align: 'right' });

    // --- Summary Section (Adjusted for overflow) ---
    doc.setTextColor(50, 50, 50);
    
    const margin = 14;
    const boxGap = 10;
    const boxWidth = (pageWidth - (margin * 2) - boxGap) / 2; // Calculate width dynamically to fit perfectly

    // Box 1: Total Collected
    doc.setFillColor(245, 247, 250);
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(margin, 40, boxWidth, 25, 3, 3, 'FD');
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('TOTAL GÉNÉRAL COLLECTÉ', margin + 6, 48);
    
    doc.setFontSize(16);
    doc.setTextColor(19, 57, 95); // Primary color
    doc.setFont('helvetica', 'bold');
    doc.text(`${totalCollected.toLocaleString()} FCFA`, margin + 6, 58);

    // Box 2: Total Transactions
    const box2X = margin + boxWidth + boxGap;
    doc.setFillColor(245, 247, 250);
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(box2X, 40, boxWidth, 25, 3, 3, 'FD');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('NOMBRE DE TRANSACTIONS', box2X + 6, 48);
    
    doc.setFontSize(16);
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'bold');
    doc.text(`${contributions.length}`, box2X + 6, 58);

    // --- Table ---
    doc.setFont('helvetica', 'normal');
    const tableColumn = ["Période", "Nombre de cotisations", "Montant Collecté"];
    const tableRows = monthlyData.map(row => [
      row.name,
      row.count,
      `${row.amount.toLocaleString()} FCFA`
    ]);

    autoTable(doc, {
      startY: 75,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { 
        fillColor: primaryColor,
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10,
        textColor: 50
      },
      // Explicit column widths to prevent overflow
      columnStyles: {
        0: { cellWidth: 80 }, // Period
        1: { cellWidth: 50, halign: 'center' }, // Count
        2: { cellWidth: 'auto', halign: 'right' } // Amount (Takes remaining space)
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { top: 75, left: 14, right: 14 }
    });

    // --- Footer ---
    const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} / ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
        doc.text('Cahier Hainou Nahim - Document interne confidentiel', 14, 290);
    }

    return doc;
  };

  const handlePreviewPDF = () => {
    const doc = generatePDFDocument();
    // Create a Blob URL for preview
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
    setShowPreview(true);
  };

  const handleDownloadPDF = () => {
    const doc = generatePDFDocument();
    doc.save(`Rapport_Hainou_Nahim_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const closePreview = () => {
    setShowPreview(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl); // Clean up memory
      setPdfUrl(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Rapports Mensuels</h2>
        <div className="flex gap-3">
          <button 
            onClick={handlePreviewPDF}
            className="flex items-center px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
          >
            <Eye size={16} className="mr-2" />
            Aperçu
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center px-4 py-2 bg-primary hover:bg-blue-900 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/20"
          >
            <Download size={16} className="mr-2" />
            Télécharger PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-cardbg p-6 rounded-2xl shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-700/50">
           <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Général</p>
           <h3 className="text-2xl font-bold text-primary dark:text-white mt-2">{totalCollected.toLocaleString()} FCFA</h3>
        </div>
        <div className="bg-white dark:bg-cardbg p-6 rounded-2xl shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-700/50">
           <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Mois actifs</p>
           <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-2">{monthlyData.length}</h3>
        </div>
        <div className="bg-white dark:bg-cardbg p-6 rounded-2xl shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-700/50">
           <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Transactions</p>
           <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-2">{contributions.length}</h3>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-cardbg p-6 rounded-2xl shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-700/50">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Évolution mensuelle</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.3} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip 
                formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'Montant']}
                contentStyle={{ backgroundColor: 'var(--tooltip-bg, #1e293b)', borderRadius: '12px', border: '1px solid #475569', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                itemStyle={{ color: '#e2e8f0' }}
                cursor={{fill: '#334155', opacity: 0.1}}
              />
              <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}}/>
              <Bar dataKey="amount" name="Montant Collecté" fill="#13395F" radius={[4, 4, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-cardbg rounded-2xl shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center">
          <FileText size={18} className="text-slate-500 dark:text-slate-400 mr-2" />
          <h3 className="font-bold text-slate-700 dark:text-slate-200">Détails par mois</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mois</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre de cotisations</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Collecté</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-cardbg divide-y divide-slate-100 dark:divide-slate-700/50">
              {monthlyData.length > 0 ? (
                monthlyData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-slate-200">{row.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{row.count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-primary dark:text-blue-400">{row.amount.toLocaleString()} FCFA</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">Aucune donnée disponible.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPreview && pdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center">
                <FileText className="mr-2 text-primary dark:text-blue-400" size={20} />
                Aperçu du Rapport
              </h3>
              <button 
                onClick={closePreview}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 bg-slate-100 dark:bg-slate-900 p-4 overflow-hidden">
              <iframe 
                src={pdfUrl} 
                className="w-full h-full rounded-lg border border-slate-300 dark:border-slate-700 shadow-inner"
                title="PDF Preview"
              />
            </div>
            
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-end space-x-3">
              <button 
                onClick={closePreview}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Fermer
              </button>
              <button 
                onClick={() => {
                  handleDownloadPDF();
                  closePreview();
                }}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-blue-900 text-white font-bold shadow-lg shadow-blue-900/20 flex items-center transition-colors"
              >
                <Download size={18} className="mr-2" />
                Télécharger le fichier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;