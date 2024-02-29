const fs = require('fs');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

// Função para excluir o arquivo site_clonado.html
function deleteClonedFile(callback) {
    fs.unlink('site_clonado.html', (err) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Erro ao excluir arquivo HTML clonado:', err);
        } else {
            console.log('Arquivo HTML clonado excluído com sucesso.');
        }
        // Chama a função de callback após a exclusão do arquivo
        callback();
    });
}

// Função para clonar o site e remover as tags
async function cloneSiteAndRemoveTags() {
    // Inicia uma instância do navegador
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // URL do site que você deseja clonar
    const url = 'https://liturgiadiaria.edicoescnbb.com.br/';

    // Navega até a página
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Espera 2 segundos para garantir que a página esteja completamente carregada
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Extrai o conteúdo HTML da página
    const html = await page.content();

    // Salva o conteúdo HTML em um arquivo
    fs.writeFile('site_clonado.html', html, (err) => {
        if (err) {
            console.error('Erro ao salvar arquivo HTML clonado:', err);
        } else {
            console.log('Site clonado com sucesso. Conteúdo salvo em "site_clonado.html"');

            // Carrega o HTML usando o cheerio
            const $ = cheerio.load(html);

            // Remove tags por classe ou ID
            $('header').remove();
            $('.sidebar').remove();
            $('.share').remove();
            $('.footer').remove();
            $('.copyright').remove();
            $('button').remove();
            $('<link rel="stylesheet" href="style.css">').appendTo('head');

            // Salva o conteúdo HTML modificado em um novo arquivo
            fs.writeFile('index.html', $.html(), (err) => {
                if (err) {
                    console.error('Erro ao salvar arquivo HTML:', err);
                } else {
                    console.log('Tags removidas e novo arquivo HTML gerado com sucesso em "index.html"');
                }
            });
        }
    });

    // Fecha o navegador
    await browser.close();
}

// Chama a função para excluir o arquivo clonado antes de clonar o site
deleteClonedFile(() => {
    // Chama a função para clonar o site e remover as tags após a exclusão do arquivo
    cloneSiteAndRemoveTags();
});
