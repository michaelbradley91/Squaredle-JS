declare module "*.png" {
    const value: unknown;
    export default value;
}

declare module "*.xml" {
    const value: unknown;
    export default value;
}

declare module "*.csv" {
    const value: { [key: string]: string }[];
    export default value;
}
