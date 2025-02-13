"use strict"

const itemFinder = async ({ output, input, categorySelector, crateSelector } = {}) => {
    const inputElement = document.querySelector(`#${input}`)
    const categorySelectorElement = document.querySelector(`#${categorySelector}`)
    const crateSelectorElement = document.querySelector(`#${crateSelector}`)
    const outputElement = document.querySelector(`#${output}`)
    let data = await getData()

    devLog("You are accessing Development View", inputElement, categorySelectorElement, crateSelectorElement, outputElement)

    createCrateTypesSelector(data, crateSelectorElement)
    createCategoriesSelector(data, categorySelectorElement)
    createView({ data: data, output: outputElement })

    inputElement.addEventListener("input", e => {
        setTimeout(async () => {
            devLog(crateSelectorElement.value)
            data = await makeData({
                currentName: returnNullIfEmpty(e.target.value.toLowerCase()),
                currentCategory: returnNullIfEmpty(categorySelectorElement.value?.toLowerCase()),
                currentCrate: returnNullIfEmpty(crateSelectorElement.value?.toLowerCase())
            })
            updateView({
                data: data,
                output: outputElement
            })
        }, 0)
    })

    window.addEventListener("keypress", e => {
        devLog(e)
        if (e.code == "Enter") {
            inputElement.focus()
        }
    })

    categorySelectorElement.addEventListener("change", async e => {
        let categoryValue = e.target.value
        if (categorySelectorElement.value === "null") { categoryValue = null }
        data = await makeData({
            currentName: returnNullIfEmpty(inputElement.value?.toLowerCase()),
            currentCategory: categoryValue,
            currentCrate: returnNullIfEmpty(crateSelectorElement.value?.toLowerCase())
        })
        updateView({
            data: data,
            output: outputElement
        })
    })

    crateSelectorElement.addEventListener("change", async () => {
        let crateValue = crateSelectorElement.value
        if (crateSelectorElement.value === "null") { crateValue = null }
        data = await makeData({
            currentName: returnNullIfEmpty(inputElement.value?.toLowerCase()),
            currentCategory: returnNullIfEmpty(categorySelectorElement.value?.toLowerCase()),
            currentCrate: crateValue
        })
        updateView({
            data: data,
            output: outputElement
        })
    })

}

const getData = async ({ categoryOnly, currentName, currentCrate } = {}) => {
    try {
        const response = await fetch('../data.json')
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText)
        }
        const inputData = await response.json()
        devLog({ categoryOnly, currentName, currentCrate })
        let data = inputData.items
        devLog(data, currentCrate, currentName != null)
        if (currentCrate != null) {
            data = data.filter(item => item.part?.replaceAll(" ", "-").toLowerCase() === currentCrate)
        }
        devLog(data, currentName, currentName != null)
        if (currentName != null) {
            data = data.filter(item => item.name?.toLowerCase().includes(currentName))
        }
        devLog(data, categoryOnly, categoryOnly != null)
        if (categoryOnly != null) {
            data = data.filter(item => item.category === categoryOnly)
        }
        devLog(data)
        return data
    } catch (error) {
        console.error('Error fetching the JSON file:', error)
    }
}

const makeData = async ({ currentName = null, currentCategory = null, currentCrate = null } = {}) => {
    return await getData({ categoryOnly: currentCategory, currentName: currentName, currentCrate: currentCrate })
}

const createCrateTypesSelector = (data = null, element = null) => {
    const uniqueParts = new Set(data.map(item => item.part));
    const uniquePartsArray = Array.from(uniqueParts);
    const filteredParts = uniquePartsArray.filter(element => element !== undefined);

    for (let part of filteredParts) {
        const newOption = document.createElement("option")
        newOption.value = part.replaceAll(" ", "-").toLowerCase()
        newOption.innerText = part
        element.appendChild(newOption)
    }
}

const createCategoriesSelector = (data = null, element = null) => {
    const uniqueCategories = new Set(data.map(item => item.category));
    const uniqueCategoriesArray = Array.from(uniqueCategories);
    const filteredCategories = uniqueCategoriesArray.filter(element => element !== undefined);

    for (let category of filteredCategories) {
        const newOption = document.createElement("option")
        newOption.value = category.replaceAll(" ", "-").toLowerCase()
        newOption.innerText = capitalizeFirstLetter(category)
        element.appendChild(newOption)
    }
}

const createView = ({ data, output } = {}) => {
    const firstLayoutElement = output.querySelector('#first-area')
    const secondLayoutElement = output.querySelector('#second-area')
    const thirdLayoutElement = output.querySelector('#third-area')

    if (data.length < 1) {
        let element = createNewItemCard({
            data: { name: "no data", nameStyles: "No data" },
        })
        element.classList.add("no-data")
        secondLayoutElement.appendChild(element)
        secondLayoutElement.classList.add("override")
        return
    }
    secondLayoutElement.classList.remove("override")

    devLog("data length", data.length)
    for (let i = 0; i < data.length; i++) {
        let element = createNewItemCard({
            data: data[i],
        })
        devLog(i, element)
        element.classList.add("item-card")
        const position = i % 3;
        switch (position) {
            case 0:
                firstLayoutElement.appendChild(element)
                break
            case 1:
                secondLayoutElement.appendChild(element)
                break
            case 2:
                thirdLayoutElement.appendChild(element)
                break
        }
    }
}

const getAllNestedChildren = (element) => {
    let allChildren = []

    const children = Array.from(element.children)

    children.forEach(child => {
        allChildren.push(child)
        allChildren.concat(getAllNestedChildren(child))
    })

    return allChildren;
}

const updateView = ({ data, output } = {}) => {
    const childrenElements = Array.from(output.children)
    let childrenOfChildren = []
    childrenElements.forEach(child => {
        childrenOfChildren = [...child.children, ...childrenOfChildren]
    })
    devLog("test", childrenOfChildren)

    for (let element of childrenOfChildren) {
        element.remove()
    }

    createView({ data: data, output: output })
}

const createNewItemCard = ({ data } = {}) => {
    const element = document.createElement("div")
    const nameElement = document.createElement("b")
    const nameStylesElement = document.createElement("div")

    nameElement.textContent = data.name.toUpperCase()
    nameElement.classList.add('item-name')
    nameStylesElement.classList.add('item-name')
    parseString(data.nameStyles, nameStylesElement)
    if (data.nopvp) {
        const nopvpElement = document.createElement("div")
        const nopvpImageElement = document.createElement("img")
        nopvpImageElement.src = "../assets/images/nopvp.png"
        nopvpElement.classList.add("no-pvp")
        nopvpElement.appendChild(nopvpImageElement)
        nopvpElement.setAttribute("data-tooltip", "Disabled on PVP")
        element.appendChild(nopvpElement)
    }
    element.appendChild(nameStylesElement)
    makeReadableEnchants(data.enchants, data.customEnchants, element)
    makeReadableLores(data.lores, data.noDivider, element)
    return element
}

