// This script only works with --network 'mainnet', or 'hardhat' when running a fork of mainnet


//npx hardhat uploadNFT --address 0xkdfdfkfk --price "100"  --image "http:fdhfkdfk"
task("uploadNFT", "Uploads an NFT to the Contract")
    .addParam("image", "The MetaData URL of the NFT")
    .addParam("price", "The price of the NFT")
    .setAction(async (taskArgs) => {
        const image = taskArgs.image
        const price = Number(taskArgs.price)
        const address = require(`../deployments/${network.name}/MyNFTOffchainGenerator.json`).address

        

        const myNFTOffchainGenerator = await ethers.getContractFactory("MyNFTOffchainGenerator")
        console.log("Upload NFT to ",network.name,"network with contract address  => ", address)

        //Get signer information
        const accounts = await ethers.getSigners()
        const signer = accounts[0]
        console.log(signer.address)
        const myNFTOffchainGeneratorContract = await new ethers.Contract(
            address,
            myNFTOffchainGenerator.interface,
            signer
        )
        await myNFTOffchainGeneratorContract.uploadImage(image, price)
        console.log("uploaded")
        // .then((data) => {
        //   console.log("Price is: ", BigInt(data["answer"]).toString())
        // })
    })

module.exports = {}
