// Import the NFTStorage class and File constructor from the 'nft.storage' package
const { NFTStorage, File } = require("nft.storage")
const mime = require("mime")
const fs = require("fs")
const path = require("path")
require("dotenv").config()


async function fileFromPath(filePath) {
    const content = await fs.promises.readFile(filePath)
    console.log(content, typeof content)
    return "hey"
    // const type = mime.getType(filePath)
    // return new File([content], path.basename(filePath), { type })
}

module.exports = {
    fileFromPath
}