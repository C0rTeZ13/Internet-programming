<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ru">
<head>
  <title>Проверка текста</title>
  <meta charset="UTF-8">
  <style>
    .bold {
      font-weight: bold;
    }
  </style>
</head>
<body>
<h1>Проверка текста</h1>
<form>
  <label for="text">Введите текст:</label><br>
  <textarea id="text" name="text" rows="10" cols="100"></textarea><br>
  <button type="button" onclick="checkText()">Проверить</button>
  <input type="reset" value="Очистить">
  <button type="button" class="quit" onclick="quit()">Выйти</button>
</form>
<div id="output"></div>
<script>
  window.onload = function() {
    // Отправить GET-запрос к LoggedInServlet при загрузке страницы
    fetch('loggedIn')
            .then(response => {
              if (response.redirected) {
                // Если сервлет перенаправляет на другую страницу, перейти по указанному URL
                window.location.replace(response.url);
              }
            })
            .catch(error => {
              console.error('Ошибка при отправке GET-запроса к LoggedInServlet:', error);
            });
  };

  function quit() {
    document.cookie = 'login=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'password=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.replace('logout');
  }
  function checkText() {
    const specialWords = ['МИЭТ', 'MIET', 'PHP', 'JavaScript'];
    const text = document.getElementById('text').value;
    const outputDiv = document.getElementById('output');
    const forbiddenWords = ['script', 'http', 'SELECT', 'UNION', 'UPDATE', 'exe', 'exec', 'INSERT', 'tmp'];
    const pattern = new RegExp(forbiddenWords.join('|'), 'gi');

    if (!text) {
      outputDiv.innerText = 'Введите текст';
      return;
    }

    if (pattern.test(text)) {
      outputDiv.innerText = 'Текст содержит запрещенные слова';
      return;
    }

    const lines = text.split('\n');

    let resultHtml = '';
    for (let line of lines) {
      const words = line.split(' ');
      let lineHtml = '';
      for (let word of words) {
        const isSpecial = specialWords.includes(word);
        const isEnglish = /^[a-zA-Z]+$/.test(word);
        const wordHtml = isSpecial ? '<span class="bold">' + word + '</span>' :
                isEnglish ? '<i>' + word + '</i>' :
                        word;
        lineHtml += wordHtml + ' ';
      }
      resultHtml += lineHtml.trim() + '<br>';
    }
    outputDiv.innerHTML = resultHtml;
  }
</script>
</body>
</html>
