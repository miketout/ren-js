import BasicAdapter from "@renproject/sol/build/chaosnet/BasicAdapter.json";
import BCHGateway from "@renproject/sol/build/chaosnet/BCHGateway.json";
import BTCGateway from "@renproject/sol/build/chaosnet/BTCGateway.json";
import DarknodePayment from "@renproject/sol/build/chaosnet/DarknodePayment.json";
import DarknodePaymentStore from "@renproject/sol/build/chaosnet/DarknodePaymentStore.json";
import DarknodeRegistryLogic from "@renproject/sol/build/chaosnet/DarknodeRegistryLogicV1.json";
import DarknodeRegistryProxy from "@renproject/sol/build/chaosnet/DarknodeRegistryProxy.json";
import DarknodeRegistryStore from "@renproject/sol/build/chaosnet/DarknodeRegistryStore.json";
import DarknodeSlasher from "@renproject/sol/build/chaosnet/DarknodeSlasher.json";
import GatewayLogic from "@renproject/sol/build/chaosnet/GatewayLogicV1.json";
import GatewayRegistry from "@renproject/sol/build/chaosnet/GatewayRegistry.json";
import ProtocolLogic from "@renproject/sol/build/chaosnet/ProtocolLogicV1.json";
import ProtocolProxy from "@renproject/sol/build/chaosnet/ProtocolProxy.json";
import RenBCH from "@renproject/sol/build/chaosnet/RenBCH.json";
import RenBTC from "@renproject/sol/build/chaosnet/RenBTC.json";
import RenToken from "@renproject/sol/build/chaosnet/RenToken.json";
import RenZEC from "@renproject/sol/build/chaosnet/RenZEC.json";
import ZECGateway from "@renproject/sol/build/chaosnet/ZECGateway.json";
import ERC20 from "@renproject/sol/build/erc/ERC20.json";
import { AbiItem } from "web3-utils";

import { CastNetwork, Contract } from "./network";

const networkID = 1;

// mintAuthority is generated by
// > utils.toChecksumAddress(utils.pubToAddress("... public key ...", true).toString("hex"))

export const renChaosnet = CastNetwork({
    version: "1.0.0",
    name: "chaosnet" as "chaosnet",
    chain: "main",
    isTestnet: false,
    label: "Chaosnet",
    chainLabel: "Mainnet",
    networkID,
    infura: "https://mainnet.infura.io",
    etherscan: "https://etherscan.io",
    lightnode: "https://lightnode-chaosnet-new.herokuapp.com",
    addresses: {
        ren: {
            Protocol: {
                address: ProtocolProxy.networks[networkID].address,
                abi: ProtocolLogic.abi as AbiItem[],
                artifact: ProtocolProxy as Contract,
            },
            DarknodeSlasher: {
                address: DarknodeSlasher.networks[networkID].address,
                abi: DarknodeSlasher.abi as AbiItem[],
                artifact: DarknodeSlasher as Contract,
            },
            DarknodeRegistry: {
                address: DarknodeRegistryProxy.networks[networkID].address,
                abi: DarknodeRegistryLogic.abi as AbiItem[],
                artifact: DarknodeRegistryLogic as Contract,
                block: 9828748,
            },
            DarknodeRegistryStore: {
                address: DarknodeRegistryStore.networks[networkID].address,
                abi: DarknodeRegistryStore.abi as AbiItem[],
                artifact: DarknodeRegistryStore as Contract,
            },
            DarknodePayment: {
                address: DarknodePayment.networks[networkID].address,
                abi: DarknodePayment.abi as AbiItem[],
                artifact: DarknodePayment as Contract,
            },
            DarknodePaymentStore: {
                address: DarknodePaymentStore.networks[networkID].address,
                abi: DarknodePaymentStore.abi as AbiItem[],
                artifact: DarknodePaymentStore as Contract,
            },
        },
        gateways: {
            GatewayRegistry: {
                address: GatewayRegistry.networks[networkID].address,
                abi: GatewayRegistry.abi as AbiItem[],
                artifact: GatewayRegistry as Contract,
            },
            RenBTC: {
                _address: RenBTC.networks[networkID].address,
                abi: RenBTC.abi as AbiItem[],
                artifact: RenBTC as Contract,
                description: "gatewayRegistry.getTokenBySymbol(\"BTC\")",
            },
            BTCGateway: {
                _address: BTCGateway.networks[networkID].address,
                abi: GatewayLogic.abi as AbiItem[],
                artifact: GatewayLogic as Contract,
                description: "gatewayRegistry.getGatewayBySymbol(\"BTC\")",
            },
            RenZEC: {
                _address: RenZEC.networks[networkID].address,
                abi: RenZEC.abi as AbiItem[],
                artifact: RenZEC as Contract,
                description: "gatewayRegistry.getTokenBySymbol(\"ZEC\")",
            },
            ZECGateway: {
                _address: ZECGateway.networks[networkID].address,
                abi: GatewayLogic.abi as AbiItem[],
                artifact: GatewayLogic as Contract,
                description: "gatewayRegistry.getGatewayBySymbol(\"ZEC\")",
            },
            RenBCH: {
                _address: RenBCH.networks[networkID].address,
                abi: RenBCH.abi as AbiItem[],
                artifact: RenBCH as Contract,
                description: "gatewayRegistry.getTokenBySymbol(\"BCH\")",
            },
            BCHGateway: {
                _address: BCHGateway.networks[networkID].address,
                abi: GatewayLogic.abi as AbiItem[],
                artifact: GatewayLogic as Contract,
                description: "gatewayRegistry.getGatewayBySymbol(\"BCH\")",
            },
            BasicAdapter: {
                address: BasicAdapter.networks[networkID].address,
                abi: BasicAdapter.abi as AbiItem[],
                artifact: BasicAdapter as Contract,
            },
        },
        tokens: {
            DAI: {
                address: "0x6b175474e89094c44da98b954eedeac495271d0f",
                decimals: 18,
            },
            BTC: {
                address: RenBTC.networks[networkID].address,
                abi: RenBTC.abi as AbiItem[],
                artifact: RenBTC as Contract,
                decimals: 8
            },
            ZEC: {
                address: RenZEC.networks[networkID].address,
                abi: RenZEC.abi as AbiItem[],
                artifact: RenZEC as Contract,
                decimals: 8
            },
            BCH: {
                address: RenBCH.networks[networkID].address,
                abi: RenBCH.abi as AbiItem[],
                artifact: RenBCH as Contract,
                decimals: 8
            },
            REN: {
                address: RenToken.networks[networkID].address,
                abi: RenToken.abi as AbiItem[],
                artifact: RenToken as Contract,
                decimals: 18
            },
            ETH: {
                address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
                decimals: 18
            },
        },
        erc: {
            ERC20: {
                abi: ERC20.abi as AbiItem[],
                artifact: ERC20 as Contract,
            },
        }
    }
});
