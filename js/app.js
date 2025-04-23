const API_URL = "http://51.38.232.174:3001"
const pizzaWrapper = document.querySelector(".pizzas-wrapper")
const emptyBasket = document.querySelector(".empty-basket")
const basketsWithPizza = document.querySelector(".baskets-with-pizza")
const orderModalWrapper = document.querySelector(".order-modal-wrapper")

let TOKEN = ""

let ordersData = []
let orders = []

addEventListener("DOMContentLoaded", async () => {
    pizzaWrapper.innerHTML = "";
    const req = await fetch("http://51.38.232.174:3001/auth/login/", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            "email": "classale@edenschool.fr",
            "password": "ilovefish"
        })
    })
    const data = await req.json();
    TOKEN = data.access_token
    const answ = await fetch(`${API_URL}/products`)
    const products = await answ.json()
    for(let product of products) {
        pizzaWrapper.appendChild(createPizzaElement(product))
        console.log(product.id)
    }
})

async function createOrderInfos() {
    const totalOrder = Object.assign(document.createElement("p"), {className: "total-order"})
    totalOrder.appendChild(Object.assign(document.createElement("p"), {className: "total-order-title", innerHTML: "Order total"}))
    totalOrder.appendChild(Object.assign(document.createElement("p"), {className: "total-order-price", innerHTML: `$${Number(orders.reduce((a, v) => a += v.price * v.quantity, 0)).toFixed(2)}`}))
    const deliveryInfo = Object.assign(document.createElement("p"), {className: "delivery-info", innerHTML: "This is a"})
    deliveryInfo.appendChild(Object.assign(document.createElement("span"), {innerHTML: "carbon neutral"}))
    deliveryInfo.appendChild(document.createTextNode("delivery"))
    const button = Object.assign(document.createElement("a"), {className: "confirm-order-btn", href: "#", innerHTML: "Confirm Order"});
    button.addEventListener("click", async () => {
        document.querySelector(".empty-basket").style.display = "block"
        document.querySelector(".baskets-with-pizza").style.display = "none"
        console.log(JSON.stringify(
                {
                    products: ordersData
                }
            ))
        const answ = await fetch(`${API_URL}/orders`, {
            body: JSON.stringify(
                {
                    products: ordersData
                }
            ),
            method: "POST",
            headers: {
                "Authorization": `Bearer ${TOKEN}`,
                "Content-type": "application/json",
            }
        })
        const data = await answ.json();
        console.log(data)
        orderModalWrapper.querySelector("ul").innerHTML = ""
        for(let order of orders) orderModalWrapper.querySelector("ul").appendChild(createOrderModalElement(order))
        const total = Object.assign(document.createElement("li"), {className: "order-detail-total-price"})
        total.appendChild(Object.assign(document.createElement("span"), {className: "total-order-title", innerHTML: "Order total"}))
        total.appendChild(Object.assign(document.createElement("span"), {className: "total-order-price", innerHTML: `$${Number(orders.reduce((a, v) => a += v.price * v.quantity, 0)).toFixed(2)}`}))
        orderModalWrapper.querySelector("ul").appendChild(total)
        orders = [];
        ordersData = []
        for(let value of document.querySelectorAll(".value")) value.innerHTML = 1
        for(let button of document.querySelectorAll(".select-items-btn")) button.style.display = "none"
        for(let button of document.querySelectorAll(".add-to-cart-btn")) button.style.display = "flex"
        orderModalWrapper.style.display = "block"
    })
    return [totalOrder, deliveryInfo, button]
}

function createPizzaElement({description, id, image, name, price}) {
    console.log(image)
    const pizzaItem = Object.assign(document.createElement("div"), {className: "pizza-item"})
    pizzaItem.appendChild(Object.assign(document.createElement("img"), {className: "pizza-picture", src: image, alt: name}))
    const addToCartButton = Object.assign(document.createElement("span"), {className: "add-to-cart-btn"})
    addToCartButton.appendChild(Object.assign(document.createElement("img"), {src: "./images/carbon_shopping-cart-plus.svg", alt: "+"}))
    addToCartButton.appendChild(document.createTextNode("Ajouter au panier"))
    const selectItemsButton = Object.assign(document.createElement("span"), {className: "select-items-btn"})
    selectItemsButton.style.display = "none";
    const minusButton = Object.assign(document.createElement("button"), {innerHTML: "-"})
    let plusButton = Object.assign(document.createElement("button"), {innerHTML: "+"})
    selectItemsButton.appendChild(minusButton)
    selectItemsButton.appendChild(Object.assign(document.createElement("span"), {innerHTML: "1", className: "value"}))
    selectItemsButton.appendChild(plusButton)
    pizzaItem.appendChild(selectItemsButton)

    addToCartButton.addEventListener("click", e => {
        addToCartButton.style.display = "none";
        selectItemsButton.style.display = "flex";
        ordersData.push({
            uuid: id,
            quantity: 1
        })
        orders.push({
            name: name,
            price: price,
            image: image,
            uuid: id,
            quantity: 1
        })
    })
    
    plusButton.addEventListener("click", () => {
        selectItemsButton.querySelector(".value").innerHTML++
        ordersData.find(e => e.uuid == id).quantity++;
        orders.find(e => e.uuid == id).quantity++;
    })

    minusButton.addEventListener("click", () => {
        if(selectItemsButton.querySelector(".value").innerHTML == 1) {
            ordersData.splice(ordersData.findIndex(e => e.uuid == id), 1);
            orders.splice(ordersData.findIndex(e => e.uuid == id), 1);
            addToCartButton.style.display = "flex";
            selectItemsButton.style.display = "none";
        } else {
            selectItemsButton.querySelector(".value").innerHTML--
            ordersData.find(e => e.uuid == id).quantity--
            orders.find(e => e.uuid == id).quantity--
        };
    })

    plusButton.onclick = minusButton.onclick = addToCartButton.onclick = async () => {
        emptyBasket.style.display = orders.length == 0 ? "block" : "none"
        basketsWithPizza.style.display = orders.length == 0 ? "none" : "block"
        const basketsWithPizzaUl = Object.assign(document.createElement("ul"), {className: "basket-products"})
        basketsWithPizza.innerHTML = ""
        for(let order of orders) {
            basketsWithPizzaUl.append(createOrderElement(order))
        }
        basketsWithPizza.appendChild(basketsWithPizzaUl);
        for(let info of await createOrderInfos()) basketsWithPizza.appendChild(info)
    }

    pizzaItem.appendChild(addToCartButton)
    const pizzaInfos = Object.assign(document.createElement("ul"), {className: "pizza-infos"})
    const pizzaName = pizzaInfos.appendChild(Object.assign(document.createElement("li"), {innerHTML: name, className: "pizza-name"}))
    pizzaName.setAttribute("UUID", id)
    pizzaInfos.appendChild(Object.assign(document.createElement("li"), {innerHTML: `$${price}`, className: "pizza-price"}))
    pizzaItem.appendChild(pizzaInfos)
    return pizzaItem
}

function createOrderElement({name, price, quantity, UUID}) {
    const orderElement = Object.assign(document.createElement("li"), {className: "basket-product-item"});
    orderElement.appendChild(Object.assign(document.createElement("span"), {className: "basket-product-item-name", innerHTML: name}))
    const details = Object.assign(document.createElement("span"), {className: "basket-product-details"})
    details.appendChild(Object.assign(document.createElement("span"), {className: "basket-product-details-quantity"}, {innerHTML: `${quantity}x`}))
    details.appendChild(Object.assign(document.createElement("span"), {className: "basket-product-details-unit-price"}, {innerHTML: `@ $${Number(price).toFixed(2)}`}))
    details.appendChild(Object.assign(document.createElement("span"), {className: "basket-product-details-total-price"}, {innerHTML: `$${Number(price * quantity).toFixed(2)}`}))
    orderElement.appendChild(details)
    const remove = orderElement.appendChild(Object.assign(document.createElement("img"), {src: "./images/remove-icon.svg" , className: "basket-product-remove-icon", alt:"x"}))
    remove.addEventListener("click", e => {
        orderElement.remove()
        const removedPizza = [...document.querySelectorAll(".pizzas-wrapper > *")].find(e => e.querySelector(".pizza-name").getAttribute("uuid") == UUID);
        console.log(removedPizza)
        removedPizza.querySelector(".value").innerHTML = 1;
        removedPizza.querySelector(".select-items-btn").style.display = "none"
        removedPizza.querySelector(".add-to-cart-btn").style.display = "flex"
        ordersData.splice(ordersData.findIndex(e => e.uuid == UUID), 1);
        orders.splice(orders.findIndex(e => e.uuid == UUID), 1);
        basketsWithPizza.querySelector(".total-order-price").innerHTML = `$${orders.reduce((a, v) => a += v.price * v.quantity, 0)}`
        if(orders.length == 0) {
            emptyBasket.style.display = "block"
            basketsWithPizza.style.display = "none"
        }
    })
    return orderElement
}

/*
<li class="order-detail-product-item">
    <img class="order-detail-product-image" src="https://cdn.dummyjson.com/recipe-images/1.webp" alt="">
    <span class="order-detail-product-name">Pizza aux anchois</span>
    <span class="order-detail-product-quantity">1x</span>
    <span class="order-detail-product-unit-price">@ $5.50</span>
    <span class="order-detail-product-total-price">$15.50</span>
</li>
*/

function createOrderModalElement({image, name, price, quantity}) {
    const orderDetailProductItem = Object.assign(document.createElement("li"), {className: "order-detail-product-item"})
    orderDetailProductItem.appendChild(Object.assign(document.createElement("img"), {className: "order-detail-product-image", src: image}))
    orderDetailProductItem.appendChild(Object.assign(document.createElement("span"), {className: "order-detail-product-name", innerHTML: name}))
    orderDetailProductItem.appendChild(Object.assign(document.createElement("span"), {className: "order-detail-product-quantity", innerHTML: `x${quantity}`}))
    orderDetailProductItem.appendChild(Object.assign(document.createElement("span"), {className: "order-detail-product-unit-price", innerHTML: `@ $${Number(price).toFixed(2)}`}))
    orderDetailProductItem.appendChild(Object.assign(document.createElement("span"), {className: "order-detail-product-total-price", innerHTML: `$${Number(price * quantity).toFixed(2)}`}))
    return orderDetailProductItem;
}

document.querySelector(".new-order-btn").addEventListener("click", () => {
    orderModalWrapper.style.display = "none"
})

/*
<li class="basket-product-item">
    <span class="basket-product-item-name">Pizza au thon</span>
    <span class="basket-product-details">
        <span class="basket-product-details-quantity">1x</span>
        <span class="basket-product-details-unit-price">@ $5.50</span>
        <span class="basket-product-details-total-price">$5.50</span>
    </span>
    <img class="basket-product-remove-icon" src="./images/remove-icon.svg" alt="">
</li>
*/