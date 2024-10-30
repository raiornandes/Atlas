function getShoppingImageLondres(name) {
    switch(name.toLowerCase()) {
        case 'harrods':
            return 'imagens/Harrods.jpg';
        case 'camden market':
            return 'imagens/CamdenMarket.jpg';
        default:
            return 'imagens/default.jpg'; // Imagem padrão se o nome não corresponder
    }
}

function carregarComprasLondres() {
    fetch('http://localhost:3000/dados-compras-londres')
        .then(response => response.json())
        .then(data => {
            const shoppingContainer = document.getElementById('shopping-container');
            shoppingContainer.innerHTML = '';
            const addedShopping = new Set();
            data.forEach(shop => {
                if (!addedShopping.has(shop.name.toLowerCase())) {
                    addedShopping.add(shop.name.toLowerCase());
                    const div = document.createElement('div');
                    div.className = 'shopping-item category-item';
                    const nameLink = document.createElement('a');
                    nameLink.textContent = shop.name;
                    nameLink.href = getShopLinkLondres(shop.name);
                    nameLink.className = 'shopping-link';
                    nameLink.style.fontSize = '1.2em'; // Para diferenciar do restante
                    const img = document.createElement('img');
                    img.src = getShoppingImageLondres(shop.name); // Usar a função para obter a imagem correta
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

function getShopLinkLondres(name) {
    switch (name.toLowerCase()) {
        case 'harrods':
            return 'https://www.harrods.com/';
        case 'camden market':
            return 'https://www.camdenmarket.com/';
        default:
            return '#';
    }
}
