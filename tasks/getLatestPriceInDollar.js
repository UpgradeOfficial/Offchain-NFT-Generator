// This script only works with --network 'mainnet', or 'hardhat' when running a fork of mainnet

//npx hardhat getLatestPriceInDollar --address 0xkdfdfkfk --price "100"  --image "http:fdhfkdfk"
task("getLatestPriceInDollar", "Uploads an NFT to the Contract")
    .addParam("eth", "The price of the NFT")
    .setAction(async (taskArgs) => {
        const address =
            require(`../deployments/${network.name}/MyNFTOffchainGenerator.json`).address
        const eth = taskArgs.eth
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
        const data = await myNFTOffchainGeneratorContract.convertEthToDollar(eth)
        console.log("Price of", eth, " wei in dollar is: ", Number(data))
    })

module.exports = {}
