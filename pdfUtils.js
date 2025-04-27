const puppeteer = require('puppeteer');

async function generatePdf(entregas) {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    // Gerar o HTML para o PDF
    const htmlContent = generatePdfHtml(entregas);
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    return pdfBuffer;
}

function generatePdfHtml(entregas) {
    let html = `
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <title>Lista de Entregas</title>
             <style>
                body {
                    font-family: 'Inter', sans-serif;
                    margin: 0;
                    padding: 0;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f0f0f0;
                }
                h1 {
                    text-align: center;
                    color: #003366;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <h1>Lista de Entregas</h1>
            <table>
                <thead>
                    <tr>
                        <th>Destinatário</th>
                        <th>Endereço</th>
                        <th>Produto</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
    `;
    entregas.forEach(entrega => {
        html += `
            <tr>
                <td>${entrega.destinatario}</td>
                <td>${entrega.endereco}</td>
                <td>${entrega.produto}</td>
                <td>${entrega.status}</td>
            </tr>
        `;
    });
    html += `
                </tbody>
            </table>
        </body>
        </html>
    `;
    return html;
}

module.exports = { generatePdf };
