const request = require('request');
const htmlparser2 = require('htmlparser2');

// Функция для извлечения ссылок
function extractLinks(html) {
    const links = [];
    let currentLink = {};

    const parser = new htmlparser2.Parser({
        onopentag(name, attributes) {
            if (name === 'a') {
                currentLink = {
                    url: attributes.href || '',
                    title: attributes.title || '',
                    body: ''
                };
            }
        },
        ontext(text) {
            if (currentLink.url) {
                currentLink.body += text;
            }
        },
        onclosetag(name) {
            if (name === 'a' && currentLink.url) {
                links.push(currentLink);
                currentLink = {};
            }
        }
    }, { decodeEntities: true });

    parser.write(html);
    parser.end();

    return links;
}

// Выполняем HTTP-запрос к главной странице miet.ru
request('http://miet.aha.ru/cm', (error, response, body) => {
    if (!error && response.statusCode === 200) {
        // Извлекаем ссылки из полученного HTML
        const links = extractLinks(body);

        // Выводим результат
        links.forEach(link => {
            console.log(`${link.url} →`);
            console.log(`url → ${link.url}`);
            console.log(`title → "${link.title}"`);
            console.log(`body → "${link.body}"`);
            console.log();
        });
    } else {
        console.error('Ошибка при выполнении запроса:', error);
    }
});
