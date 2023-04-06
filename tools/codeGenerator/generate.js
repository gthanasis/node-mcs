const { generateTemplateFiles } = require('generate-template-files');
const config = require('./package.json');

generateTemplateFiles([
    {
        option: 'Create useCase',
        defaultCase: '(pascalCase)',
        entry: {
            folderPath: './templates/useCase',
        },
        stringReplacers: [
            '__useCase__',
            '__useCases__',
        ],
        dynamicReplacers: [
            { slot: '// @ts-nocheck', slotValue: '' }
        ],
        output: {
            path: '../../microservices/control/src/useCases/__useCases__(lowerCase)',
            pathAndFileNameDefaultCase: '(kebabCase)',
            overwrite: true,
        },
    }
]);
