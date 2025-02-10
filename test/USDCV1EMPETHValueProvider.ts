import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";


describe("USDCV1EMPETHValueProvider", function () {
	const ETH_USD_PRICE = ethers.utils.parseUnits("1800", 8);
	const USDC_USD_PRICE = ethers.utils.parseUnits("1", 8);

	let eTHUSDAggregatorV3Interface: Contract;
	let uSDUSDAggregatorV3Interface: Contract;
	let valueProvider: Contract;
	let deployer: Signer;


	beforeEach(async () => {
		[deployer] = await ethers.getSigners();

		const MockAggregator = await ethers.getContractFactory("MockV3Aggregator");

		eTHUSDAggregatorV3Interface = await MockAggregator.deploy(8, ETH_USD_PRICE);
		uSDUSDAggregatorV3Interface = await MockAggregator.deploy(8, USDC_USD_PRICE);

		await eTHUSDAggregatorV3Interface.deployed();
		await uSDUSDAggregatorV3Interface.deployed();

		const ValueProvider = await ethers.getContractFactory("USDCV1EMPETHValueProvider");

		valueProvider = await ValueProvider.deploy(eTHUSDAggregatorV3Interface.address, uSDUSDAggregatorV3Interface.address);

		await valueProvider.deployed();
	});


	describe("function utilizedERC20ETHValue()", function () {
		describe("Expected Failure", function () {
			it("Should revert if USDC/ETH price is zero..", async () => {
				// Set ETH/USD price to zero
				await eTHUSDAggregatorV3Interface.updateAnswer(0);

				await expect(valueProvider.utilizedERC20ETHValue()).to.be.revertedWith("Invalid price");
			});

			it("Should revert if USDC/ETH price is zero..", async () => {
				// Set USDC/USD price to zero
				await uSDUSDAggregatorV3Interface.updateAnswer(0);

				await expect(valueProvider.utilizedERC20ETHValue()).to.be.revertedWith("Invalid price");
			});
		});

		describe("Expected Success", function () {
			it("should return the correct USDC/ETH..", async () => {
				const usdcInEth = await valueProvider.utilizedERC20ETHValue();

				const expectedUsdcInEth = USDC_USD_PRICE.mul(ethers.utils.parseUnits("1", 18)).div(ETH_USD_PRICE);

				expect(usdcInEth).to.equal(expectedUsdcInEth);
			});
		});
	});

	describe("function eRC20Decimals()", function () {
		describe("Expected Success", function () {
			it("should return the correct decimals for the USDC price feed", async () => {
				const decimals = await valueProvider.eRC20Decimals();

				// USDC price feed has 8 decimals
				expect(decimals).to.equal(8);
			});
		});
	});
});
