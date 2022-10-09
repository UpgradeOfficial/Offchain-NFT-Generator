// This script only works with --network 'mainnet', or 'hardhat' when running a fork of mainnet

//npx hardhat setNFTPrice --address 0xkdfdfkfk --price "100"  --image "http:fdhfkdfk"
task("setNFTPrice", "Uploads an NFT to the Contract")
    // .addParam("address", "The price of the NFT")
    .addParam("token", "id of the image uploaded")
    .addParam("value", "The new value of the price")
    .setAction(async (taskArgs) => {
        // const address = taskArgs.address
        const address =
            require(`../deployments/${network.name}/MyNFTOffchainGenerator.json`).address
        const token = Number(taskArgs.token)
        const value = Number(taskArgs.value)

        const myNFTOffchainGenerator = await ethers.getContractFactory("MyNFTOffchainGenerator")
        console.log(
            "Task running on the  ",
            network.name,
            "network with contract address  => ",
            address
        )

        //Get signer information
        const accounts = await ethers.getSigners()
        const signer = accounts[0]
        const myNFTOffchainGeneratorContract = await new ethers.Contract(
            address,
            myNFTOffchainGenerator.interface,
            signer
        )
        const data = await myNFTOffchainGeneratorContract.setNFTPrice(token, value)
        console.log(`The price of image with token id ${token} has been set to ${value}`)
    })

module.exports = {}
