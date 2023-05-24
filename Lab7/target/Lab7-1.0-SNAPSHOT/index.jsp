<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Регистрация</title>
</head>
<body>
<div class="container">
    <h1>Форма регистрации</h1>
    <form>
        <label for="login"></label><input id="login" name="login" placeholder="Логин" class="form-control"><br>
        <label for="password"></label><input type="password" id="password" name="password" placeholder="Пароль" class="form-control"><br>
        <button type="submit" id="register" class="btn btn-outline-success">Регистрация</button>
    </form>
    <div id="errorMess" class="text-danger"></div>
    <label>Уже зарегистрированы?</label><a href="login.jsp">Войти</a>
</div>
<script
        src="https://code.jquery.com/jquery-3.6.0.min.js"
        integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4="
        crossorigin="anonymous">
</script>
<script>
    $(".btn-outline-success").click(function(e) {
        e.preventDefault();
        let login = $("#login").val().trim();
        let password = $("#password").val().trim();
        if(login === ""){
            $("#errorMess").text("Введите логин");
            return false;
        } else if(password === ""){
            $("#errorMess").text("Введите пароль");
            return false;
        }

        $.ajax({
            type: 'POST',
            url: 'checkReg',
            dataType: 'json',
            data: {
                login: login,
                password: password,
            },
            success: function(data){
                if(data.exists === true){
                    $("#errorMess").text("Пользователь существует");
                } else {
                    document.location.replace("login.jsp");
                }
            },
        });

        $("#login").removeClass("text-danger");
        $("#errorMess").text("");

    });
</script>
</body>
</html>
