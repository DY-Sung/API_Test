export class BundleLoader {
    public static bundleMap: Map<string, cc.AssetManager.Bundle> = new Map();

    public static async LoadBundle(name: string): Promise<cc.AssetManager.Bundle> {
        return new Promise<cc.AssetManager.Bundle>((resolve, reject) => {
            let ret = this.bundleMap.get(name);
            if (this.bundleMap.get(name)) {
                resolve(ret);
            }

            cc.assetManager.loadBundle(name, (err, bundle) => {
                if (err) {
                    reject();
                }

                this.bundleMap.set(name, bundle);
                resolve(bundle);
            });
        });
    }

    public static async LoadAssetByBundle<T extends cc.Asset>(
        bundleName: string,
        path: string,
        type: { prototype: T }
    ): Promise<T> {
        const bundle = await this.LoadBundle(bundleName);

        return new Promise<T>((resolve, reject) => {
            bundle.load(path, type, (err, assets) => {
                if (err) {
                    console.error(err);
                    reject();
                }

                resolve(assets as T);
            });
        });
    }
}
