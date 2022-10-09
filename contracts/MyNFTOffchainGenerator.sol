// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.8;

//////////////
// imports //
/////////////////////////////////////////////////////////////

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";


////////////
// error //
////////////////////////////////////////////////////////////

error ERC721Metadata__URI_QueryFor_NonExistentToken();
error MyNFTOffchainGenerator__InsufficientFund();
error MyNFTOffchainGenerator__NoProceeds();
error MyNFTOffchainGenerator__ContractNotOpen();

/**
 * @title A NFT UPloadable Onchain SVG Minter
 * @author Odeyemi Increase Ayobami
 * @notice Use this contract for only the most basic simulation
 * @dev Contract under development to enable floating point
 */
contract MyNFTOffchainGenerator is ERC721, Ownable {
    ////////////
    // Types //
    ////////////////////////////////////////////////////////////

    struct Image {
        string image;
        uint256 price;
        uint256 tokenCounter;  
    }

    enum ContractState {
        OPEN,
        CLOSED
    }
    /////////////
    // Events //
    ////////////////////////////////////////////////////////////

    event NFTMinted(address indexed sender,uint256 indexed tokenId, string indexed image, uint256 price);

    event NFTCreated(uint256 indexed tokenId, string indexed image, uint256 price);

    ////////////////
    // Variables //
    ////////////////////////////////////////////////////////////////

    // storage
    mapping(uint256 => Image) private s_tokenIdToImage;
    mapping(uint256 => uint256) private s_tokenMintedToUploadToken;
    uint256 private s_tokenCounter;
    uint256 private s_mintedTokenCounter;
    ContractState private s_contractState;
    // immutable
    AggregatorV3Interface internal immutable i_priceFeed;

    ////////////////////////
    // special Functions //
    //////////////////////////////////////////////////////////////////////

    constructor(address priceFeedAddress) ERC721("Increase-SVG-NFT", "I-NFT") {
        s_tokenCounter = 0;
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
        s_contractState = ContractState.OPEN;
    }

    /////////////////////
    // Main Functions //
    //////////////////////////////////////////////////////////////////////
    /**
     * @notice This Function is used to upload an SVG that will be saved on chain
     * @dev Not working with decimal numbers
     * @param image The image_url to the  meta-data to be uploaded
     * @param price How much the svg worth
     */

    function uploadImage(string memory image, uint256 price) public onlyOwner {
        s_tokenIdToImage[s_tokenCounter] = Image(image, price,0);
        emit NFTCreated(s_tokenCounter, image, price);
        s_tokenCounter = s_tokenCounter + 1;
    }

    function mintNft(uint256 tokenId) public payable {
        if (s_contractState != ContractState.OPEN) {
            revert MyNFTOffchainGenerator__ContractNotOpen();
        }
        Image storage image = s_tokenIdToImage[tokenId];
        uint256 ethInDollar = convertEthToDollar(msg.value);
        uint256 image_price = image.price * 1e16;
        //console.log(image_price, msg.value, ethInDollar,ethInDollar >= image_price);
        if (ethInDollar < image_price || msg.value == 0) {
            revert MyNFTOffchainGenerator__InsufficientFund();
        }
        uint256 token = s_mintedTokenCounter;
        s_tokenMintedToUploadToken[token] = tokenId;
        s_mintedTokenCounter += 1;
        image.tokenCounter += 1;
        _safeMint(msg.sender, token);
        emit NFTMinted(msg.sender ,token, image.image, image.price);
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        if (!_exists(tokenId)) {
            revert ERC721Metadata__URI_QueryFor_NonExistentToken();
        }
        string memory imageURI = s_tokenIdToImage[tokenId].image;
        return imageURI;
    }

    //////////////////////////////
    // View Or Pure Functions  //
    /////////////////////////////////////////////////////////////////////////////

    function getLatestPrice() public view returns (uint256) {
        // GeorliETH / USD Address
        // https://docs.chain.link/docs/ethereum-addresses/
        (, int256 answer, , , ) = i_priceFeed.latestRoundData();
        // ETH/USD rate in 18 digit
        return uint256(answer);
    }

    function convertEthToDollar(uint256 ethAmount) public view returns (uint256) {
        uint256 ethPrice = getLatestPrice();
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        // the actual ETH/USD conversion rate, after adjusting the extra 0s.
        return ethAmountInUsd;
    }

    function isOwner(address _player) public view returns (bool) {
        return owner() == _player;
    }
    function contractBalance() public view onlyOwner returns(uint256) {

        return address(this).balance;
    }
    function checkRequesterIsOwner() public view returns (bool) {
        return owner() == msg.sender;
    }

    function getContractState() public view returns (ContractState) {
        return s_contractState;
    }

    function setContractState(ContractState _value) public onlyOwner {
        s_contractState = _value;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function setNFTPrice(uint256 token, uint256 _value) public  onlyOwner {
        Image storage image = s_tokenIdToImage[token];
        image.price = _value;
    }

    function withdrawProceeds() external onlyOwner {
        uint256 proceeds = address(this).balance;
        if (proceeds <= 0) {
            revert MyNFTOffchainGenerator__NoProceeds();
        }
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        require(success, "Transfer failed");
    }

    function getImageDetailsByUploadToken(uint256 tokenId)
        external
        view
        returns (string memory, uint256, uint256)
    {
        Image memory image = s_tokenIdToImage[tokenId];
        return (image.image, image.price, image.tokenCounter);
    }

    function getImageDetailsByToken(uint256 token)
        external
        view
        returns (string memory, uint256, uint256)
    {
        uint256 tokenId = s_tokenMintedToUploadToken[token];
        Image memory image = s_tokenIdToImage[tokenId];
        return (image.image, image.price, image.tokenCounter);
    }
}
