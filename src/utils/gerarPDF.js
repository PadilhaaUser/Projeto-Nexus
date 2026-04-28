import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getProdutos } from '../services/estoque';

const PRIMARY_COLOR   = [9, 9, 11];     // #09090b
const SECONDARY_COLOR = [82, 82, 91];   // #52525b
const LIGHT_GRAY      = [244, 244, 245]; // #f4f4f5

// Converte URL de imagem para base64 para uso no jsPDF
const imageToBase64 = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror  = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

// ─── Gera PDF do Orçamento ─────────────────────────────────────────────────
export const gerarOrcamentoPDF = async (orcamento) => {
  try {
    const doc = new jsPDF();
    const logoBase64 = null; // sem logo de imagem

    // ── Cabeçalho verde ──
    doc.setFillColor(...PRIMARY_COLOR);
    doc.rect(0, 0, 210, 36, 'F');

    // Faixa de brilho sutil
    doc.setFillColor(255, 255, 255);
    doc.setGState(new doc.GState({ opacity: 0.04 }));
    doc.rect(0, 0, 210, 18, 'F');
    doc.setGState(new doc.GState({ opacity: 1 }));

    // Logo (se disponível, usa imagem; caso contrário, usa texto)
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 12, 6, 0, 22); // auto-width, height 22
    } else {
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('NEXUS', 14, 23);
    }

    // Número e data (direita)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`ORÇAMENTO Nº ${orcamento.numero}`, 196, 16, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Data: ${new Date(orcamento.createdAt).toLocaleDateString('pt-BR')}`, 196, 23, { align: 'right' });
    doc.text(`Status: ${orcamento.status}`, 196, 29, { align: 'right' });

    // ── Faixa de informações da empresa ──
    doc.setFillColor(...SECONDARY_COLOR);
    doc.rect(0, 36, 210, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('contato@nexus.com.br  ·  (41) 98772-5786  ·  nexus.com.br', 105, 41.5, { align: 'center' });

    // ── Seção Cliente ──
    doc.setFillColor(...LIGHT_GRAY);
    doc.rect(10, 50, 190, 30, 'F');
    doc.setDrawColor(...SECONDARY_COLOR);
    doc.setLineWidth(0.5);
    doc.rect(10, 50, 190, 30, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text('DADOS DO CLIENTE', 14, 57);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(9);
    doc.text(`Nome: ${orcamento.clienteNome}`, 14, 64);
    if (orcamento.clienteDocumento) doc.text(`CPF/CNPJ: ${orcamento.clienteDocumento}`, 120, 64);
    if (orcamento.clienteTelefone) doc.text(`Tel: ${orcamento.clienteTelefone}`, 14, 72);
    if (orcamento.clienteNomeProjeto) doc.text(`Projeto: ${orcamento.clienteNomeProjeto}`, 120, 72);

    // ── Obter categorias para itens que não possuem ──
    const produtos = await getProdutos();
    const itensComCategoria = orcamento.itens.map(item => {
      if (!item.categoria || item.categoria === 'Sem categoria') {
        const p = produtos.find(prod => prod.id === item.produtoId);
        return { ...item, categoria: p && p.categoria ? p.categoria : 'Outros' };
      }
      return item;
    });

    // ── Preload de Imagens dos Itens ──
    const imageCache = {};
    for (const item of itensComCategoria) {
      if (item.imageUrl && !imageCache[item.imageUrl]) {
        const base64 = await imageToBase64(item.imageUrl);
        imageCache[item.imageUrl] = base64;
      }
    }

    // ── Agrupar Itens por Categoria ──
    const categoriasMap = {};
    for (const item of itensComCategoria) {
      const catGroup = item.categoria.split(',')[0].trim();
      if (!categoriasMap[catGroup]) categoriasMap[catGroup] = [];
      categoriasMap[catGroup].push(item);
    }

    let currentY = 88;

    // Configuração base da tabela
    const getTableOptions = (itensData, imageCacheObj) => ({
      startY: currentY,
      head: [['IMG', 'QTD', 'PRODUTO / SERVIÇO', 'UNIT. (R$)', 'TOTAL (R$)']],
      body: itensData.map((item) => [
        '',
        item.quantidade.toString(),
        item.nome,
        item.precoUnitario.toFixed(2),
        (item.quantidade * item.precoUnitario).toFixed(2),
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: SECONDARY_COLOR,
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 4,
      },
      styles: { fontSize: 9, cellPadding: 3.5, minCellHeight: 14, valign: 'middle' },
      alternateRowStyles: { fillColor: [250, 252, 245] },
      columnStyles: {
        0: { cellWidth: 14, halign: 'center' },
        1: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 28, halign: 'right' },
        4: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 0) {
          const item = itensData[data.row.index];
          const img = imageCacheObj[item.imageUrl];
          if (img) {
            const dim = 10;
            const x = data.cell.x + (data.cell.width - dim) / 2;
            const y = data.cell.y + (data.cell.height - dim) / 2;
            let format = 'JPEG';
            if (img.startsWith('data:image/png')) format = 'PNG';
            else if (img.startsWith('data:image/webp')) format = 'WEBP';
            try {
              doc.addImage(img, format, x, y, dim, dim);
            } catch (e) {
              doc.text('-', data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 3, { align: 'center' });
            }
          } else {
            doc.text('-', data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 3, { align: 'center' });
          }
        }
      }
    });

    // ── Tabelas por Categoria ──
    for (const [cat, itens] of Object.entries(categoriasMap)) {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...PRIMARY_COLOR);
      doc.text(cat.toUpperCase(), 14, currentY);
      currentY += 4;
      autoTable(doc, getTableOptions(itens, imageCache));
      
      currentY = doc.lastAutoTable.finalY + 6;
      
      // Subtotal da categoria
      const subtotalCat = itens.reduce((acc, i) => acc + (i.quantidade * i.precoUnitario), 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text(`Subtotal ${cat}: R$ ${subtotalCat.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 198, currentY, { align: 'right' });
      
      currentY += 12;
    }

    // ── Observações ──
    if (orcamento.observacoes) {
      if (currentY > 230) {
         doc.addPage();
         currentY = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...PRIMARY_COLOR);
      doc.text('OBSERVAÇÕES:', 14, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(80, 80, 80);
      const splitObs = doc.splitTextToSize(orcamento.observacoes, 182);
      doc.text(splitObs, 14, currentY + 7);
      currentY += 10 + (splitObs.length * 4);
    }

    // ── Garantir que Assinatura e Total fiquem bem posicionados ──
    // Considera o espaço para o box do Total e a margem para a assinatura no fundo
    if (currentY > 225) {
       doc.addPage();
       currentY = 20;
    }

    // ── Total ──
    doc.setFillColor(...PRIMARY_COLOR);
    doc.rect(130, currentY, 70, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `TOTAL: R$ ${orcamento.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      198, currentY + 9.5, { align: 'right' }
    );

    // ── Assinatura (Sempre no fim da página atual) ──
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.line(35, 252, 175, 252);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Assinatura e Carimbo do Cliente', 105, 257, { align: 'center' });
    doc.text(`Local: ________________  Data: ___/___/______`, 105, 264, { align: 'center' });

    // ── Rodapé ──
    doc.setFillColor(...PRIMARY_COLOR);
    doc.rect(0, 280, 210, 17, 'F');
    doc.setFillColor(...SECONDARY_COLOR);
    doc.rect(0, 280, 210, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Nexus — Sistema de Gestão Interno', 105, 289, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(200, 210, 180);
    doc.text('Documento gerado eletronicamente — Este documento não tem valor fiscal.', 105, 294, { align: 'center' });

    doc.save(`orcamento_${orcamento.numero}_${orcamento.clienteNome.replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error('Erro ao gerar PDF do orçamento:', error);
    alert('Erro ao gerar o PDF. Tente novamente.');
  }
};

// ─── Gera PDF do Relatório Mensal ─────────────────────────────────────────
export const gerarRelatorioPDF = async ({ mes, ano, MESES, orcamentosMes, orcamentosConfirmados, orcamentosCancelados, valorTotalConfirmado, movimentacoes }) => {
  try {
    const doc = new jsPDF();
    const logoBase64 = null; // sem logo

    // ── Cabeçalho ──
    doc.setFillColor(...PRIMARY_COLOR);
    doc.rect(0, 0, 210, 36, 'F');

    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 12, 6, 0, 22);
    } else {
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('NEXUS', 14, 23);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO MENSAL', 196, 16, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Período: ${MESES[Number(mes)]} / ${ano}`, 196, 24, { align: 'right' });
    doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, 196, 30, { align: 'right' });

    // Faixa accent
    doc.setFillColor(...SECONDARY_COLOR);
    doc.rect(0, 36, 210, 5, 'F');

    // ── Resumo ──
    doc.setTextColor(...PRIMARY_COLOR);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO DE ORÇAMENTOS', 14, 54);

    autoTable(doc, {
      startY: 58,
      head: [['Métrica', 'Valor']],
      body: [
        ['Total Gerados',    String(orcamentosMes.length)],
        ['Confirmados',      String(orcamentosConfirmados.length)],
        ['Cancelados',       String(orcamentosCancelados.length)],
        ['Valor Confirmado', `R$ ${valorTotalConfirmado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: SECONDARY_COLOR, textColor: 255, fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 9, cellPadding: 4 },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    });

    const finalYOrc = (doc.lastAutoTable?.finalY || 100) + 14;

    // ── Movimentações ──
    doc.setTextColor(...PRIMARY_COLOR);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SAÍDAS DE ESTOQUE CONFIRMADAS', 14, finalYOrc);

    const movData = movimentacoes.map((m) => [
      new Date(m.data).toLocaleDateString('pt-BR'),
      m.produtoNome || '—',
      String(m.quantidade),
      m.origem || '—',
    ]);

    autoTable(doc, {
      startY: finalYOrc + 5,
      head: [['Data', 'Produto', 'Qtd', 'Origem']],
      body: movData.length > 0 ? movData : [['—', '—', '—', 'Nenhuma movimentação']],
      theme: 'striped',
      headStyles: { fillColor: PRIMARY_COLOR, textColor: 255, fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 8.5, cellPadding: 3 },
      alternateRowStyles: { fillColor: [250, 252, 245] },
    });

    // ── Rodapé ──
    doc.setFillColor(...PRIMARY_COLOR);
    doc.rect(0, 280, 210, 17, 'F');
    doc.setFillColor(...SECONDARY_COLOR);
    doc.rect(0, 280, 210, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Nexus — Sistema de Gestão Interno', 105, 289, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(200, 210, 180);
    doc.text(`Relatório gerado em ${new Date().toLocaleString('pt-BR')}`, 105, 294, { align: 'center' });

    doc.save(`relatorio_${ano}_${String(Number(mes) + 1).padStart(2, '0')}.pdf`);
  } catch (error) {
    console.error('Erro ao gerar PDF do relatório:', error);
    alert('Erro ao gerar o PDF. Verifique o console para mais detalhes.');
  }
};
