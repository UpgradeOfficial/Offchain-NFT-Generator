// This script only works with --network 'mainnet', or 'hardhat' when running a fork of mainnet

//npx hardhat getNFTDetails --address 0xkdfdfkfk --price "100"  --image "http:fdhfkdfk"
task("getNFTDetails", "Uploads an NFT to the Contract")
    .addParam("id", "The Id of the uploaded image")
    .setAction(async (taskArgs) => {
        const id = Number(taskArgs.id)
        const address =
            require(`../deployments/${network.name}/MyNFTOffchainGenerator.json`).address

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
        const data = await myNFTOffchainGeneratorContract.getImageDetailsByUploadToken(id)
        console.log("image_url: ", data[0])
        console.log("price: ", Number(data[1]))
        console.log("minted-counter: ", Number(data[2]))
        console.log("Gotten")
    })

module.exports = {}
