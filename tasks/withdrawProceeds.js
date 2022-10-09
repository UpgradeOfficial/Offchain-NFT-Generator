// This script only works with --network 'mainnet', or 'hardhat' when running a fork of mainnet

//npx hardhat withdrawProceeds --address 0xkdfdfkfk --price "100"  --image "http:fdhfkdfk"
task("withdrawProceeds", "Uploads an NFT to the Contract")
    // .addParam("address", "The price of the NFT")
    .setAction(async (taskArgs) => {
        // const address = taskArgs.
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
        const data = await myNFTOffchainGeneratorContract.withdrawProceeds()
        console.log("The Balance has been withdrawn ")
    })

module.exports = {}
