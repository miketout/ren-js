export enum RenNetwork {
    Mainnet = "mainnet",
    Chaosnet = "chaosnet",
    Testnet = "testnet",
    Devnet = "devnet",
    Localnet = "localnet",

    // Staging
    StagingTestnet = "staging-testnet",
}

export type RenNetworkString =
    | "mainnet"
    | "chaosnet"
    | "testnet"
    | "devnet"
    | "localnet"
    | "staging-testnet";

export const RenNetworks = [
    RenNetwork.Mainnet,
    RenNetwork.Chaosnet,
    RenNetwork.Testnet,
    RenNetwork.Devnet,
    RenNetwork.Localnet,
    RenNetwork.StagingTestnet,
];
export const isRenNetwork = (
    // tslint:disable-next-line: no-any
    maybeRenNetwork: any,
): maybeRenNetwork is RenNetwork => RenNetworks.indexOf(maybeRenNetwork) !== -1; // tslint:disable-line: no-any
export const isTestnet = (renNetwork: RenNetwork) =>
    renNetwork !== RenNetwork.Mainnet && renNetwork !== RenNetwork.Chaosnet;

export type Chain = string;

export type Asset = string;

export type RenContract = string;
