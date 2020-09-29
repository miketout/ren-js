import { Machine, assign, send, Actor } from "xstate";
import RenJS from "@renproject/ren";
import { GatewaySession, GatewayTransaction } from "../types/transaction";
import { LockChain, MintChain } from "@renproject/interfaces";
import { depositMachine } from "./deposit";

export interface GatewayMachineContext {
    tx: GatewaySession; // The session arguments used for instantiating a mint gateway
    signatureRequest?: string;
    depositMachines?: { [key in string]: Actor<typeof depositMachine> }; // Keeps track of child machines that track underlying deposits
    depositListenerRef?: Actor<any>; // a listener callback that interacts with renjs deposit objects
    providers: any; // Providers needed for LockChains
    fromChainMap: {
        [key in string]: (context: GatewayMachineContext) => LockChain<any>;
    }; // Functions to create the "from" param;
    toChainMap: {
        [key in string]: (context: GatewayMachineContext) => MintChain<any>;
    }; // Functions to create the "to" param;
    sdk: RenJS;
}

export interface GatewayMachineSchema {
    states: {
        restoring: {};
        created: {};
        srcInitializeError: {};
        listening: {};
        requestingSignature: {};
        completed: {};
    };
}

const findClaimableDeposit = ({ depositMachines }: GatewayMachineContext) => {
    if (!depositMachines) return;
    for (let key in depositMachines || {}) {
        const machine = depositMachines[key];
        if (machine.state.value === "accepted") {
            return machine.state.context.deposit;
        }
    }
};

export type GatewayMachineEvent =
    | { type: "DEPOSIT"; data: GatewayTransaction }
    | { type: "DEPOSIT_UPDATE"; data: GatewayTransaction }
    | { type: "DEPOSIT_COMPLETED"; data: GatewayTransaction }
    | { type: "REQUEST_SIGNATURE"; data: GatewayTransaction }
    | { type: "SIGN"; data: GatewayTransaction }
    | { type: "EXPIRED"; data: GatewayTransaction }
    | { type: "ACKNOWLEDGE"; data: any }
    | { type: "RESTORE"; data: GatewayTransaction };

export const mintMachine = Machine<
    GatewayMachineContext,
    GatewayMachineSchema,
    GatewayMachineEvent
>(
    {
        id: "RenVMGatewaySession",
        initial: "restoring",
        states: {
            restoring: {
                entry: [
                    send("RESTORE"),
                    assign({ depositMachines: (_ctx, _evt) => ({}) }),
                ],
                on: {
                    RESTORE: [
                        {
                            target: "listening",
                            actions: "depositMachineSpawner",
                            cond: "isCreated",
                        },
                        {
                            target: "completed",
                            cond: "isExpired",
                        },
                        {
                            target: "created",
                        },
                    ],
                },
            },

            created: {
                invoke: {
                    src: "txCreator",
                    onDone: {
                        target: "listening",
                        actions: assign({
                            tx: (_context, evt) => ({ ...evt.data }),
                        }),
                    },
                    onError: {
                        target: "srcInitializeError",
                        actions: assign({
                            tx: (context, evt) => {
                                console.error(evt);
                                const newTx = {
                                    ...context.tx,
                                    error: evt.data || true,
                                };
                                return newTx;
                            },
                        }),
                    },
                },
            },

            srcInitializeError: {},
            listening: {
                // entry: "listenerAction",
                invoke: {
                    src: "depositListener",
                },
                on: {
                    EXPIRED: "completed",
                    DEPOSIT_COMPLETED: {
                        target: "completed",
                        cond: "isCompleted",
                    },
                    DEPOSIT_UPDATE: [
                        {
                            cond: "isRequestingSignature",
                            actions: assign({
                                signatureRequest: (_context, evt) => {
                                    return evt.data.sourceTxHash;
                                },
                                tx: (context, evt) => {
                                    if (evt.data.sourceTxHash) {
                                        context.tx.transactions[
                                            evt.data.sourceTxHash
                                        ] = evt.data;
                                    }
                                    return context.tx;
                                },
                            }),
                            target: "requestingSignature",
                        },
                        {
                            actions: assign({
                                tx: (context, evt) => {
                                    if (evt.data.sourceTxHash) {
                                        context.tx.transactions[
                                            evt.data.sourceTxHash
                                        ] = evt.data;
                                    }
                                    return context.tx;
                                },
                            }),
                        },
                    ],
                    DEPOSIT: {
                        actions: [
                            assign({
                                tx: (context, evt) => {
                                    if (evt.data.sourceTxHash) {
                                        context.tx.transactions[
                                            evt.data.sourceTxHash
                                        ] = evt.data;
                                    }
                                    return context.tx;
                                },
                            }),
                            "depositMachineSpawner",
                        ],
                    },
                },
            },
            requestingSignature: {
                on: {
                    SIGN: {
                        target: "listening",
                        actions: send("CLAIM", {
                            to: (ctx, evt) => {
                                if (!ctx.depositMachines) return "";
                                return ctx.depositMachines[
                                    ctx.signatureRequest || ""
                                ];
                            },
                        }),
                    },
                },
            },
            completed: {},
        },
    },
    {
        actions: {
            listenerAction: () => {},
        },
        services: {
            create: async () => {
                return {};
            },
        },
        guards: {
            isRequestingSignature: (ctx) =>
                findClaimableDeposit(ctx) ? true : false,
            isCompleted: ({ tx }, evt) =>
                evt.data.sourceTxAmount >= tx.targetAmount,
            isExpired: ({ tx }) => (tx.expiryTime || 0) < new Date().getTime(),
            isCreated: ({ tx }) => (tx.gatewayAddress ? true : false),
        },
    }
);