import * as child_process from 'child_process';
import { PackageContext } from '../../shared/interfaces/package-context';
import { CANCEL } from '../../settings/constants';

// ...

export default function installNuGetPackage(packageContext: PackageContext): Promise<PackageContext> {
    return new Promise((resolve, reject) => {
        const { selectedCSProjs, selectedPackageName, version } = packageContext;

        if (!selectedCSProjs) {
            return reject(CANCEL);
        }

        const promises = selectedCSProjs.map(csprojPath => {
            return new Promise((resolve, reject) => {
                const command = `dotnet add ${csprojPath} package ${selectedPackageName} --version ${version}`;

                child_process.exec(command, (error, stdout, stderr) => {
                    if (error) {
                        reject(error);
                    } else if (stderr) {
                        reject(new Error(stderr));
                    } else {
                        resolve(packageContext);
                    }
                });
            });
        });

        return Promise.all(promises).then(() => packageContext);

    });
}