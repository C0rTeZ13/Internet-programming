/* Загружаем модули, создаем объекты */
const express = require('express'); //модуль, для создания http-сервера
const multer = require('multer'); // модуль для работы с файлами
const fs = require("fs"); //модуль для работы с файлами
const createError = require('http-errors'); //модуль для формирования сообщений об ошибках
const jsonParser = express.json(); // создаем парсер для данных в формате json
const ajv = require('ajv'); //модуль для проверки JSON данных на основе JSON схемы
const eajv = new ajv();
const debug = false; //Режим отладки, когда отправляется стек устанавливаем в false
//Запускаем сервер по адресу http://localhost:8081/
const app = express();
const server = app.listen(8081, function () {
    const host = "localhost";
    server.address().address = host;
    const port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port)
});
//Обработка GET/getMailList
app.get('/getMailList', function (req, res) {
    let Result;
    console.log(req.query);
    let action = req.query.action;
    switch(action) {
        case 'filter':
            console.log(req.query.filter);
            Result = makeFilter(req.query.filter);
            break;
        default:
            Result = getAllDate();
            break;
    }
    res.end(makeHTML(Result));
})
//Обработка POST запроса с добавлением файла
const upload = multer({ dest: 'uploads/' });

app.post('/addMail', upload.array('files'), (req, res) => {
    const { datatime, subject, from, message } = req.body;
    const files = req.files;

    // Создание нового письма с данными из запроса
    const newMail = {
        datatime,
        subject,
        from,
        message,
        files: []
    };
    if (files) {
        files.forEach(file => {
            const filePath = `/uploads/${file.filename}`;
            // Добавление информации о файле в массив "files" нового письма
            newMail.files.push({
                filename: file.filename,
                originalname: file.originalname,
                mimetype: file.mimetype,
                path: filePath
            });
        });
        // Обновление базы данных maillist.json
        addNewMailToDB(newMail);

        res.status(200).json({ message: 'Письмо успешно добавлено с вложением файла.' });
    } else {
        // Обновление базы данных maillist.json
        addNewMailToDB(newMail);

        res.status(200).json({ message: 'Письмо успешно добавлено без вложений.' });
    }
});
// curl -X POST -H "Content-Type: multipart/form-data" -F "datatime=07.05.2023 23:15:15" -F "subject=TestFile" -F "from=example@gmail.com" -F "message=file" -F "file=@C:\Install\МИЭТ\Семестр 4\Интернет программирование\Лаб6\MIET(OrioksStyle).png" http://localhost:8081/addMail?action=add

//Обработка GET запроса
app.get('/addMail', function(req, res) {
//Получаем JSON с данными письма
    let Result = "<hr>"+JSON.stringify(req.query)+"<hr>"+req.body
    console.log(req.query);
    console.log(req.body);
    res.end(makeHTML("<b>GET Success</b>"+Result));
});
//Обработка PUT/addMail запроса
app.put('/addMail', jsonParser, function(req, res) {
    let increment;
    try {
        increment = addNewMailToDB(req.body);
        let Result = "id:mail_" + increment + "<hr>" + JSON.stringify(req.query) + "<hr>" + JSON.stringify(req.body);
        console.log(req.query);
        console.log(req.body);
        res.end(makeHTML("<b>PUT Success</b>" + Result));
    } catch (e) {
        sendErr(e);
    }
});
//Метод добавляет новое письмо в БД
function addNewMailToDB(mail) {
    try {
//Проверяем входные данные
        const valid = eajv.validate(JSON.parse(fs.readFileSync(__dirname + '/mailSchema.json', "utf8")), mail);
        if (!valid) { throw new createError(500, `Error validation input data`); }

//Добавляем запись в БД
        let mailList = JSON.parse(getAllDate());
        let increment = mailList.header.increment+1;
        mailList.body["mail_"+increment] = mail;
        mailList.header.increment = increment;
        saveAllDate(JSON.stringify(mailList, null, 4));
        return increment;
    } catch(e) {
        throw e;
    }
}
//Метод создает HTML с ответом
function makeHTML(data) {
    return '<html lang=""><head><meta charset="utf-8"><title></title></head><body>' + data + '</body></html>';
}
//Выполнение фильтрации по subject
function makeFilter(param) {
    let Result = "makeFilter";
    let filter = JSON.parse(param);
    let data = JSON.parse(getAllDate());
    data = data.body;
//Поиск по названию
    if( filter.subject !== undefined ) {
        for (let key in data) {
            console.log(data[key].subject+" "+filter.subject);
            let temp = data[key].subject;
            if( temp.indexOf(filter.subject) >= 0 ) {
                Result += JSON.stringify(data[key]);
            }
        }
    }
    return Result;
}
//Метод загружает данные из БД
function getAllDate() {
    let Result;
    try {
        Result = fs.readFileSync(__dirname+'/maillist.json', "utf8");
        return Result;
    } catch (e) {
        sendErr(e, `Error BD access`);
    }
}
//Метод сохраняет данные в БД
function saveAllDate(data) {
    fs.writeFile(__dirname+'/maillist.json', data, function(error){
        if(error) sendErr(e, `Error BD access`); // если возникла ошибка
    });
    return true;
}
//Метод канализирует обработку и отправку ошибок
function sendErr(e, msg, code) {
    if( !debug && e.stack !== undefined ) e.stack = ''; //если не режим отладки - очищаем информацию о стеке
    if( msg !== undefined ) e.message = msg;
    if( code !== undefined ) e.code = code;
    throw createError(e.code, e);
}
// curl -X PUT -H "Content-Type: application/json" -d "{\"datatime\":\"22.05.2023 13:01:02\",\"subject\":\"Mail\",\"from\":\"example@gmail.com\",\"message\":\"Test1\"}" http://localhost:8081/addMail?action=add

// Обработка DELETE/deleteMail/:id запроса
app.delete('/deleteMail/:id', function(req, res) {
    try {
        const mailId = req.params.id;
        const deletedMail = deleteMailFromDB(mailId);
        if (deletedMail) {
            res.end(makeHTML("<b>DELETE Success</b> Mail deleted: " + mailId));
        } else {
            res.status(404).end(makeHTML("<b>DELETE Error</b> Mail not found: " + mailId));
        }
    } catch (e) {
        sendErr(e);
    }
});

// Метод удаляет письмо из БД по его идентификатору
function deleteMailFromDB(mailId) {
    try {
        let mailList = JSON.parse(getAllDate());
        const mailExists = mailList.body.hasOwnProperty(mailId);
        if (mailExists) {
            delete mailList.body[mailId];
            saveAllDate(JSON.stringify(mailList, null, 4));
            return true;
        } else {
            return false;
        }
    } catch(e) {
        throw e;
    }
}
// curl -X DELETE http://localhost:8081/deleteMail/{mail_4}

// Обработка POST запроса для добавления писем
app.post('/addMails', jsonParser, function(req, res) {
    try {
        const mails = req.body; // Получаем список писем из тела запроса
        const addedMails = addMailsToDB(mails); // Добавляем письма в базу данных
        res.json(addedMails); // Отправляем ответ в формате JSON с добавленными письмами
    } catch (error) {
        res.status(500).json({ error: 'Failed to add mails' }); // Обрабатываем ошибку при добавлении писем
    }
});
// Обработка POST запроса для добавления нескольких писем
app.post('/addMails', jsonParser, function(req, res) {
    try {
        const mails = JSON.parse(req.query.mails);
        const addedMails = addMailsToDB(mails);
        res.json(addedMails);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add mails' });
    }
});
// Обработка PUT запроса для добавления писем
app.put('/addMails', jsonParser, function(req, res) {
    try {
        const mails = req.body; // Получаем список писем из тела запроса
        const addedMails = addMailsToDB(mails); // Добавляем письма в базу данных
        res.json(addedMails); // Отправляем ответ в формате JSON с добавленными письмами
    } catch (error) {
        res.status(500).json({ error: 'Failed to add mails' }); // Обрабатываем ошибку при добавлении писем
    }
});

// Метод добавления писем в БД
function addMailsToDB(mails) {
    try {
        const mailList = JSON.parse(getAllDate()); // Получаем текущий список писем из БД
        let increment = mailList.header.increment + 1;

        // Добавляем каждое письмо в список
        for (const mail of mails) {
            const valid = eajv.validate(JSON.parse(fs.readFileSync(__dirname + '/mailSchema.json', 'utf8')), mail);
            if (!valid) {
                throw new Error('Invalid mail data');
            }

            mailList.body['mail_' + increment] = mail;
            increment++;
        }

        mailList.header.increment = increment;
        saveAllDate(JSON.stringify(mailList, null, 4)); // Сохраняем обновленный список писем в БД

        return mails; // Возвращаем добавленные письма
    } catch (error) {
        throw error;
    }
}
// Пример PUT запроса в cmd
// curl -X POST -H "Content-Type: application/json" -d "[{\"datatime\":\"22.05.2023 13:01:02\",\"subject\":\"Mail\",\"from\":\"example@gmail.com\",\"message\":\"Test1\"},{\"datatime\":\"22.05.2023 13:01:02\",\"subject\":\"Mail\",\"from\":\"example@gmail.com\",\"message\":\"Test1\"}]" http://localhost:8081/addMails
// Пример POST запроса в адресную строку
/*
fetch("http://localhost:8081/addMails?action=add", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify([
    {
      "datatime": "22.05.2023 13:01:02",
      "subject": "Письмо 1",
      "from": "example1@gmail.com",
      "message": "Тестовое сообщение 1"
    },
    {
      "datatime": "23.05.2023 14:02:03",
      "subject": "Письмо 2",
      "from": "example2@gmail.com",
      "message": "Тестовое сообщение 2"
    }
  ])
});
 */
// Пример GET запроса в адресную строку
// http://localhost:8081/addMails?action=add&mails=[{"datatime": "22.05.2023 13:01:02","subject": "Письмо 1","from": "example1@gmail.com","message": "Тестовое сообщение 1"},{"datatime": "23.05.2023 14:02:03","subject": "Письмо 2","from": "example2@gmail.com","message": "Тестовое сообщение 2"}]