const fs = require('fs');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

function deleteClonedFile(callback) {
    fs.unlink('site_clonado.html', (err) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Erro ao excluir arquivo HTML clonado:', err);
        } else {
            console.log('Arquivo HTML clonado excluído com sucesso.');
        }
        callback();
    });
}
async function cloneSiteAndRemoveTags() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const url = 'https://liturgiadiaria.edicoescnbb.com.br/';
    await page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 10000));
    const html = await page.content();

    fs.writeFile('site_clonado.html', html, (err) => {
        if (err) {
            console.error('Erro ao salvar arquivo HTML clonado:', err);
        } else {
            console.log('Site clonado com sucesso. Conteúdo salvo em "site_clonado.html"');
            const $ = cheerio.load(html);
            $('header').remove();
            $('.sidebar').remove();
            $('.share').remove();
            $('footer').remove();
            $('button').remove();
            $('title').remove();
            $('noscript').remove();
            $('script').remove();
            $('style').remove();
            $('meta').remove();
            $('link').remove();
            $('next-route-announcer').remove();
            $('<title>Liturgia Diária</title>').appendTo('head');
            $('<style>@import url("https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap"); body{font-family: "Libre Baskerville", sans-serif;}.copyright{margin-top: 20px; text-align: center; font-size: 10px; color: #aaa8a8;}</style>').appendTo('head');

            fs.writeFile('index.html', $.html(), (err) => {
                if (err) {
                    console.error('Erro ao salvar arquivo HTML:', err);
                } else {
                    console.log('Tags removidas e novo arquivo HTML gerado com sucesso em "index.html"');
                }
            });
        }
    });
    await browser.close();
}
deleteClonedFile(() => {
    cloneSiteAndRemoveTags();
});