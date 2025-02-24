const fs = require('fs').promises;
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const CONFIG = {
    url: 'https://liturgiadiaria.edicoescnbb.com.br/',
    files: {
        temp: 'site_clonado.html',
        output: 'index.html'
    },
    waitTime: 10000,
    style: `
        @import url("https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap");
        body {
            font-family: "Libre Baskerville", sans-serif;
        }
        .copyright {
            margin-top: 20px;
            text-align: center;
            font-size: 10px;
            color: #aaa8a8;
        }
    `
};

const elementsToRemove = [
    'header', '.sidebar', '.share', 'footer', 'button',
    'title', 'noscript', 'script', 'style', 'meta',
    'link', 'next-route-announcer'
];

async function deleteTempFile() {
    try {
        await fs.unlink(CONFIG.files.temp);
        console.log('Arquivo temporário excluído com sucesso.');
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error('Erro ao excluir arquivo temporário:', error);
        }
    }
}

async function extractPageContent() {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Corrige o problema do GitHub Actions
    });
    try {
        const page = await browser.newPage();
        await page.goto(CONFIG.url, { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, CONFIG.waitTime));
        return await page.content();
    } finally {
        await browser.close();
    }
}

function processHTML(html) {
    const $ = cheerio.load(html);
    
    // Remove elementos desnecessários
    elementsToRemove.forEach(selector => $(selector).remove());
    
    // Adiciona novos elementos
    $('head').append('<title>Liturgia Diária</title>');
    $('head').append(`<style>${CONFIG.style}</style>`);
    
    return $.html();
}

async function saveFile(content, filepath) {
    try {
        await fs.writeFile(filepath, content);
        console.log(`Arquivo salvo com sucesso em "${filepath}"`);
    } catch (error) {
        console.error(`Erro ao salvar arquivo em "${filepath}":`, error);
        throw error;
    }
}

async function main() {
    try {
        await deleteTempFile();
        
        const html = await extractPageContent();
        await saveFile(html, CONFIG.files.temp);
        
        const processedHTML = processHTML(html);
        await saveFile(processedHTML, CONFIG.files.output);
        
        console.log('Processo concluído com sucesso!');
    } catch (error) {
        console.error('Erro durante a execução:', error);
        process.exit(1);
    }
}

main();
