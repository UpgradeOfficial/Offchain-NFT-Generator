// This script only works with --network 'mainnet', or 'hardhat' when running a fork of mainnet

//npx hardhat mintNFT --address 0xkdfdfkfk --price "100"  --image "http:fdhfkdfk"
task("mintNFT", "Uploads an NFT to the Contract")
    .addParam("id", "The Id of the uploaded image")
    .addParam("pay", "The amount to pay for the NFT")
    .setAction(async (taskArgs) => {
        const id = Number(taskArgs.id)
        const pay = taskArgs.pay
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
        const payInEthers = ethers.utils.parseEther(pay)
        const data = await myNFTOffchainGeneratorContract.mintNft(id, { value: payInEthers })
        console.log("Image at", id, " Minted!!!")
    })

module.exports = {}
