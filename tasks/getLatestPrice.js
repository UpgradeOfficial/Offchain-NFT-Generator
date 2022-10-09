// This script only works with --network 'mainnet', or 'hardhat' when running a fork of mainnet

//npx hardhat getLatestPrice --address 0xkdfdfkfk --price "100"  --image "http:fdhfkdfk"
task("getLatestPrice", "Uploads an NFT to the Contract").setAction(async (taskArgs) => {
    const address = require(`../deployments/${network.name}/MyNFTOffchainGenerator.json`).address

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
    const data = await myNFTOffchainGeneratorContract.getLatestPrice()
    console.log("Latest price: ", Number(data))
})

module.exports = {}
