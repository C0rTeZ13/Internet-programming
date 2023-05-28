function saveJsonToFile(jsonData, fileName) {
    // Convert JSON to string
    const jsonString = JSON.stringify(jsonData, null, 2);
    // Create a Blob object with the JSON data
    const blob = new Blob([jsonString], {type: 'application/json'});
    // Create a temporary URL for the Blob
    const url = URL.createObjectURL(blob);
    // Create a link element
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    // Programmatically click the link to trigger the download
    link.click();
    // Clean up the temporary URL
    URL.revokeObjectURL(url);
}

window.onload = function() {
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "portfolio.xml", true);
    xmlhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            const xmlDoc = this.responseXML;
            const projects = xmlDoc.getElementsByTagName("project");
            const outputDiv = document.getElementById("output");

            if (projects.length === 0) {
                outputDiv.innerText = "Данные не найдены";
            } else {
                const htmlDocument = document.createElement("html");
                const head = document.createElement("head");
                const title = document.createElement("title");
                title.textContent = "Портфолио";
                head.appendChild(title);
                htmlDocument.appendChild(head);

                const body = document.createElement("body");
                const jsonData = [];
                for (let i = 0; i < projects.length; i++) {
                    const project = projects[i];
                    const projectId = project.getAttribute("id");
                    const projectYear = project.getAttribute("year");
                    const projectTitleElement = project.getElementsByTagName("title")[0];
                    const projectTitle = projectTitleElement ? projectTitleElement.textContent : "не найдено";
                    const projectJsonElement = project.getElementsByTagName("json")[0];
                    const projectJson = projectJsonElement ? projectJsonElement.textContent : "не найдено";

                    const projectDiv = document.createElement("div");
                    projectDiv.innerHTML = `<h2>Проект ${projectId}</h2>
                                  <p>Год проекта: ${projectYear}</p>
                                  <p>Заголовок проекта: ${projectTitle}</p>
                                  <p>JSON файл проекта: <a href="${projectJson}">${projectJson}</a></p>`;

                    body.appendChild(projectDiv);

                    // Add project data to JSON array
                    jsonData.push({
                        project: {
                            attributes: { id: projectId, year: projectYear, },
                            value: {
                                title: projectTitle,
                                jsonFile: projectJson,
                            }
                        }
                    });
                }

                htmlDocument.appendChild(body);
                outputDiv.appendChild(htmlDocument);

                const fileName = 'portfolio.json';

                // Save JSON file
                saveJsonToFile(jsonData, fileName);
            }
        }
    };
    xmlhttp.send();
};
