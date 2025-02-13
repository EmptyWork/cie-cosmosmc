const isDevelopment = true
const getDevelopmentStatus = () => (location.hostname == "127.0.0.1" || isDevelopment) ? true : false
const devLog = (...args) => {
    if (getDevelopmentStatus()) {
        const err = new Error();
        const stack = err.stack.split('\n')[2].trim().replace(/at [a-zA-Z1-9]+ \(/, " ").replace("at ", " ").replace(")", " ");
        const logMessage = [stack, "\n\n", ...args];
        console.log(...logMessage);
    }
}

const convertToRoman = (num) => {
    const romanNumerals = [["M", 1000], ["CM", 900], ["D", 500], ["CD", 400], ["C", 100], ["XC", 90], ["L", 50], ["XL", 40], ["X", 10], ["IX", 9], ["V", 5], ["IV", 4], ["I", 1]]

    let result = ""
    for (let [roman, value] of romanNumerals) {
        while (num >= value) {
            result += roman
            num -= value
        }
    }
    return result
}

const checkIfEnchantNameIsNotSingleWord = (enchant) => {
    let processedText = enchant.split("")

}

const capitalizeFirstLetter = (string) => `${string.charAt(0).toUpperCase()}${string.slice(1)}`

const returnNullIfEmpty = (value) => (value == "null" || value == "") ? null : value


const makeReadableEnchants = (enchants = null, customEnchants = null, element = null) => {
    if (enchants == null) return
    const unorderList = document.createElement("ul")
    unorderList.classList.add("enchants-area")
    if (customEnchants != null && Object.keys(customEnchants).length > 0) {
        for (let [enchant, level] of Object.entries(customEnchants)) {
            const enchantElement = document.createElement("li");
            if (level == null) level = "&#fcfc54N/A"
            let enchantText = `${capitalizeFirstLetter(enchant)} ${level}`
            parseString(enchantText, enchantElement)
            unorderList.appendChild(enchantElement)
        }
    }
    for (const [enchant, level] of Object.entries(enchants)) {
        const enchantElement = document.createElement("li");
        let enchantText
        // Need to add more support for non-tier text
        if (enchant == "unbreakable") {
            enchantText = `${capitalizeFirstLetter(enchant)}`
        } else {
            enchantText = `${capitalizeFirstLetter(enchant)} ${convertToRoman(level)} `
        }
        parseString(enchantText, enchantElement)
        unorderList.appendChild(enchantElement)

    }
    element.appendChild(unorderList)
}

const makeReadableLores = (lores = null, noDivider = false, element = null) => {
    if (lores == null) return
    const unorderList = document.createElement("ul")
    if (noDivider) unorderList.classList.add("no-divider")
    unorderList.classList.add("lores-area")
    lores.forEach(lore => {
        const loreElement = document.createElement("li")
        parseString(lore, loreElement)
        if (lore == "") {
            loreElement.textContent = "spacing"
            loreElement.classList.add('hidden')
        }
        unorderList.appendChild(loreElement)
    })
    element.appendChild(unorderList)
}

const parseString = (input, element) => {
    const regex = /(&#(?:[0-9a-fA-F]{6})|&[0-9a-fA-Fk-orK-OR])/g
    const parts = input?.split(regex)
    let color = ''
    let bold = false
    parts?.forEach(part => {
        if (part.startsWith('&#')) {
            color = part.slice(1)
        } else if (part.startsWith('&')) {
            switch (part) {
                case '&a':
                    color = "#55FF55"
                    break
                case '&b':
                    color = "#55FFFF"
                    break
                case '&c':
                    color = "#ff5555"
                    break
                case '&d':
                    color = "#FF55FF"
                    break
                case '&e':
                    color = "#FFFF55"
                    break
                case '&f':
                    color = "#FFFFFF"
                    break
                case '&1':
                    color = "#0000AA"
                    break
                case '&2':
                    color = "#00AA00"
                    break
                case '&3':
                    color = "#00AAAA"
                    break
                case '&4':
                    color = "#aa0000"
                    break
                case '&5':
                    color = "#AA00AA"
                    break
                case '&6':
                    color = "#ffaa00"
                    break
                case '&7':
                    color = "#AAAAAA"
                    break
                case '&8':
                    color = "#555555"
                    break
                case '&9':
                    color = "#5555FF"
                    break
                case '&0':
                    color = "#000000"
                    break
                case '&l':
                    bold = true
                    break
                case '&r':
                    color = ''
                    bold = false
                    break
                default:
                    color = ''
            }
        } else if (part) {
            const span = document.createElement('span')
            if (color) span.style.color = color
            if (bold) span.style.fontWeight = 'bold'
            span.textContent = part
            element.appendChild(span)
        }
    })
}