declare const _default: (() => {
    authServerUrl: string;
    realm: string;
    clientId: string;
    clientSecret: string;
    publicKey: string;
    admin: {
        url: string;
        clientId: string;
        clientSecret: string;
        username: string;
        password: string;
    };
    sync: {
        enabled: boolean;
        onCreate: boolean;
        onUpdate: boolean;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    authServerUrl: string;
    realm: string;
    clientId: string;
    clientSecret: string;
    publicKey: string;
    admin: {
        url: string;
        clientId: string;
        clientSecret: string;
        username: string;
        password: string;
    };
    sync: {
        enabled: boolean;
        onCreate: boolean;
        onUpdate: boolean;
    };
}>;
export default _default;
//# sourceMappingURL=keycloak.config.d.ts.map