import {
    BurnAndReleaseTransaction,
    getRenNetworkDetails,
    LockAndMintTransaction,
    Logger,
    NullLogger,
    RenNetwork,
    RenNetworkDetails,
    RenNetworkString,
    SyncOrPromise,
    TxStatus,
} from "@renproject/interfaces";
import BigNumber from "bignumber.js";

import { AbstractRenVMProvider } from "./";
import { RenVMProvider as V1Provider } from "./v1";
import { RenVMParams, RenVMProvider as V2Provider, RenVMResponses } from "./v2";

const isV1Selector = (selector: string) => {
    return (
        [
            "BTC0Btc2Eth",
            "BTC0Eth2Btc",
            "ZEC0Zec2Eth",
            "ZEC0Eth2Zec",
            "BCH0Bch2Eth",
            "BCH0Eth2Bch",
        ].indexOf(selector) >= 0
    );
};

export class CombinedProvider
    implements AbstractRenVMProvider<RenVMParams, RenVMResponses>
{
    public v1?: V1Provider;
    public v2: V2Provider;
    public sendMessage: AbstractRenVMProvider["sendMessage"];

    public network: RenNetworkDetails;

    constructor(
        network: RenNetwork | RenNetworkString | RenNetworkDetails,
        logger: Logger = NullLogger,
    ) {
        this.network = getRenNetworkDetails(network);

        if (
            this.network.name === RenNetwork.Mainnet ||
            this.network.name === RenNetwork.Testnet
        ) {
            this.v1 = new V1Provider(this.network, undefined, logger);
        }
        this.v2 = new V2Provider(this.network, undefined, logger);

        // Default to the v2 network.
        this.sendMessage = this.v2.sendMessage;
    }

    selector = (params: Parameters<AbstractRenVMProvider["selector"]>[0]) => {
        const v1Selector = this.v1 && this.v1.selector(params);
        return v1Selector && isV1Selector(v1Selector)
            ? v1Selector
            : this.v2.selector(params);
    };

    version = (selector: string) => (isV1Selector(selector) ? 1 : 2);

    mintTxHash = (
        params: Parameters<AbstractRenVMProvider["mintTxHash"]>[0],
    ): Buffer =>
        this.v1 && isV1Selector(params.selector)
            ? this.v1.mintTxHash(params)
            : this.v2.mintTxHash(params);

    submitMint = (
        params: Parameters<AbstractRenVMProvider["submitMint"]>[0],
    ): SyncOrPromise<Buffer> =>
        this.v1 && isV1Selector(params.selector)
            ? this.v1.submitMint(params)
            : this.v2.submitMint(params);

    burnTxHash = (params: {
        // v2
        selector: string;
        gHash: Buffer;
        gPubKey: Buffer;
        nHash: Buffer;
        nonce: Buffer;
        output: { txid: Buffer; txindex: string };
        amount: string;
        payload: Buffer;
        pHash: Buffer;
        to: string;
    }): Buffer => {
        if (isV1Selector(params.selector)) {
            throw new Error(
                `Fetching burn txHash is not supported for ${params.selector}`,
            );
        }
        return this.v2.burnTxHash(params);
    };

    submitBurn = (
        params: Parameters<AbstractRenVMProvider["submitBurn"]>[0],
    ): SyncOrPromise<Buffer> =>
        this.v1 && isV1Selector(params.selector)
            ? this.v1.submitBurn(params)
            : this.v2.submitBurn(params);

    queryMintOrBurn = <
        T extends LockAndMintTransaction | BurnAndReleaseTransaction,
    >(
        selector: string,
        utxoTxHash: Buffer,
        retries?: number,
    ): SyncOrPromise<T> =>
        this.v1 && isV1Selector(selector)
            ? this.v1.queryMintOrBurn<T>(selector, utxoTxHash, retries)
            : this.v2.queryMintOrBurn<T>(selector, utxoTxHash, retries);

    waitForTX = <T extends LockAndMintTransaction | BurnAndReleaseTransaction>(
        selector: string,
        utxoTxHash: Buffer,
        onStatus?: (status: TxStatus) => void,
        cancelRequested?: () => boolean,
        timeout?: number,
    ): SyncOrPromise<T> =>
        this.v1 && isV1Selector(selector)
            ? this.v1.waitForTX<T>(
                  selector,
                  utxoTxHash,
                  onStatus,
                  cancelRequested,
                  timeout,
              )
            : this.v2.waitForTX<T>(
                  selector,
                  utxoTxHash,
                  onStatus,
                  cancelRequested,
                  timeout,
              );

    /**
     * selectPublicKey fetches the key for the RenVM shard handling
     * the provided contract.
     *
     * @returns The key hash (20 bytes) as a string.
     */
    selectPublicKey = (
        selector: string,
        assetOrChain: string,
    ): SyncOrPromise<Buffer> =>
        this.v1 && isV1Selector(selector)
            ? this.v1.selectPublicKey(selector, assetOrChain)
            : this.v2.selectPublicKey(selector, assetOrChain);

    /**
     * Used to query what network a custom provider is connected to. LockAndMint
     * and BurnAndRelease use this to configure their chain parameters.
     */
    getNetwork = (
        selector: string,
    ): SyncOrPromise<RenNetwork | RenNetworkString | RenNetworkDetails> =>
        this.v1 && isV1Selector(selector)
            ? this.v1.getNetwork(selector)
            : this.v2.getNetwork(selector);

    public getConfirmationTarget = async (
        selector: string,
        chain: { name: string },
    ) =>
        this.v1 && isV1Selector(selector)
            ? this.v1.getConfirmationTarget(selector, chain)
            : this.v2.getConfirmationTarget(selector, chain);

    public estimateTransactionFee = async (
        asset: string,
        lockChain: { name: string },
        hostChain: { name: string },
    ): Promise<{
        lock: BigNumber;
        release: BigNumber;
        mint: number;
        burn: number;
    }> => this.v2.estimateTransactionFee(asset, lockChain, hostChain);
}
