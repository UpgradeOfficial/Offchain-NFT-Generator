// This script only works with --network 'mainnet', or 'hardhat' when running a fork of mainnet

//npx hardhat setContractState --address 0xkdfdfkfk --price "100"  --image "http:fdhfkdfk"
task("setContractState", "Uploads an NFT to the Contract")
    .addParam("state", "The price of the NFT")
    .setAction(async (taskArgs) => {
        const address =
            require(`../deployments/${network.name}/MyNFTOffchainGenerator.json`).address
        const state = taskArgs.state

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
        const data = await myNFTOffchainGeneratorContract.setContractState(state)
        const state_info = state ? "PENDING" : "OPEN"
        console.log("Contract State Update to ", state_info)
    })

module.exports = {}
