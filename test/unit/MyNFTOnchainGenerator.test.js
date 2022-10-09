// We are going to skimp a bit on these tests...

const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { fileFromPath } = require("../../utils/uploadFile")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Dynamic SVG NFT Unit Tests", function () {
          let myNFTOffchainGenerator, deployer, mockV3Aggregator

          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["all"])
              myNFTOffchainGenerator = await ethers.getContract("MyNFTOffchainGenerator")
              mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
          })

          describe("constructor", () => {
              it("sets starting values correctly", async function () {
                  const contract_state = await myNFTOffchainGenerator.getContractState()
                  const priceFeed = await myNFTOffchainGenerator.getPriceFeed()
                  const tokenCounter = await myNFTOffchainGenerator.getTokenCounter()
                  assert.equal(contract_state, 0)
                  assert.equal(priceFeed, mockV3Aggregator.address)
                  assert.equal(tokenCounter, 0)
              })
          })
          describe("ConvertEthToDollar", () => {
              it("Convert Eth to dollar", async function () {
                  const amountinEth = ethers.utils.parseEther("1")
                  const converted = await myNFTOffchainGenerator.convertEthToDollar(amountinEth)
                  const latestPrice = await myNFTOffchainGenerator.getLatestPrice()
                  assert.equal(latestPrice.toString(), 200 * 1e18)
                  assert.equal(converted.toString(), 200 * 1e18)
              })
          })
          describe("UploadImage", () => {
              it("upload an NFT", async function () {
                  await expect(
                      myNFTOffchainGenerator.uploadImage(
                          "http://ipfs.io/ipfs/dur30ru0ru0eur90ee",
                          100
                      )
                  )
                      .to.emit(myNFTOffchainGenerator, "NFTCreated")
                      .withArgs(0, "http://ipfs.io/ipfs/dur30ru0ru0eur90ee", 100)
              })
              it("check if image data exist on upload", async function () {
                  const image_url1 = "http://ipfs.io/ipfs/dur30ru0ru0eur90ee"
                  const price1 = 100
                  const image_url2 = "http://ipfs.io/ipfs/dur30ru0ru0eur90ee23"
                  const price2 = 200
                  await myNFTOffchainGenerator.uploadImage(image_url1, price1)
                  await myNFTOffchainGenerator.uploadImage(image_url2, price2)

                  const data1 = await myNFTOffchainGenerator.getImageDetailsByUploadToken(0)
                  const data2 = await myNFTOffchainGenerator.getImageDetailsByUploadToken(1)

                  assert.equal(data1[0], image_url1)
                  assert.equal(data1[1].toNumber(), price1)
                  assert.equal(data2[0], image_url2)
                  assert.equal(data2[1].toNumber(), price2)
              })
          })
          describe("MintNft", () => {
              it("User can't mint an NFT due to insufficient fund", async function () {
                  const image_url1 = "http://ipfs.io/ipfs/dur30ru0ru0eur90ee"
                  const price1 = 100
                  await myNFTOffchainGenerator.uploadImage(image_url1, price1)
                  await expect(myNFTOffchainGenerator.mintNft(0)).to.be.revertedWith(
                      "MyNFTOffchainGenerator__InsufficientFund"
                  )
              })
              it("User can't mint an NFT due to contract not open", async function () {
                  const image_url1 = "http://ipfs.io/ipfs/dur30ru0ru0eur90ee"
                  const price1 = 100
                  await myNFTOffchainGenerator.setContractState(1)
                  await myNFTOffchainGenerator.uploadImage(image_url1, price1)
                  await expect(myNFTOffchainGenerator.mintNft(0)).to.be.revertedWith(
                      "MyNFTOffchainGenerator__ContractNotOpen"
                  )
              })
              it("User can mint an NFT", async function () {
                  const image_url1 = "http://ipfs.io/ipfs/dur30ru0ru0eur90ee"
                  const price1 = 100
                  const amountinEth = ethers.utils.parseEther("1")
                  await myNFTOffchainGenerator.uploadImage(image_url1, price1)
                  await myNFTOffchainGenerator.mintNft(0, { value: amountinEth })
                  const data = await myNFTOffchainGenerator.getImageDetailsByToken(0)
                  assert.equal(data[2].toNumber(), 1)
              })
              it("User can mint an NFT and emit an event when minted", async function () {
                  const image_url1 = "http://ipfs.io/ipfs/dur30ru0ru0eur90ee"
                  const price1 = 100
                  const amountinEth = ethers.utils.parseEther("1")
                  await myNFTOffchainGenerator.uploadImage(image_url1, price1)
                  await expect(myNFTOffchainGenerator.mintNft(0, { value: amountinEth }))
                      .to.emit(myNFTOffchainGenerator, "NFTMinted")
                      .withArgs(deployer.address, 0, image_url1, price1)
              })
          })
          describe("IsOwner", () => {
              it("check if a user is owner", async function () {
                  const playerAddress = deployer.address
                  const isowner = await myNFTOffchainGenerator.isOwner(playerAddress)
                  const isownerByRequest = await myNFTOffchainGenerator.checkRequesterIsOwner()
                  assert.equal(isowner, true)
                  assert.equal(isownerByRequest, true)
              })
          })
          describe("WithdrawProceeds", () => {
              it("owner can withdraw the proceeds", async function () {
                  const image_url1 = "http://ipfs.io/ipfs/dur30ru0ru0eur90ee"
                  const price1 = 100
                  const amountinEth = ethers.utils.parseEther("1")
                  const accountbalanceBefore = await myNFTOffchainGenerator.contractBalance()
                  await myNFTOffchainGenerator.uploadImage(image_url1, price1)
                  await myNFTOffchainGenerator.mintNft(0, { value: amountinEth })

                  const accountbalanceAfter = await myNFTOffchainGenerator.contractBalance()
                  await myNFTOffchainGenerator.withdrawProceeds()
                  const accountbalanceAfterWithdrawal =
                      await myNFTOffchainGenerator.contractBalance()
                  assert.equal(accountbalanceBefore.toNumber(), 0)
                  assert.equal(accountbalanceAfterWithdrawal.toNumber(), 0)
                  assert(accountbalanceAfter.toString(), ethers.utils.parseEther("1").toString())
              })
              it("error due to no fund", async function () {
                  await expect(myNFTOffchainGenerator.withdrawProceeds()).to.be.revertedWith(
                      "MyNFTOffchainGenerator__NoProceeds"
                  )
              })
          })
          describe("SetNFTPrice", () => {
              it("set the price of an nft by owner", async function () {
                  const image_url1 = "http://ipfs.io/ipfs/dur30ru0ru0eur90ee"
                  const price1 = 100
                  await myNFTOffchainGenerator.uploadImage(image_url1, price1)
                  await myNFTOffchainGenerator.setNFTPrice(0, 400)
                  const data = await myNFTOffchainGenerator.getImageDetailsByUploadToken(0)
                  assert.equal(data[1].toNumber(), 400)
              })
          })
          describe("tokenURI", () => {
              it("get the token url of a particular NFT", async function () {
                  const image_url1 = "http://ipfs.io/ipfs/dur30ru0ru0eur90ee"
                  const price1 = 100
                  const amountinEth = ethers.utils.parseEther("1")
                  await myNFTOffchainGenerator.uploadImage(image_url1, price1)
                  await myNFTOffchainGenerator.mintNft(0, { value: amountinEth })
                  const tokenurl = await myNFTOffchainGenerator.tokenURI(0)
                  assert.equal(tokenurl, image_url1)
              })
              it("get the token url with unexisting token", async function () {
                  const image_url1 = "http://ipfs.io/ipfs/dur30ru0ru0eur90ee"
                  const price1 = 100
                  const amountinEth = ethers.utils.parseEther("1")
                  await myNFTOffchainGenerator.uploadImage(image_url1, price1)
                  await myNFTOffchainGenerator.mintNft(0, { value: amountinEth })
                  const tokenurl = await myNFTOffchainGenerator.tokenURI(0)
                  assert.equal(tokenurl, image_url1)
                  await expect(myNFTOffchainGenerator.tokenURI(23)).to.be.revertedWith(
                      "ERC721Metadata__URI_QueryFor_NonExistentToken"
                  )
              })
          })
      })
