// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;


import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import { IERC20ETHValueProvider } from "./interface/IERC20ETHValueProvider.sol";


contract USDCV1EMPETHValueProvider is
	IERC20ETHValueProvider
{
	AggregatorV3Interface internal _eTHUSDAggregatorV3Interface;
	AggregatorV3Interface internal _uSDUSDAggregatorV3Interface;


	constructor (address __eTHUSDAggregatorV3Interface, address __uSDUSDAggregatorV3Interface)
	{
		_eTHUSDAggregatorV3Interface = AggregatorV3Interface(__eTHUSDAggregatorV3Interface);
		_uSDUSDAggregatorV3Interface = AggregatorV3Interface(__uSDUSDAggregatorV3Interface);
	}


	/// @inheritdoc IERC20ETHValueProvider
	function utilizedERC20ETHValue()
		public
		view
		override
		returns (uint256)
	{
		// Get the latest ETH/USD price
		(, int256 ethUsdPrice, , , ) = _eTHUSDAggregatorV3Interface.latestRoundData();

		// Get the latest USDC/USD price
		(, int256 usdcUsdPrice, , , ) = _uSDUSDAggregatorV3Interface.latestRoundData();

		uint8 ethDecimals = _eTHUSDAggregatorV3Interface.decimals();
		uint8 usdcDecimals = _uSDUSDAggregatorV3Interface.decimals();

		// Ensure prices are positive
		require(ethUsdPrice > 0 && usdcUsdPrice > 0, "Invalid price");

		// Normalize to 18 decimals
		uint256 normalizedEthUsdPrice = uint256(ethUsdPrice) * 10 ** (18 - ethDecimals);
		uint256 normalizedUsdcUsdPrice = uint256(usdcUsdPrice) * 10 ** (18 - usdcDecimals);

		// Calculate USDC price in ETH
		return (normalizedUsdcUsdPrice * 1e18) / normalizedEthUsdPrice;
	}

	/// @inheritdoc IERC20ETHValueProvider
	function eRC20Decimals()
		public
		view
		override
		returns (uint8)
	{
		return _uSDUSDAggregatorV3Interface.decimals();
	}
}
