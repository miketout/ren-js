import BigNumber from "bignumber.js";

import { DepositCommon, LockChain, MintChain } from "./chain";
import { EthArgs } from "./ethArgs";

export type BNInterface = { toString(x?: "hex"): string };
export type NumberValue = string | number | BigNumber | BNInterface;

export type RenTokens = string;

/**
 * The details required to create and/or submit a transaction to Ethereum.
 */
export interface ContractCall {
    /**
     * The address of the adapter smart contract.
     */
    sendTo: string;

    /**
     * The name of the function to be called on the Adapter contract.
     */
    contractFn: string;

    /**
     * The parameters to be passed to the adapter contract.
     */
    contractParams?: EthArgs;

    /**
     * Set transaction options:.
     */
    txConfig?: unknown;
}

/**
 * The parameters required for both minting and burning.
 */
export interface TransferParamsCommon {
    asset: string;

    /**
     * Provide the transaction hash returned from RenVM to continue a previous
     * mint.
     */
    txHash?: string;

    /**
     * An option to override the default nonce generated randomly.
     */
    nonce?: Buffer | string;

    /**
     * Provide optional tags which can be used to look up transfers in the
     * lightnodes.
     */
    tags?: [string]; // Currently, only one tag can be provided.
}

/**
 * The parameters for a cross-chain transfer onto Ethereum.
 */
export interface LockAndMintParams<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    LockTransaction = any,
    LockDeposit extends DepositCommon<LockTransaction> = DepositCommon<
        LockTransaction
    >,
    LockAddress = string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MintTransaction = any,
    MintAddress = string
> extends TransferParamsCommon {
    from: LockChain<LockTransaction, LockDeposit, LockAddress>;
    to: MintChain<MintTransaction, MintAddress>;

    /**
     * The amount of `sendToken` that should be sent.
     */
    suggestedAmount?: NumberValue;

    /**
     * The number of confirmations to wait before submitting the signature
     * to Ethereum. If this number is less than the default, the RenVM
     * transaction is returned when those confirmations have passed, before
     * the signature is available, and will not be submitted to Ethereum.
     */
    confirmations?: number;

    /**
     * Details for submitting one or more Ethereum transactions. The last one
     * will be augmented with the three required parameters for minting - the
     * amount, nHash and RenVM signature.
     */
    contractCalls?: ContractCall[];

    /**
     * Specify which deposit should be send to RenVM instead of waiting for one
     * to be observed. This deposit must have been sent to the gateway address
     * of the transfer.
     */
    // deposit?: UTXOIndex;

    /**
     * Specify a gateway address. Gateway addresses are based on the RenVM shard
     * selected to process the transfer. Currently there is only one RenVM
     * shard, but once sharding is live, this parameter will ensure that the
     * same address can be used to resume the transfer.
     */
    gatewayAddress?: LockAddress;
}

/**
 * BurnAndReleaseParams define the parameters for a cross-chain transfer away
 * from Ethereum.
 */
export interface BurnAndReleaseParams<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    LockTransaction = any,
    LockDeposit extends DepositCommon<LockTransaction> = DepositCommon<
        LockTransaction
    >,
    LockAddress = string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MintTransaction = any,
    MintAddress = string
> extends TransferParamsCommon {
    from: MintChain<MintTransaction, MintAddress>;
    to: LockChain<LockTransaction, LockDeposit, LockAddress>;

    /**
     * The hash of the burn transaction on Ethereum.
     */
    transaction?: MintTransaction;

    /**
     * The reference ID of the burn emitted in the contract log.
     */
    burnNonce?: string | number;

    /**
     * Details for submitting one or more Ethereum transactions. The last one
     * should trigger a burn event in the relevant Gateway contract.
     */
    contractCalls?: ContractCall[];
}

export type SerializableBurnAndReleaseParams = Exclude<
    BurnAndReleaseParams,
    "web3Provider"
>;
export type SerializableLockAndMintParams = Exclude<
    LockAndMintParams,
    "web3Provider"
>;

export type TransferParams = LockAndMintParams | BurnAndReleaseParams;
export type SerializableTransferParams =
    | SerializableLockAndMintParams
    | SerializableBurnAndReleaseParams;
