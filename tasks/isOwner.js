// This script only works with --network 'mainnet', or 'hardhat' when running a fork of mainnet

//npx hardhat isOwner --address 0xkdfdfkfk --price "100"  --image "http:fdhfkdfk"
task("isOwner", "Uploads an NFT to the Contract")
    .addParam("player", "The address you want to check(if he is the owner of the contract)")
    .setAction(async (taskArgs) => {
        const address =
            require(`../deployments/${network.name}/MyNFTOffchainGenerator.json`).address
        const player = taskArgs.player

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
        const data = await myNFTOffchainGeneratorContract.isOwner(player)
        console.log("Is Owner? ", Boolean(data))
    })

module.exports = {}
