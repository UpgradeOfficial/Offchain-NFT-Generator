const fs = require("fs")
const path = require("path")

task("test", "Prints the list of test", async () => {
    // Node.js program to demonstrate the
    // fs.readFileSync() method

    // Include fs module

    // Calling the readFileSync() method
    // to read 'input.txt' file
    const file_path = path.join(
        __dirname,
        "..",
        "deployments",
        "localhost",
        "MyNFTOffchainGenerator.json"
    )
    // const data = fs.readFileSync(file_path,
    //             {encoding:'utf8', flag:'r'});
    const data = require("../deployments/localhost/MyNFTOffchainGenerator.json").address
    // Display the file data
    console.log(data)
})

module.exports = {}
