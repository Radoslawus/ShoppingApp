const db = new Dexie('ShoppingApp')
db.version(1).stores( {items: '++id, name, price, quantity, isPurchased'} )

const itemForm = document.querySelector('#itemForm')
const itemsDiv = document.querySelector('#itemsDiv')
const totalPriceDiv = document.querySelector('#totalPriceDiv')
const restPriceDiv = document.querySelector('#restPriceDiv')

itemForm.onsubmit = async (e) => {
    e.preventDefault()
    const name = document.querySelector('#nameInput').value
    const quantity = document.querySelector('#quantityInput').value
    const price = document.querySelector('#priceInput').value
    await db.items.add({name, price, quantity})
    await populateItemsDiv()
    itemForm.reset()
}

const populateItemsDiv = async () => {
    const allItems = await db.items.reverse().toArray()
    itemsDiv.innerHTML = allItems.map(item => `
        <div class="item ${item.isPurchased && 'purchased'}">
            <label for="">
                <input 
                    type="checkbox" 
                    class="checkbox" 
                    ${item.isPurchased && 'checked'}
                    onchange="toggleItemStatus(event, ${item.id})"
                >
            </label>
            <div class="itemInfo">
                <p>${item.name}</p>
                <p>${item.price}zł x ${item.quantity}</p>
            </div>
            <button class="deleteBtn" onclick="removeItem(${item.id})">X</button>
        </div>
    `).join('')

    const arrayOfPrices = allItems.map(item => item.price * item.quantity)
    const totalPrice = arrayOfPrices.reduce((a,b) => a + b, 0).toFixed(2)
    const arrayOfRestPrices = allItems.map(item => {
        if (!item.isPurchased) {
            return item.price * item.quantity
        } else {
            return 0
        }
    })
    const totalRestPrice = arrayOfRestPrices.reduce((a,b) => a + b, 0).toFixed(2)

    totalPriceDiv.innerText = `Koszt całości: ${totalPrice} zł`
    restPriceDiv.innerText = `Koszt pozostały: ${totalRestPrice} zł`
}

window.onload = populateItemsDiv

const toggleItemStatus = async (e, id) => {
    await db.items.update(id, {isPurchased: !!e.target.checked})
    await populateItemsDiv()
}

const removeItem = async (id) => {
    await db.items.delete(id)
    await populateItemsDiv()
}