import * as React from "react";
import {
    AcceptedGatewayTransaction,
    CompletedGatewayTransaction,
    ConfirmingGatewayTransaction,
    DepositStates,
    ErroringGatewaySession,
    GatewaySession,
    GatewayStates,
    GatewayTransaction,
    isAccepted,
    isCompleted,
    isConfirming,
    isErroring,
    isOpen,
    isSubmitted,
    OpenedGatewaySession,
    SubmittingGatewayTransaction,
} from "@renproject/ren-tx";
import {
    MintConfigMultiple,
    MintConfigSingle,
    useDeposit,
    useLockAndMint,
} from "../useLockAndMint";

export interface ConfirmingDepositProps<X> {
    deposit: ConfirmingGatewayTransaction<X>;
    confirmations: number;
    explorerLink?: string;
    targetConfirmations?: number;
}

export const DefaultConfirmingDeposit: React.FC<ConfirmingDepositProps<any>> =
    ({ confirmations, targetConfirmations, explorerLink }) => {
        return (
            <div className="confirmingDeposit">
                Waiting for deposit confirmation {confirmations}/
                {targetConfirmations || "?"}
                {explorerLink && (
                    <div>
                        <a href={explorerLink}>Explorer Link</a>
                    </div>
                )}
            </div>
        );
    };

export interface SigningDepositProps {
    deposit: ConfirmingGatewayTransaction<any>;
}

export const DefaultSigningDeposit: React.FC<SigningDepositProps> = () => {
    return <div className="signingDeposit">Submitting to RenVM...</div>;
};

export interface SubmittingMintDepositProps {
    deposit: SubmittingGatewayTransaction<any>;
}

export const DefaultSubmittingMintDeposit: React.FC<SubmittingMintDepositProps> =
    () => {
        return (
            <div className="submittingMint">
                Please sign the transaction in your wallet
            </div>
        );
    };

export interface MintingDepositProps {
    deposit: SubmittingGatewayTransaction<any>;
}

export const DefaultMintingDeposit: React.FC<MintingDepositProps> = () => {
    return <div className="minting">Minting...</div>;
};

export interface AcceptedDepositProps {
    deposit: AcceptedGatewayTransaction<any>;
    mint: (params?: any) => void;
    amount: number;
}

export const DefaultAcceptedDeposit: React.FC<AcceptedDepositProps> = ({
    mint,
    amount,
}) => {
    return (
        <div className="acceptedDeposit">
            <button onClick={() => mint()}>Mint {amount}?</button>
        </div>
    );
};

export interface CompletedDepositProps {
    deposit: CompletedGatewayTransaction<any>;
    amount: number;
    tx: string;
    explorerLink?: string;
}

export const DefaultCompletedDeposit: React.FC<CompletedDepositProps> = ({
    amount,
    tx,
    explorerLink,
}) => {
    return (
        <div className="acceptedDeposit">
            Successfully minted {String(amount)}, tx: {String(tx)}
            {explorerLink && (
                <div>
                    <a href={explorerLink}>Explorer Link</a>
                </div>
            )}
        </div>
    );
};

export interface LoadingDepositProps {
    deposit: GatewayTransaction<any>;
}

export const DefaultLoadingDeposit: React.FC<LoadingDepositProps> = ({}) => {
    return <div className="loadingDeposit">Loading...</div>;
};

export interface RejectedDepositProps {
    deposit: GatewayTransaction<any>;
    reason: string;
}

export const DefaultRejectedDeposit: React.FC<RejectedDepositProps> = ({
    reason,
}) => {
    return <div className="rejectedDeposit">Rejected {reason}</div>;
};

export interface ErrorRestoringDepositProps {
    deposit: GatewayTransaction<any>;
    reason: string;
}

export const DefaultErrorRestoringDeposit: React.FC<ErrorRestoringDepositProps> =
    ({ reason }) => {
        return (
            <div className="errorRestoringDeposit">
                Error Restoring {reason}
            </div>
        );
    };

export interface ErrorMintingDepositProps {
    deposit: GatewayTransaction<any>;
    retry: (params?: any) => void;
    reason: string;
}

export const DefaultErrorMintingDeposit: React.FC<ErrorMintingDepositProps> = ({
    reason,
    retry,
}) => {
    return (
        <div className="errorMintingDeposit">
            Error Minting {reason}
            <button onClick={() => retry()}>Retry?</button>
        </div>
    );
};

export interface ErrorSigningDepositProps {
    deposit: GatewayTransaction<any>;
    reason: string;
}

export const DefaultErrorSigningDeposit: React.FC<ErrorSigningDepositProps> = ({
    reason,
}) => {
    return <div className="errorSigningDeposit">Error Signing {reason}</div>;
};

export interface DepositProps {
    session: ReturnType<typeof useLockAndMint>;
    depositId: string;
    currency: string;
    ConfirmingDeposit?: React.FC<ConfirmingDepositProps<any>>;
    SigningDeposit?: React.FC<SigningDepositProps>;
    AcceptedDeposit?: React.FC<AcceptedDepositProps>;
    SubmittingMintDeposit?: React.FC<SubmittingMintDepositProps>;
    MintingDeposit?: React.FC<MintingDepositProps>;
    CompletedDeposit?: React.FC<CompletedDepositProps>;
    LoadingDeposit?: React.FC<LoadingDepositProps>;
    RejectedDeposit?: React.FC<RejectedDepositProps>;
    ErrorMintingDeposit?: React.FC<ErrorMintingDepositProps>;
    ErrorRestoringDeposit?: React.FC<ErrorRestoringDepositProps>;
    ErrorSigningDeposit?: React.FC<ErrorSigningDepositProps>;
}

export const DefaultDeposit: React.FC<DepositProps> = ({
    session,
    depositId,
    ConfirmingDeposit = DefaultConfirmingDeposit,
    SigningDeposit = DefaultSigningDeposit,
    AcceptedDeposit = DefaultAcceptedDeposit,
    SubmittingMintDeposit = DefaultSubmittingMintDeposit,
    MintingDeposit = DefaultMintingDeposit,
    CompletedDeposit = DefaultCompletedDeposit,
    LoadingDeposit = DefaultLoadingDeposit,
    RejectedDeposit = DefaultRejectedDeposit,
    ErrorMintingDeposit = DefaultErrorMintingDeposit,
    ErrorRestoringDeposit = DefaultErrorRestoringDeposit,
    ErrorSigningDeposit = DefaultErrorSigningDeposit,
}) => {
    const machine = useDeposit(session, depositId);
    if (!machine) return <div>Missing deposit...</div>;
    const {
        deposit,
        value,
        mint,
        formatAmount,
        mintExplorerLink,
        depositExplorerLink,
    } = machine;
    switch (value) {
        case DepositStates.CONFIRMING_DEPOSIT:
            if (!isConfirming(deposit)) throw new Error("inconsistent state");
            return (
                <ConfirmingDeposit
                    deposit={deposit}
                    targetConfirmations={deposit.sourceTxConfTarget}
                    explorerLink={depositExplorerLink}
                    confirmations={deposit.sourceTxConfs || 0}
                />
            );
        case DepositStates.RENVM_SIGNING:
            if (!isConfirming(deposit)) throw new Error("inconsistent state");
            return <SigningDeposit deposit={deposit} />;
        case DepositStates.RENVM_ACCEPTED:
            if (!isAccepted(deposit)) throw new Error("inconsistent state");
            return (
                <AcceptedDeposit
                    mint={mint}
                    deposit={deposit}
                    amount={formatAmount(deposit.rawSourceTx.amount)}
                />
            );
        case DepositStates.SUBMITTING_MINT:
            if (!isSubmitted(deposit)) throw new Error("inconsistent state");
            return <SubmittingMintDeposit deposit={deposit} />;
        case DepositStates.MINTING:
            if (!isSubmitted(deposit)) throw new Error("inconsistent state");
            return <MintingDeposit deposit={deposit} />;
        case DepositStates.COMPLETED:
            if (!isCompleted(deposit)) throw new Error("inconsistent state");
            return (
                <CompletedDeposit
                    deposit={deposit}
                    amount={formatAmount(
                        (deposit.renResponse?.out as any)?.amount,
                    )}
                    tx={deposit.destTxHash || ""}
                    explorerLink={mintExplorerLink}
                />
            );
        case DepositStates.ERROR_MINTING:
            return (
                <ErrorMintingDeposit
                    deposit={deposit}
                    retry={mint}
                    reason={deposit.error?.message || ""}
                />
            );
        case DepositStates.ERROR_SIGNING:
            return (
                <ErrorSigningDeposit
                    deposit={deposit}
                    reason={deposit.error?.toString() || ""}
                />
            );
        case DepositStates.ERROR_RESTORING:
            return (
                <ErrorRestoringDeposit
                    deposit={deposit}
                    reason={deposit.error?.toString() || ""}
                />
            );
        case DepositStates.REJECTED:
            return (
                <RejectedDeposit
                    deposit={deposit}
                    reason={deposit.error?.toString() || ""}
                />
            );
        default:
            return <LoadingDeposit deposit={deposit} />;
    }
};

export interface BasicMintProps {
    parameters: MintConfigSingle | MintConfigMultiple;
    GatewayInfo?: typeof DefaultGatewayInfo;
    GatewayOpening?: typeof DefaultGatewayOpening;
    Deposit?: typeof DefaultDeposit;
    GatewayError?: typeof DefaultGatewayError;
}

export interface GatewayOpeningProps {
    session: GatewaySession<any>;
}

export const DefaultGatewayOpening: React.FC<GatewayOpeningProps> = ({
    session,
}) => {
    return (
        <div className="gateway-opening">
            Opening Gateway between {session.sourceChain} and{" "}
            {session.destChain}
        </div>
    );
};

export interface GatewayInfoProps {
    session: OpenedGatewaySession<any>;
}

export const DefaultGatewayInfo: React.FC<GatewayInfoProps> = ({ session }) => {
    return (
        <div className="gateway-info">
            Deposit {session.sourceAsset} at {session.gatewayAddress} before{" "}
            {new Date(session.expiryTime).toLocaleDateString()}
        </div>
    );
};

export interface GatewayErrorProps {
    session: ErroringGatewaySession<any>;
    reason: Error;
}

export const DefaultGatewayError: React.FC<GatewayErrorProps> = ({
    reason,
}) => {
    return (
        <div className="gateway-error">
            Failed to open gateway {reason.toString()}
        </div>
    );
};

export const BasicMint: React.FC<BasicMintProps> = ({
    parameters,
    GatewayInfo = DefaultGatewayInfo,
    GatewayOpening = DefaultGatewayOpening,
    GatewayError = DefaultGatewayError,
    Deposit = DefaultDeposit,
}) => {
    const mint = useLockAndMint(parameters);
    if (mint.state == GatewayStates.CREATING || !isOpen(mint.session)) {
        return <GatewayOpening session={mint.session} />;
    }
    if (
        mint.state == GatewayStates.ERROR_CREATING &&
        isErroring(mint.session)
    ) {
        return (
            <GatewayError session={mint.session} reason={mint.session.error} />
        );
    }
    return (
        <div className="mint-container">
            <GatewayInfo session={mint.session} />
            {mint.deposits.map((x) => (
                <Deposit
                    key={x}
                    session={mint}
                    depositId={x}
                    currency={mint.session.sourceAsset}
                />
            ))}
        </div>
    );
};
