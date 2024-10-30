const exchangeRates = {
    JPY: 26.76,
    GBP: 0.16,
    CLP: 178.25
};

let currentCurrency = 'BRL';
let previousValues = [0, 0, 0, 0];
let baseValuesInBRL = [0, 0, 0, 0]; 

// Definir a moeda base com base na página
let pageCurrency = document.body.getAttribute('data-currency') || 'JPY'; // Exemplo: 'JPY', 'GBP', 'CLP'

const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Restaurantes', 'Turismo', 'Atrações', 'Compras'],
        datasets: [{
            label: 'R$',
            data: [0, 0, 0, 0],
            backgroundColor: [
                '#005B99',
                '#0083CC',
                '#00BFFF',
                '#7B68EE'
            ],
            borderColor: [
                '#005B99',
                '#0083CC',
                '#00BFFF',
                '#7B68EE'
            ],
            borderWidth: 1.7
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: 'white'
                }
            },
            x: {
                ticks: {
                    color: 'white'
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: 'white'
                }
            }
        }
    }
});

function formatCurrency(value) {
    if (currentCurrency === 'BRL') {
        return 'R$' + value.toFixed(2);
    } else if (currentCurrency === 'JPY') {
        return '¥' + value.toFixed(0);
    } else if (currentCurrency === 'GBP') {
        return '£' + value.toFixed(2);
    } else if (currentCurrency === 'CLP') {
        return 'CLP$' + value.toFixed(0);
    }
}

function updateDisplayedValues(values) {
    document.getElementById('restaurants-value').textContent = formatCurrency(values[0]);
    document.getElementById('tourism-value').textContent = formatCurrency(values[1]);
    document.getElementById('attractions-value').textContent = formatCurrency(values[2]);
    document.getElementById('shopping-value').textContent = formatCurrency(values[3]);
}

// Função para gerar distribuição aleatória de valores
function generateRandomDistribution(totalValue) {
    let randomValues = [];
    let sum = 0;

    for (let i = 0; i < 4; i++) {
        let randomValue = Math.random();
        randomValues.push(randomValue);
        sum += randomValue;
    }

    return randomValues.map(v => (v / sum) * totalValue); // Ajuste para somar ao valor total
}

function updateChart() {
    const budgetInput = document.getElementById('budget');
    const value = parseFloat(budgetInput.value);

    if (!isNaN(value)) {
        baseValuesInBRL = generateRandomDistribution(value); // Gera distribuição aleatória
        myChart.data.datasets[0].data = baseValuesInBRL.slice(); // Atualiza o gráfico
        previousValues = baseValuesInBRL.slice(); // Mantém referência dos valores iniciais
        updateCurrencyConversion(); // Aplica a conversão para a moeda atual
    }
}

// Função para alternar entre moedas sem interferir nos dados de valor original
function updateCurrencyConversion() {
    const exchangeRate = exchangeRates[currentCurrency] || 1;
    const convertedValues = baseValuesInBRL.map(v => v * (currentCurrency === 'BRL' ? 1 : exchangeRate));
    myChart.data.datasets[0].data = convertedValues;
    updateDisplayedValues(convertedValues);
    myChart.update();
}

function moveValue(index) {
    const currentData = myChart.data.datasets[0].data;
    const exchangeRate = exchangeRates[currentCurrency] || 1;
    let currentValue = currentData[index] / (currentCurrency === 'BRL' ? 1 : exchangeRate);

    if (currentValue > 0) {
        const valueToTransfer = currentValue;
        const valuePerOptionInBRL = valueToTransfer / 3;

        currentData[index] = 0;
        for (let i = 0; i < currentData.length; i++) {
            if (i !== index) {
                currentData[i] += valuePerOptionInBRL * (currentCurrency === 'BRL' ? 1 : exchangeRate);
            }
        }
        previousValues[index] = valueToTransfer;
    } else {
        const totalRemovedInBRL = previousValues[index];
        const valuePerOptionInBRL = totalRemovedInBRL / 3;

        currentData[index] = totalRemovedInBRL * (currentCurrency === 'BRL' ? 1 : exchangeRate);
        for (let i = 0; i < currentData.length; i++) {
            if (i !== index) {
                currentData[i] -= valuePerOptionInBRL * (currentCurrency === 'BRL' ? 1 : exchangeRate);
            }
        }
        previousValues[index] = 0;
    }
    myChart.update();
    updateDisplayedValues(currentData);
}

document.getElementById('toggle-currency').addEventListener('click', (event) => {
    currentCurrency = currentCurrency === 'BRL' ? pageCurrency : 'BRL';
    event.target.innerText = currentCurrency === 'BRL' ? 'Alternar para ' + (pageCurrency === 'JPY' ? '¥' : (pageCurrency === 'GBP' ? '£' : 'CLP$')) : 'Alternar para R$';
    updateCurrencyConversion(); // Atualiza valores convertidos sem alterar distribuição
});

document.getElementById('budget-form').addEventListener('submit', function(event) {
    event.preventDefault();
    updateChart();
    document.getElementById('info-section').classList.remove('hidden');
    carregarRestaurantes();
    carregarTurismo();
    carregarAtracoes();
    carregarCompras();
});


function getRestaurantImage(name) {
    switch(name.toLowerCase()) {
        case 'sushi zanmai':
            return 'imagens/Zanmai.jpg';
        case 'ichiran ramen':
            return 'imagens/Ichiran.jpg';
        case 'narisawa':
            return 'imagens/Narisawa.jpg';
        default:
            return 'imagens/default.jpg'; // Imagem padrão se o nome não corresponder
    }
}

function carregarRestaurantes() {
    fetch('http://localhost:3000/dados-restaurantes')
        .then(response => response.json())
        .then(data => {
            const restaurantsContainer = document.getElementById('restaurants-container');
            restaurantsContainer.innerHTML = '';

            // Usar um Set para verificar duplicatas
            const addedRestaurants = new Set();

            data.forEach(restaurant => {
                if (!addedRestaurants.has(restaurant.name.toLowerCase())) {
                    addedRestaurants.add(restaurant.name.toLowerCase());

                    const div = document.createElement('div');
                    div.className = 'restaurant-item category-item';

                    const nameLink = document.createElement('a');
                    nameLink.textContent = restaurant.name;
                    nameLink.href = getRestaurantLink(restaurant.name); // Usar a função para obter o link correto
                    nameLink.className = 'restaurant-link';
                    nameLink.style.fontSize = '1.2em'; // Para diferenciar do restante

                    const img = document.createElement('img');
                    img.src = getRestaurantImage(restaurant.name); // Usar a função para obter a imagem correta

                    const description = document.createElement('p');
                    description.textContent = `${restaurant.description}`;

                    const address = document.createElement('p');
                    address.textContent = `Endereço: ${restaurant.address}`;

                    const recommendedDish = document.createElement('p');
                    recommendedDish.textContent = `Prato recomendado: ${restaurant.recommended_dish}`;

                    div.appendChild(nameLink);
                    div.appendChild(img);
                    div.appendChild(description);
                    div.appendChild(address);
                    div.appendChild(recommendedDish);

                    const separator = document.createElement('hr');
                    div.appendChild(separator);

                    restaurantsContainer.appendChild(div);
                }
            });
        })
        .catch(error => {
            console.error('Erro ao carregar os dados dos restaurantes:', error);
        });
}

function getRestaurantLink(name) {
    switch (name.toLowerCase()) {
        case 'ichiran ramen':
            return 'https://www.ichiran.com';
        case 'sushi zanmai':
            return 'https://supersushi.com.my/setiacity.php';
        case 'narisawa':
            return 'https://guide.michelin.com/en/tokyo-region/tokyo/restaurant/narisawa';
        default:
            return '#'
    }
}

function getTourismImage(name) {
    switch(name.toLowerCase()) {
        case 'senso-ji':
            return 'imagens/Sensoji.jpg';
        case 'tokyo tower':
            return 'imagens/TokyoTower.jpg';
        case 'meiji jingu':
            return 'imagens/MeijiJingu.jpg';
        default:
            return 'imagens/default.jpg'; // Imagem padrão se o nome não corresponder
    }
}

function carregarTurismo() {
    fetch('http://localhost:3000/dados-turismo')
        .then(response => response.json())
        .then(data => {
            const tourismContainer = document.getElementById('tourism-container');
            tourismContainer.innerHTML = '';

            // Usar um Set para verificar duplicatas
            const addedTourism = new Set();

            data.forEach(tourism => {
                if (!addedTourism.has(tourism.name.toLowerCase())) {
                    addedTourism.add(tourism.name.toLowerCase());

                    const div = document.createElement('div');
                    div.className = 'tourism-item category-item';

                    const nameLink = document.createElement('a');
                    nameLink.textContent = tourism.name;
                    nameLink.href = getTourismLink(tourism.name); // Usar a função para obter o link correto
                    nameLink.className = 'tourism-link';
                    nameLink.style.fontSize = '1.2em'; // Para diferenciar do restante

                    const img = document.createElement('img');
                    img.src = getTourismImage(tourism.name); // Usar a função para obter a imagem correta

                    const description = document.createElement('p');
                    description.textContent = `${tourism.description}`;

                    const address = document.createElement('p');
                    address.textContent = `Endereço: ${tourism.address}`;

                    const thingsToDo = document.createElement('p');
                    thingsToDo.textContent = `${tourism.fazer}`;

                    div.appendChild(nameLink);
                    div.appendChild(img);
                    div.appendChild(description);
                    div.appendChild(address);
                    div.appendChild(thingsToDo);

                    const separator = document.createElement('hr');
                    div.appendChild(separator);

                    tourismContainer.appendChild(div);
                }
            });
        })
        .catch(error => {
            console.error('Erro ao carregar os dados de turismo:', error);
        });
}

function getTourismLink(name) {
    switch(name.toLowerCase()) {
        case 'senso-ji':
            return 'https://www.japan.travel/pt/spot/1691/';
        case 'tokyo tower':
            return 'https://www.tokyotower.co.jp/';
        case 'meiji jingu':
            return 'https://www.meijijingu.or.jp/en/';
        default:
            return '#';
    }
}

function getAttractionsImage(name) {
    switch(name.toLowerCase()) {
        case 'tokyo disneysea':
            return 'imagens/TokyoDisneySea.jpg';
        case 'ghibli museum':
            return 'imagens/GhibliMuseum.jpg';
        case 'ueno zoo':
            return 'imagens/UenoZoo.jpg';
        default:
            return 'imagens/default.jpg'; // Imagem padrão se o nome não corresponder
    }
}
function carregarAtracoes() {
    fetch('http://localhost:3000/dados-atracoes')
        .then(response => response.json())
        .then(data => {
            const attractionsContainer = document.getElementById('attractions-container');
            attractionsContainer.innerHTML = '';

            // Usar um Set para verificar duplicatas
            const addedAttractions = new Set();

            data.forEach(attraction => {
                if (!addedAttractions.has(attraction.name.toLowerCase())) {
                    addedAttractions.add(attraction.name.toLowerCase());

                    const div = document.createElement('div');
                    div.className = 'attraction-item category-item';

                    const nameLink = document.createElement('a');
                    nameLink.textContent = attraction.name;
                    nameLink.href = getAttractionsLink(attraction.name); // Usar a função para obter o link correto
                    nameLink.className = 'attraction-link';
                    nameLink.style.fontSize = '1.2em'; // Para diferenciar do restante

                    const img = document.createElement('img');
                    img.src = getAttractionsImage(attraction.name); // Usar a função para obter a imagem correta

                    const description = document.createElement('p');
                    description.textContent = `${attraction.description}`;

                    const address = document.createElement('p');
                    address.textContent = `Endereço: ${attraction.address}`;

                    div.appendChild(nameLink);
                    div.appendChild(img);
                    div.appendChild(description);
                    div.appendChild(address);

                    const separator = document.createElement('hr');
                    div.appendChild(separator);

                    attractionsContainer.appendChild(div);
                }
            });
        })
        .catch(error => {
            console.error('Erro ao carregar os dados das atrações:', error);
        });
}

    
function getAttractionsLink(name) {
    switch (name.toLowerCase()) {
        case 'tokyo disneysea':
            return 'https://www.tokyodisneyresort.jp/en/tds/';
        case 'ghibli museum':
            return 'https://www.ghibli-museum.jp/en/';
        case 'ueno zoo':
            return 'https://www.tokyo-zoo.net/english/ueno/index.html';
        default:
            return '#';
    }
}

function getShoppingImage(name) {
    switch(name.toLowerCase()) {
        case 'shibuya 109':
            return 'imagens/Shibuya.jpg';
        case 'don quijote':
            return 'imagens/DonQuijote.jpg';
        case 'harajuku takeshita street':
            return 'imagens/Harajuku.jpg';
        default:
            return 'imagens/default.jpg'; // Imagem padrão se o nome não corresponder
    }
}
function carregarCompras() {
    fetch('http://localhost:3000/dados-compras')
        .then(response => response.json())
        .then(data => {
            const shoppingContainer = document.getElementById('shopping-container');
            shoppingContainer.innerHTML = '';

            // Usar um Set para verificar duplicatas
            const addedShopping = new Set();

            data.forEach(shop => {
                if (!addedShopping.has(shop.name.toLowerCase())) {
                    addedShopping.add(shop.name.toLowerCase());

                    const div = document.createElement('div');
                    div.className = 'shopping-item category-item';

                    const nameLink = document.createElement('a');
                    nameLink.textContent = shop.name;
                    nameLink.href = getShopLink(shop.name); // Usar a função para obter o link correto
                    nameLink.className = 'shopping-link';
                    nameLink.style.fontSize = '1.2em'; // Para diferenciar do restante

                    const img = document.createElement('img');
                    img.src = getShoppingImage(shop.name); // Usar a função para obter a imagem correta

                    const description = document.createElement('p');
                    description.textContent = `${shop.description}`;

                    const address = document.createElement('p');
                    address.textContent = `Endereço: ${shop.address}`;

                    div.appendChild(nameLink);
                    div.appendChild(img);
                    div.appendChild(description);
                    div.appendChild(address);

                    const separator = document.createElement('hr');
                    div.appendChild(separator);

                    shoppingContainer.appendChild(div);
                }
            });
        })
        .catch(error => {
            console.error('Erro ao carregar os dados de compras:', error);
        });
}

function getShopLink(name) {
    switch (name.toLowerCase()) {
        case 'shibuya 109':
            return 'https://www.shibuya109.jp/';
        case 'don quijote':
            return 'https://www.donki.com/en/';
        case 'harajuku takeshita street':
            return 'https://www.gotokyo.org/en/spot/48/index.html';
        default:
            return '#';
    }
}


document.getElementById('budget-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário
    updateChart(); // Atualiza o gráfico com o orçamento inserido
    document.getElementById('info-section').classList.remove('hidden');
    carregarRestaurantes(); // Carrega os dados dos restaurantes
    carregarTurismo(); // Carrega os dados de turismo
    carregarAtracoes(); // Carrega os dados das atrações
    carregarCompras(); // Carrega os dados de compras
});

window.onload = function() {
    console.log('Window loaded');
    updateChart();
    carregarCidades();
    carregarRestaurantes();
};