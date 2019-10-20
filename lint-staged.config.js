module.exports = {
    '*': (files) => {
        console.log({ files: JSON.stringify(files, null, 4) });
        let newBuild;
        let command = '';
        files.forEach((file) => {
            if (file.includes('/docs/')) {
                newBuild = true;
            }
        });
        if (newBuild) {
            const docsPath = `${process.cwd()}/docs`;
            command = `git add ${docsPath} && git commit -m "new production build of frontend"`;
        }
        return command;
    },
};
