const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withRemovePermissions(config) {
    return withAndroidManifest(config, async (config) => {
        const androidManifest = config.modResults;

        // Ensure the tools namespace is available
        if (!androidManifest.manifest.$['xmlns:tools']) {
            androidManifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
        }

        const permissionsToRemove = [
            'android.permission.READ_EXTERNAL_STORAGE',
            'android.permission.WRITE_EXTERNAL_STORAGE'
        ];

        // Add tools:node="remove" for each permission we want to strip
        if (!androidManifest.manifest['uses-permission']) {
            androidManifest.manifest['uses-permission'] = [];
        }

        permissionsToRemove.forEach(permissionName => {
            androidManifest.manifest['uses-permission'].push({
                $: {
                    'android:name': permissionName,
                    'tools:node': 'remove',
                }
            });
        });

        return config;
    });
};
