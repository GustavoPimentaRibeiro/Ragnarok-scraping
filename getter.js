const puppeteer = require('puppeteer-extra'); // Importa o puppeteer
const fs = require('fs'); // Para gravar em arquivo os dados

const monster_id = new Array(1002, 1014, 1025, 1184, 2057, 2245); // ID's dos monstros a serem pesquisados
let base_url = "https://www.divine-pride.net/database/monster/";

(async () =>{
    // Abre o navegador, abre uma nova guia e entra no site
    const browser = await puppeteer.launch({headless: true}); // Para ver todo o processo visual, coloque 'headless: false'
    const page = await browser.newPage();
    let infos = new Array(); // Array para armazenar as informações e gravar no json

    for (var i = 0; i < monster_id.length; i++) {
        let modified_url = base_url + String(monster_id[i]);
        await page.goto(modified_url);

        // Pega os elementos da página
        let info = await page.evaluate(() => {
            let data_monster_info = [];
            let table_monster_info = document.getElementsByTagName('table')[0];

            // Para pegar as informações do monstro da tabela e armazenar em 'data'
            for (var i = 1; i <= 2; i++) {
                var objCells = table_monster_info.rows.item(i).cells;
                var values = [];
                if(i == 1) {
                    for (var j = 1; j <= 1; j++) {
                        var text = objCells.item(j).innerHTML;
                        text = text.split('<strong>')[1].split('</strong>')[0];
                        values.push(text);
                    }
                } else {
                    for (var j = 0; j < objCells.length; j++) {
                        var text = objCells.item(j).innerHTML;
                        text = text.split('<span>')[1].split('</span>')[0];
                        values.push(text);
                    }
                }
                data_monster_info.push(values);
            }

            // Para pegar a tabela de danos que o monstro toma e armazenar em 'table_damages'
            var table_damages = document.getElementsByTagName('table')[4].innerText;
            table_damages = table_damages.split('\n');
            for(var i = 0; i < table_damages.length; i ++) {
                table_damages[i] = table_damages[i].replace('\t', '  ');
            }

            // Retorno do objeto contendo todos os dados pegos no Divine Pride
            return {
                monster_id: 1,
                monster_name: document.querySelector('legend.entry-title').innerHTML,
                monster_level: data_monster_info[0][0],
                monster_type: data_monster_info[1][0],
                monster_size: data_monster_info[1][1],
                monster_element: data_monster_info[1][2],
                damages_taken: table_damages
            }
        })
        let str = info['monster_name'].split('\n             ')[1].split('\n')[0];
        info['monster_name'] = str;
        info['monster_id'] = monster_id[i];
        infos.push(info);
        console.log(modified_url);
    }

    // Escreve os resultados das infos em um JSON
    fs.writeFile('dados.json', JSON.stringify(infos, null, 2), err => {
        if(err) throw new Error('Deu ruim!')
        console.log('Deu bom!');
    });

    // Fecha o browser
    await browser.close();
})();